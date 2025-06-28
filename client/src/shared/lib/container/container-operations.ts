/**
 * Container Operations Functions
 * Pure functions for container operation logic
 */

import { Container } from './types';
import { isContainerActive } from './container-status';

export type ContainerOperation = 'start' | 'stop' | 'restart' | 'pause' | 'unpause' | 'remove';

/**
 * Validates if a container operation can be performed
 */
export function canPerformOperation(container: Container, operation: ContainerOperation): {
  canPerform: boolean;
  reason?: string;
} {
  switch (operation) {
    case 'start':
      if (container.status === 'running') {
        return { canPerform: false, reason: 'Container is already running' };
      }
      if (container.status === 'paused') {
        return { canPerform: false, reason: 'Container is paused. Unpause it first' };
      }
      return { canPerform: true };
    
    case 'stop':
      if (!isContainerActive(container)) {
        return { canPerform: false, reason: 'Container is not running' };
      }
      return { canPerform: true };
    
    case 'restart':
      if (container.status === 'paused') {
        return { canPerform: false, reason: 'Cannot restart paused container' };
      }
      return { canPerform: true };
    
    case 'pause':
      if (container.status !== 'running') {
        return { canPerform: false, reason: 'Can only pause running containers' };
      }
      return { canPerform: true };
    
    case 'unpause':
      if (container.status !== 'paused') {
        return { canPerform: false, reason: 'Container is not paused' };
      }
      return { canPerform: true };
    
    case 'remove':
      if (container.status === 'running') {
        return { canPerform: false, reason: 'Cannot remove running container. Stop it first' };
      }
      return { canPerform: true };
    
    default:
      return { canPerform: false, reason: 'Unknown operation' };
  }
}

/**
 * Gets available operations for a container based on its state
 */
export function getAvailableOperations(container: Container): ContainerOperation[] {
  const operations: ContainerOperation[] = ['start', 'stop', 'restart', 'pause', 'unpause', 'remove'];
  
  return operations.filter(op => canPerformOperation(container, op).canPerform);
}

/**
 * Groups containers by operation eligibility
 */
export function groupContainersByOperation(
  containers: Container[],
  operation: ContainerOperation
): {
  eligible: Container[];
  ineligible: Array<{ container: Container; reason: string }>;
} {
  const eligible: Container[] = [];
  const ineligible: Array<{ container: Container; reason: string }> = [];
  
  containers.forEach(container => {
    const result = canPerformOperation(container, operation);
    if (result.canPerform) {
      eligible.push(container);
    } else {
      ineligible.push({ container, reason: result.reason || 'Unknown reason' });
    }
  });
  
  return { eligible, ineligible };
}