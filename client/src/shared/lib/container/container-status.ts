/**
 * Container Status Functions
 * Pure functions for container state and health monitoring
 */

import { Container } from './types';

/**
 * Determines if a container is currently active (running or transitioning)
 */
export function isContainerActive(container: Container): boolean {
  return ['running', 'restarting', 'paused'].includes(container.status);
}

/**
 * Determines if a container is in a transitional state
 */
export function isContainerTransitioning(container: Container): boolean {
  return container.status === 'restarting';
}

/**
 * Determines the health status of a container based on its stats
 */
export function getContainerHealth(container: Container): 'healthy' | 'warning' | 'critical' | 'unknown' {
  if (!container.stats || !isContainerActive(container)) return 'unknown';
  
  const { cpu, memory } = container.stats;
  
  // Critical: High CPU and Memory usage
  if (cpu > 90 || memory > 90) return 'critical';
  
  // Warning: Moderate resource usage
  if (cpu > 70 || memory > 70) return 'warning';
  
  return 'healthy';
}

/**
 * Calculates container uptime based on creation date and current status
 */
export function calculateUptime(container: Container): string | null {
  if (!isContainerActive(container)) return null;
  
  const now = new Date();
  const created = new Date(container.createdAt);
  const uptimeMs = now.getTime() - created.getTime();
  
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Gets container status priority for sorting
 */
export function getStatusPriority(status: Container['status']): number {
  const priorities: Record<Container['status'], number> = {
    'running': 0,
    'restarting': 1,
    'paused': 2,
    'created': 3,
    'stopped': 4,
    'exited': 5,
  };
  return priorities[status] ?? 99;
}