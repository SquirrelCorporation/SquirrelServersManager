/**
 * Device Filtering and Sorting Functions
 * Pure functions for filtering, searching, and organizing devices
 */

import { Device, DeviceFilters } from './types';
import { supportsContainers } from './device-capabilities';
import { getPerformanceScore } from './device-status';

/**
 * Filters devices based on the provided criteria
 */
export function filterDevices(devices: Device[], filters: DeviceFilters): Device[] {
  return devices.filter(device => {
    // Search filter - matches name, IP, or UUID
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = device.name.toLowerCase().includes(searchLower);
      const matchesIp = device.ip.includes(searchLower);
      const matchesUuid = device.uuid.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesIp && !matchesUuid) {
        return false;
      }
    }
    
    // Status filter
    if (filters.status?.length && !filters.status.includes(device.status)) {
      return false;
    }
    
    // Type filter
    if (filters.type?.length && !filters.type.includes(device.type)) {
      return false;
    }
    
    // Capabilities filter
    if (filters.capabilities?.length) {
      const hasAllCapabilities = filters.capabilities.every(cap => 
        device.capabilities[cap] === true
      );
      if (!hasAllCapabilities) {
        return false;
      }
    }
    
    // Container support filter
    if (filters.hasContainers !== undefined) {
      if (filters.hasContainers !== supportsContainers(device)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Sorts devices by the specified criteria
 */
export function sortDevices(
  devices: Device[], 
  sortBy: 'name' | 'status' | 'type' | 'lastSeen' | 'performance',
  sortOrder: 'asc' | 'desc' = 'asc'
): Device[] {
  const sorted = [...devices].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'status':
        // Online first, then warning, then offline
        const statusOrder = { online: 0, warning: 1, offline: 2, unknown: 3 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'lastSeen':
        const aTime = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
        const bTime = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
        comparison = aTime - bTime;
        break;
      case 'performance':
        const aPerf = getPerformanceScore(a) || 0;
        const bPerf = getPerformanceScore(b) || 0;
        comparison = aPerf - bPerf;
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}

/**
 * Groups devices by their status
 */
export function groupDevicesByStatus(devices: Device[]): Record<string, Device[]> {
  return devices.reduce((groups, device) => {
    const status = device.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(device);
    return groups;
  }, {} as Record<string, Device[]>);
}

/**
 * Groups devices by their type
 */
export function groupDevicesByType(devices: Device[]): Record<string, Device[]> {
  return devices.reduce((groups, device) => {
    const type = device.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(device);
    return groups;
  }, {} as Record<string, Device[]>);
}

/**
 * Searches devices by query across multiple fields
 */
export function searchDevices(devices: Device[], query: string): Device[] {
  if (!query || query.trim().length === 0) {
    return devices;
  }
  
  const searchLower = query.toLowerCase();
  
  return devices.filter(device => {
    const searchableFields = [
      device.name,
      device.ip,
      device.uuid,
      device.type,
      device.status,
      device.authType,
    ];
    
    return searchableFields.some(field => 
      field?.toLowerCase().includes(searchLower)
    );
  });
}