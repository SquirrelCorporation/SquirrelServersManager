/**
 * Container Statistics Functions
 * Pure functions for calculating and formatting container metrics
 */

import { Container } from './types';
import { isContainerActive } from './container-status';
import { hasExposedPorts } from './container-ports';
import { hasVolumeMounts } from './container-volumes';

/**
 * Formats container memory usage as human-readable string
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
 * Calculates aggregate statistics for a list of containers
 */
export function calculateContainerStats(containers: Container[]) {
  const stats = {
    total: containers.length,
    running: 0,
    stopped: 0,
    failed: 0,
    totalCpu: 0,
    totalMemory: 0,
    averageCpu: 0,
    averageMemory: 0,
    exposedPorts: 0,
    volumeMounts: 0,
  };
  
  containers.forEach(container => {
    // Status counts
    if (isContainerActive(container)) {
      stats.running++;
    } else if (container.status === 'stopped') {
      stats.stopped++;
    } else {
      stats.failed++;
    }
    
    // Resource usage
    if (container.stats) {
      stats.totalCpu += container.stats.cpu;
      stats.totalMemory += container.stats.memory;
    }
    
    // Feature counts
    if (hasExposedPorts(container)) {
      stats.exposedPorts++;
    }
    
    if (hasVolumeMounts(container)) {
      stats.volumeMounts++;
    }
  });
  
  // Calculate averages
  const activeContainers = containers.filter(c => c.stats).length;
  if (activeContainers > 0) {
    stats.averageCpu = stats.totalCpu / activeContainers;
    stats.averageMemory = stats.totalMemory / activeContainers;
  }
  
  return stats;
}

/**
 * Gets resource usage summary for a container
 */
export function getResourceUsageSummary(container: Container): {
  cpu: string;
  memory: string;
  network: string;
  status: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
} {
  if (!container.stats || !isContainerActive(container)) {
    return {
      cpu: 'N/A',
      memory: 'N/A',
      network: 'N/A',
      status: 'unknown',
    };
  }
  
  const { cpu, memory, network } = container.stats;
  
  // Determine overall status
  let status: 'low' | 'medium' | 'high' | 'critical';
  const maxUsage = Math.max(cpu, memory);
  
  if (maxUsage > 90) {
    status = 'critical';
  } else if (maxUsage > 70) {
    status = 'high';
  } else if (maxUsage > 50) {
    status = 'medium';
  } else {
    status = 'low';
  }
  
  return {
    cpu: `${cpu}%`,
    memory: `${memory}%`,
    network: `↓${formatMemoryUsage(network.rx)}/s ↑${formatMemoryUsage(network.tx)}/s`,
    status,
  };
}

/**
 * Calculates total resource usage for multiple containers
 */
export function calculateTotalResourceUsage(containers: Container[]): {
  cpu: number;
  memory: number;
  networkRx: number;
  networkTx: number;
} {
  return containers.reduce((total, container) => {
    if (container.stats && isContainerActive(container)) {
      total.cpu += container.stats.cpu;
      total.memory += container.stats.memory;
      total.networkRx += container.stats.network.rx;
      total.networkTx += container.stats.network.tx;
    }
    return total;
  }, { cpu: 0, memory: 0, networkRx: 0, networkTx: 0 });
}