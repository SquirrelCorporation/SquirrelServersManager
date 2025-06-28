/**
 * Device Capabilities Functions
 * Pure functions for checking device features and capabilities
 */

import { Device } from './types';

/**
 * Determines if a device supports container operations
 */
export function supportsContainers(device: Device): boolean {
  return device.capabilities.containers || device.capabilities.docker;
}

/**
 * Determines if a device supports monitoring/metrics collection
 */
export function supportsMonitoring(device: Device): boolean {
  return device.capabilities.monitoring;
}

/**
 * Checks if device supports SSH connections
 */
export function supportsSSH(device: Device): boolean {
  return device.capabilities.ssh && ['linux', 'proxmox'].includes(device.type);
}

/**
 * Checks if device supports Docker connections
 */
export function supportsDocker(device: Device): boolean {
  return device.capabilities.docker || device.type === 'docker';
}

/**
 * Checks if device supports Ansible operations
 */
export function supportsAnsible(device: Device): boolean {
  return device.capabilities.ansible;
}

/**
 * Checks if device supports Proxmox operations
 */
export function supportsProxmox(device: Device): boolean {
  return device.capabilities.proxmox || device.type === 'proxmox';
}

/**
 * Gets all supported features for a device
 */
export function getSupportedFeatures(device: Device): string[] {
  const features: string[] = [];
  
  if (supportsContainers(device)) features.push('containers');
  if (supportsMonitoring(device)) features.push('monitoring');
  if (supportsSSH(device)) features.push('ssh');
  if (supportsDocker(device)) features.push('docker');
  if (supportsAnsible(device)) features.push('ansible');
  if (supportsProxmox(device)) features.push('proxmox');
  
  return features;
}

/**
 * Checks if device has all required capabilities
 */
export function hasRequiredCapabilities(
  device: Device, 
  required: (keyof Device['capabilities'])[]
): boolean {
  return required.every(capability => device.capabilities[capability]);
}

/**
 * Checks if device has any of the specified capabilities
 */
export function hasAnyCapability(
  device: Device, 
  capabilities: (keyof Device['capabilities'])[]
): boolean {
  return capabilities.some(capability => device.capabilities[capability]);
}