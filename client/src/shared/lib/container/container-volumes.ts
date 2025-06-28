/**
 * Container Volume Functions
 * Pure functions for volume-related operations
 */

import { Container } from './types';

/**
 * Determines if a container has volume mounts
 */
export function hasVolumeMounts(container: Container): boolean {
  return container.volumes.length > 0;
}

/**
 * Gets all volume mounts for a container
 */
export function getVolumeMounts(container: Container): Container['volumes'] {
  return container.volumes;
}

/**
 * Checks if container has bind mounts
 */
export function hasBindMounts(container: Container): boolean {
  return container.volumes.some(vol => vol.type === 'bind');
}

/**
 * Checks if container has named volumes
 */
export function hasNamedVolumes(container: Container): boolean {
  return container.volumes.some(vol => vol.type === 'volume');
}

/**
 * Gets volume mount display string
 */
export function getVolumeMountDisplay(container: Container): string {
  const mounts = container.volumes.map(vol => 
    `${vol.source} → ${vol.target} (${vol.type})`
  );
  
  return mounts.join(', ') || 'No volumes';
}

/**
 * Validates volume path
 */
export function isValidVolumePath(path: string): boolean {
  // Must be absolute path
  return path.startsWith('/');
}