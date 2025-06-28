/**
 * Container Port Management Functions
 * Pure functions for port-related operations
 */

import { Container } from './types';

/**
 * Determines if a container has exposed ports
 */
export function hasExposedPorts(container: Container): boolean {
  return container.ports.some(port => port.public !== undefined);
}

/**
 * Gets the primary exposed port for a container
 */
export function getPrimaryPort(container: Container): number | null {
  const exposedPorts = container.ports.filter(port => port.public);
  if (exposedPorts.length === 0) return null;
  
  // Prefer common web ports (80, 443, 8080, etc.)
  const webPorts = exposedPorts.filter(port => 
    [80, 443, 8080, 8443, 3000, 5000, 9000].includes(port.public!)
  );
  
  return webPorts.length > 0 ? webPorts[0].public! : exposedPorts[0].public!;
}

/**
 * Gets all exposed ports for a container
 */
export function getExposedPorts(container: Container): number[] {
  return container.ports
    .filter(port => port.public !== undefined)
    .map(port => port.public!);
}

/**
 * Checks if a port is available (not used by other containers)
 */
export function isPortAvailable(port: number, containers: Container[], excludeId?: string): boolean {
  return !containers.some(container => {
    if (excludeId && container.id === excludeId) return false;
    return container.ports.some(p => p.public === port);
  });
}

/**
 * Gets port mapping display string
 */
export function getPortMappingDisplay(container: Container): string {
  const mappings = container.ports
    .filter(port => port.public)
    .map(port => `${port.public}:${port.private}/${port.type}`);
  
  return mappings.join(', ') || 'No exposed ports';
}