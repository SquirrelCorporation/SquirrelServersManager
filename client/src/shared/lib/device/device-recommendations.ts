/**
 * Device Recommendation Functions
 * Pure functions for generating device action recommendations
 */

import { Device, DeviceConfig } from './types';

/**
 * Determines if a device configuration change requires reconnection
 */
export function requiresReconnection(
  oldConfig: Partial<DeviceConfig>, 
  newConfig: Partial<DeviceConfig>
): boolean {
  const reconnectionFields: Array<keyof DeviceConfig> = ['ip', 'authType', 'username', 'password', 'privateKey', 'port'];
  
  return reconnectionFields.some(field => {
    // Check if the field exists in either config and has changed
    if (field in oldConfig || field in newConfig) {
      return oldConfig[field] !== newConfig[field];
    }
    return false;
  });
}

/**
 * Gets recommended actions for a device based on its status and configuration
 */
export function getRecommendedActions(device: Device): Array<{
  action: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}> {
  const actions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }> = [];
  
  // High priority actions
  if (device.status === 'offline') {
    actions.push({
      action: 'reconnect',
      priority: 'high',
      description: 'Device is offline - check connection',
    });
  }
  
  if (device.stats && device.stats.disk > 90) {
    actions.push({
      action: 'free_disk_space',
      priority: 'high',
      description: 'Disk usage is critically high',
    });
  }
  
  // Medium priority actions
  if (device.stats && device.stats.memory > 80) {
    actions.push({
      action: 'check_memory',
      priority: 'medium',
      description: 'Memory usage is high',
    });
  }
  
  if (!device.capabilities.monitoring) {
    actions.push({
      action: 'enable_monitoring',
      priority: 'medium',
      description: 'Enable monitoring for better insights',
    });
  }
  
  // Low priority actions
  if (!device.version) {
    actions.push({
      action: 'update_agent',
      priority: 'low',
      description: 'Update device agent to latest version',
    });
  }
  
  return actions;
}