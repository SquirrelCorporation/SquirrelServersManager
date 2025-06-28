/**
 * Device Operations Business Logic - Pure TypeScript Functions
 * Handles CRUD operations, bulk actions, and device management rules
 */

import { Device, DeviceConfig, DeviceFilters } from './types';
import { isDeviceOnline, needsAttention } from './device-status';
import { supportsContainers, supportsMonitoring } from './device-capabilities';

/**
 * Device operation types
 */
export type DeviceOperation = 'create' | 'update' | 'delete' | 'connect' | 'disconnect' | 'refresh';

export interface BulkOperationResult {
  successful: string[]; // Device UUIDs
  failed: Array<{ uuid: string; error: string }>;
  total: number;
}

/**
 * Validates if a device operation can be performed
 */
export function canPerformOperation(device: Device, operation: DeviceOperation): {
  canPerform: boolean;
  reason?: string;
} {
  switch (operation) {
    case 'create':
      // Create is always allowed (no existing device)
      return { canPerform: true };
    
    case 'update':
      // Can update any device
      return { canPerform: true };
    
    case 'delete':
      // Can't delete online devices (safety)
      if (device.status === 'online') {
        return { canPerform: false, reason: 'Cannot delete online devices. Disconnect first.' };
      }
      return { canPerform: true };
    
    case 'connect':
      // Must be offline to connect
      if (device.status === 'online') {
        return { canPerform: false, reason: 'Device is already connected' };
      }
      return { canPerform: true };
    
    case 'disconnect':
      // Must be online to disconnect
      if (device.status !== 'online') {
        return { canPerform: false, reason: 'Device is not connected' };
      }
      return { canPerform: true };
    
    case 'refresh':
      // Can only refresh online devices
      if (device.status !== 'online') {
        return { canPerform: false, reason: 'Can only refresh online devices' };
      }
      return { canPerform: true };
    
    default:
      return { canPerform: false, reason: 'Unknown operation' };
  }
}

/**
 * Filters devices that can perform a specific operation
 */
export function filterDevicesForOperation(devices: Device[], operation: DeviceOperation): Device[] {
  return devices.filter(device => canPerformOperation(device, operation).canPerform);
}

/**
 * Validates device configuration changes
 */
export function validateDeviceUpdate(
  currentDevice: Device,
  updates: Partial<DeviceConfig>
): string[] {
  const errors: string[] = [];
  
  // Can't change device type if it has active services
  if (updates.type && updates.type !== currentDevice.type) {
    if (currentDevice.status === 'online') {
      errors.push('Cannot change device type while online');
    }
    
    // Check for type-specific constraints
    if (currentDevice.type === 'docker' && currentDevice.services?.some(s => s.status === 'running')) {
      errors.push('Cannot change type: device has running Docker services');
    }
  }
  
  // Auth type changes require reconnection
  if (updates.authType && updates.authType !== currentDevice.authType) {
    if (currentDevice.status === 'online') {
      errors.push('Cannot change authentication type while connected');
    }
  }
  
  // IP changes require validation
  if (updates.ip && updates.ip !== currentDevice.ip) {
    if (currentDevice.status === 'online') {
      errors.push('Cannot change IP address while connected');
    }
  }
  
  return errors;
}


/**
 * Groups devices by operation eligibility
 */
export function groupDevicesByOperationEligibility(
  devices: Device[],
  operation: DeviceOperation
): {
  eligible: Device[];
  ineligible: Array<{ device: Device; reason: string }>;
} {
  const eligible: Device[] = [];
  const ineligible: Array<{ device: Device; reason: string }> = [];
  
  devices.forEach(device => {
    const result = canPerformOperation(device, operation);
    if (result.canPerform) {
      eligible.push(device);
    } else {
      ineligible.push({ device, reason: result.reason || 'Unknown reason' });
    }
  });
  
  return { eligible, ineligible };
}

/**
 * Calculates the impact of a bulk operation
 */
export function calculateBulkOperationImpact(
  devices: Device[],
  operation: DeviceOperation
): {
  affectedContainers: number;
  affectedServices: number;
  requiresDowntime: boolean;
} {
  let affectedContainers = 0;
  let affectedServices = 0;
  let requiresDowntime = false;
  
  devices.forEach(device => {
    // Check container impact
    if (supportsContainers(device) && device.status === 'online') {
      affectedContainers += device.stats?.cpu ? 1 : 0; // Simplified - would check actual containers
    }
    
    // Check service impact
    if (device.services) {
      affectedServices += device.services.filter(s => s.status === 'running').length;
    }
    
    // Check if operation requires downtime
    if (operation === 'disconnect' || operation === 'delete') {
      if (device.status === 'online') {
        requiresDowntime = true;
      }
    }
  });
  
  return { affectedContainers, affectedServices, requiresDowntime };
}

