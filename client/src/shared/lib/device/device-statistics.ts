/**
 * Device Statistics Functions
 * Pure functions for calculating and formatting device metrics
 */

import { StatsType } from 'ssm-shared-lib';
import { Device } from './types';
import { isDeviceOnline, needsAttention } from './device-status';
import { supportsContainers } from './device-capabilities';
import type { RingProgressType } from '@shared/ui/patterns/RingProgress/UnifiedRingProgress';

/**
 * Formats device uptime as human-readable string
 */
export function formatUptime(uptimeSeconds: number): string {
  const days = Math.floor(uptimeSeconds / (24 * 60 * 60));
  const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Formats memory usage as human-readable string
 */
export function formatMemoryUsage(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Calculates aggregate statistics for a list of devices
 */
export function calculateDeviceStats(devices: Device[]) {
  const stats = {
    total: devices.length,
    online: 0,
    offline: 0,
    warning: 0,
    unknown: 0,
    
    // Type distribution
    linux: 0,
    docker: 0,
    proxmox: 0,
    
    // Capability distribution
    containerSupport: 0,
    monitoringEnabled: 0,
    sshEnabled: 0,
    ansibleEnabled: 0,
    
    // Performance metrics
    averageCpu: 0,
    averageMemory: 0,
    averageDisk: 0,
    averageLoad: 0,
    totalUptime: 0,
  };
  
  let performanceDevices = 0;
  let totalCpu = 0;
  let totalMemory = 0;
  let totalDisk = 0;
  let totalLoad = 0;
  let totalUptime = 0;
  
  devices.forEach(device => {
    // Status counts
    stats[device.status]++;
    
    // Type counts
    stats[device.type]++;
    
    // Capability counts
    if (supportsContainers(device)) stats.containerSupport++;
    if (device.capabilities.monitoring) stats.monitoringEnabled++;
    if (device.capabilities.ssh) stats.sshEnabled++;
    if (device.capabilities.ansible) stats.ansibleEnabled++;
    
    // Performance metrics
    if (device.stats && isDeviceOnline(device)) {
      performanceDevices++;
      totalCpu += device.stats.cpu;
      totalMemory += device.stats.memory;
      totalDisk += device.stats.disk;
      totalLoad += device.stats.load[0] || 0;
      totalUptime += device.stats.uptime;
    }
  });
  
  // Calculate averages
  if (performanceDevices > 0) {
    stats.averageCpu = totalCpu / performanceDevices;
    stats.averageMemory = totalMemory / performanceDevices;
    stats.averageDisk = totalDisk / performanceDevices;
    stats.averageLoad = totalLoad / performanceDevices;
    stats.totalUptime = totalUptime;
  }
  
  return stats;
}

/**
 * Gets resource usage summary for a device
 */
export function getResourceUsageSummary(device: Device): {
  cpu: string;
  memory: string;
  disk: string;
  status: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
} {
  if (!device.stats || !isDeviceOnline(device)) {
    return {
      cpu: 'N/A',
      memory: 'N/A', 
      disk: 'N/A',
      status: 'unknown',
    };
  }
  
  const { cpu, memory, disk } = device.stats;
  
  // Determine overall status
  let status: 'low' | 'medium' | 'high' | 'critical';
  const maxUsage = Math.max(cpu, memory, disk);
  
  if (maxUsage > 90) {
    status = 'critical';
  } else if (maxUsage > 75) {
    status = 'high';
  } else if (maxUsage > 50) {
    status = 'medium';
  } else {
    status = 'low';
  }
  
  return {
    cpu: `${cpu}%`,
    memory: `${memory}%`,
    disk: `${disk}%`,
    status,
  };
}

/**
 * Calculates trend for device metrics over time
 */
export function calculateMetricTrend(
  currentValue: number,
  previousValue: number
): {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
} {
  const threshold = 5; // 5% change threshold
  const change = currentValue - previousValue;
  const percentageChange = previousValue !== 0 
    ? Math.abs((change / previousValue) * 100)
    : 0;
  
  if (Math.abs(change) < threshold) {
    return { trend: 'stable', percentage: 0 };
  }
  
  return {
    trend: change > 0 ? 'up' : 'down',
    percentage: Math.round(percentageChange),
  };
}

/**
 * Statistic Display Configuration for Ring Progress Components
 */
export interface StatisticDisplayConfig {
  ringType: RingProgressType;
  label: string;
  iconName: string;
  warningThreshold: number;
  dangerThreshold: number;
}

/**
 * Get display configuration for a statistic type
 */
export function getStatisticDisplayConfig(type: StatsType.DeviceStatsType): StatisticDisplayConfig {
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      return {
        ringType: 'cpu',
        label: 'CPU',
        iconName: 'cpu',
        warningThreshold: 70,
        dangerThreshold: 90,
      };
    case StatsType.DeviceStatsType.MEM_USED:
      return {
        ringType: 'memory',
        label: 'Memory',
        iconName: 'ram',
        warningThreshold: 80,
        dangerThreshold: 95,
      };
    case StatsType.DeviceStatsType.DISK_USED:
      return {
        ringType: 'disk',
        label: 'Disk',
        iconName: 'hdd',
        warningThreshold: 85,
        dangerThreshold: 95,
      };
    default:
      return {
        ringType: 'custom',
        label: 'System',
        iconName: 'laptop',
        warningThreshold: 70,
        dangerThreshold: 90,
      };
  }
}

/**
 * Validate statistic value
 */
export function validateStatisticValue(value: any): { isValid: boolean; normalizedValue: number | null } {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, normalizedValue: null };
  }
  
  // Clamp percentage values between 0 and 100
  const normalized = Math.max(0, Math.min(100, value));
  return { isValid: true, normalizedValue: normalized };
}

/**
 * Format statistic date for display
 */
export function formatStatisticDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Generate tooltip text for statistics
 */
export function generateStatisticTooltip(
  config: StatisticDisplayConfig,
  value: number | null,
  date: string,
  hasError: boolean
): string {
  if (hasError || value === null) {
    return `${config.label}: Failed to load data`;
  }
  
  return `${config.label}: ${value}% (Updated: ${date})`;
}

/**
 * Determine health status based on value and thresholds
 */
export function getStatisticHealthStatus(
  value: number,
  warningThreshold: number,
  dangerThreshold: number
): 'healthy' | 'warning' | 'danger' {
  if (value >= dangerThreshold) return 'danger';
  if (value >= warningThreshold) return 'warning';
  return 'healthy';
}