/**
 * Device Status Functions
 * Pure functions for device status checks and health monitoring
 */

import { Device } from './types';

/**
 * Determines if a device is currently online and responsive
 */
export function isDeviceOnline(device: Device): boolean {
  return device.status === 'online';
}

/**
 * Determines if a device needs attention (warning or offline)
 */
export function needsAttention(device: Device): boolean {
  return ['warning', 'offline'].includes(device.status);
}

/**
 * Determines the health status of a device based on its stats
 */
export function getDeviceHealth(device: Device): 'healthy' | 'warning' | 'critical' | 'unknown' {
  if (!device.stats || !isDeviceOnline(device)) return 'unknown';
  
  const { cpu, memory, disk, load } = device.stats;
  
  // Critical: Very high resource usage
  if (cpu > 95 || memory > 95 || disk > 95 || (load[0] && load[0] > 10)) {
    return 'critical';
  }
  
  // Warning: High resource usage
  if (cpu > 80 || memory > 80 || disk > 85 || (load[0] && load[0] > 5)) {
    return 'warning';
  }
  
  return 'healthy';
}

/**
 * Gets device performance score (0-100)
 */
export function getPerformanceScore(device: Device): number | null {
  if (!device.stats || !isDeviceOnline(device)) return null;
  
  const { cpu, memory, disk, load } = device.stats;
  
  // Calculate individual scores (higher is better)
  const cpuScore = Math.max(0, 100 - cpu);
  const memoryScore = Math.max(0, 100 - memory);
  const diskScore = Math.max(0, 100 - disk);
  const loadScore = load[0] ? Math.max(0, 100 - (load[0] * 10)) : 100;
  
  // Weighted average
  const totalScore = (cpuScore * 0.3 + memoryScore * 0.3 + diskScore * 0.25 + loadScore * 0.15);
  
  return Math.round(totalScore);
}

/**
 * Calculates how long since the device was last seen
 */
export function getLastSeenDuration(device: Device): string | null {
  if (!device.lastSeen || device.status === 'online') return null;
  
  const now = new Date();
  const lastSeen = new Date(device.lastSeen);
  const diffMs = now.getTime() - lastSeen.getTime();
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}