/**
 * Suggests bulk operations based on device states
 */
export function suggestBulkOperations(devices: Device[]): Array<{
  operation: DeviceOperation;
  deviceCount: number;
  reason: string;
}> {
  const suggestions: Array<{
    operation: DeviceOperation;
    deviceCount: number;
    reason: string;
  }> = [];
  
  // Suggest connecting offline devices
  const offlineDevices = devices.filter(d => d.status === 'offline');
  if (offlineDevices.length > 0) {
    suggestions.push({
      operation: 'connect',
      deviceCount: offlineDevices.length,
      reason: `${offlineDevices.length} devices are offline and can be connected`,
    });
  }
  
  // Suggest refreshing devices needing attention
  const needingAttention = devices.filter(needsAttention);
  if (needingAttention.length > 0) {
    const onlineNeedingAttention = needingAttention.filter(d => d.status === 'online');
    if (onlineNeedingAttention.length > 0) {
      suggestions.push({
        operation: 'refresh',
        deviceCount: onlineNeedingAttention.length,
        reason: `${onlineNeedingAttention.length} devices need attention and can be refreshed`,
      });
    }
  }
  
  return suggestions;
}

/**
 * Validates bulk operation selection
 */
export function validateBulkSelection(
  devices: Device[],
  operation: DeviceOperation
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (devices.length === 0) {
    errors.push('No devices selected');
    return { isValid: false, errors, warnings };
  }
  
  // Check if any devices can perform the operation
  const eligibility = groupDevicesByOperationEligibility(devices, operation);
  
  if (eligibility.eligible.length === 0) {
    errors.push(`None of the selected devices can perform '${operation}' operation`);
  }
  
  if (eligibility.ineligible.length > 0) {
    warnings.push(
      `${eligibility.ineligible.length} device(s) cannot perform this operation`
    );
  }
  
  // Check impact
  const impact = calculateBulkOperationImpact(devices, operation);
  
  if (impact.requiresDowntime) {
    warnings.push('This operation will cause downtime for some devices');
  }
  
  if (impact.affectedServices > 0) {
    warnings.push(`${impact.affectedServices} running services will be affected`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Prioritizes devices for operations based on various factors
 */
export function prioritizeDevicesForOperation(
  devices: Device[],
  operation: DeviceOperation
): Device[] {
  return [...devices].sort((a, b) => {
    // First, prioritize by eligibility
    const aEligible = canPerformOperation(a, operation).canPerform;
    const bEligible = canPerformOperation(b, operation).canPerform;
    
    if (aEligible && !bEligible) return -1;
    if (!aEligible && bEligible) return 1;
    
    // For refresh operations, prioritize devices needing attention
    if (operation === 'refresh') {
      const aNeedsAttention = needsAttention(a);
      const bNeedsAttention = needsAttention(b);
      
      if (aNeedsAttention && !bNeedsAttention) return -1;
      if (!aNeedsAttention && bNeedsAttention) return 1;
    }
    
    // For connect operations, prioritize by last seen (most recent first)
    if (operation === 'connect') {
      const aLastSeen = a.lastSeen?.getTime() || 0;
      const bLastSeen = b.lastSeen?.getTime() || 0;
      return bLastSeen - aLastSeen;
    }
    
    // Default: alphabetical by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Estimates operation duration based on device and operation type
 */
export function estimateOperationDuration(
  device: Device,
  operation: DeviceOperation
): number {
  // Base durations in milliseconds
  const baseDurations: Record<DeviceOperation, number> = {
    create: 5000,
    update: 2000,
    delete: 3000,
    connect: 10000,
    disconnect: 2000,
    refresh: 5000,
  };
  
  let duration = baseDurations[operation];
  
  // Adjust based on device type
  if (device.type === 'proxmox' && (operation === 'connect' || operation === 'refresh')) {
    duration *= 1.5; // Proxmox operations take longer
  }
  
  // Adjust based on auth type
  if (device.authType === 'key' && operation === 'connect') {
    duration *= 1.2; // Key auth slightly slower
  }
  
  return duration;
}

/**
 * Formats operation result for user display
 */
export function formatOperationResult(
  operation: DeviceOperation,
  result: BulkOperationResult
): string {
  const successRate = (result.successful.length / result.total) * 100;
  
  if (result.failed.length === 0) {
    return `Successfully completed ${operation} on all ${result.total} device(s)`;
  }
  
  if (result.successful.length === 0) {
    return `Failed to ${operation} any devices (0/${result.total})`;
  }
  
  return `Completed ${operation} on ${result.successful.length}/${result.total} device(s) (${successRate.toFixed(0)}% success)`;
}