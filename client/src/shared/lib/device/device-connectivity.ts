/**
 * Device Connectivity Business Logic - Pure TypeScript Functions
 * Handles device connection validation, status checks, and connectivity rules
 */

import { Device } from './types';

/**
 * Connection status types
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'timeout';

export interface ConnectionConfig {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ConnectionResult {
  status: ConnectionStatus;
  message?: string;
  timestamp: Date;
  latency?: number;
}

/**
 * Default connection configuration
 */
export const DEFAULT_CONNECTION_CONFIG: Required<ConnectionConfig> = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Validates if a device can be connected to
 */
export function canConnectToDevice(device: Device): boolean {
  // Can't connect to offline or unknown status devices
  if (device.status === 'offline' || device.status === 'unknown') {
    return false;
  }
  
  // Need valid IP and auth configuration
  if (!device.ip || !isValidIP(device.ip)) {
    return false;
  }
  
  // Check auth requirements based on type
  return hasValidAuthConfiguration(device);
}

/**
 * Validates IP address format
 */
export function isValidIP(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

/**
 * Checks if device has valid authentication configuration
 */
export function hasValidAuthConfiguration(device: Device): boolean {
  switch (device.authType) {
    case 'password':
      // Password auth requires username and password to be configured
      return !!device.uuid; // In real app, would check if credentials are stored
    
    case 'key':
      // Key auth requires username and private key to be configured
      return !!device.uuid && device.capabilities.ssh;
    
    case 'agent':
      // Agent auth requires agent to be installed and running
      return !!device.version && device.status === 'online';
    
    default:
      return false;
  }
}

/**
 * Determines if a connection attempt should be retried
 */
export function shouldRetryConnection(
  attempt: number,
  config: ConnectionConfig,
  lastError?: string
): boolean {
  const maxAttempts = config.retryAttempts ?? DEFAULT_CONNECTION_CONFIG.retryAttempts;
  
  // Don't retry if max attempts reached
  if (attempt >= maxAttempts) {
    return false;
  }
  
  // Don't retry on certain errors
  const nonRetryableErrors = [
    'Authentication failed',
    'Invalid credentials',
    'Permission denied',
    'Host key verification failed',
  ];
  
  if (lastError && nonRetryableErrors.some(err => lastError.includes(err))) {
    return false;
  }
  
  return true;
}

/**
 * Calculates retry delay with exponential backoff
 */
export function calculateRetryDelay(attempt: number, baseDelay?: number): number {
  const base = baseDelay ?? DEFAULT_CONNECTION_CONFIG.retryDelay;
  // Exponential backoff: 1s, 2s, 4s, 8s...
  return Math.min(base * Math.pow(2, attempt - 1), 30000); // Cap at 30 seconds
}

/**
 * Validates connection configuration
 */
export function validateConnectionConfig(config: ConnectionConfig): string[] {
  const errors: string[] = [];
  
  if (config.timeout !== undefined) {
    if (config.timeout < 1000) {
      errors.push('Timeout must be at least 1000ms');
    }
    if (config.timeout > 300000) {
      errors.push('Timeout cannot exceed 300000ms (5 minutes)');
    }
  }
  
  if (config.retryAttempts !== undefined) {
    if (config.retryAttempts < 0) {
      errors.push('Retry attempts cannot be negative');
    }
    if (config.retryAttempts > 10) {
      errors.push('Retry attempts cannot exceed 10');
    }
  }
  
  if (config.retryDelay !== undefined) {
    if (config.retryDelay < 100) {
      errors.push('Retry delay must be at least 100ms');
    }
    if (config.retryDelay > 60000) {
      errors.push('Retry delay cannot exceed 60000ms (1 minute)');
    }
  }
  
  return errors;
}

/**
 * Determines connection health based on latency
 */
export function getConnectionHealth(latency: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (latency < 50) return 'excellent';
  if (latency < 150) return 'good';
  if (latency < 300) return 'fair';
  return 'poor';
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
 * Gets recommended connection method for device
 */
export function getRecommendedConnectionMethod(device: Device): 'ssh' | 'agent' | 'docker' | null {
  if (!canConnectToDevice(device)) {
    return null;
  }
  
  // Prefer agent if available and online
  if (device.authType === 'agent' && device.status === 'online') {
    return 'agent';
  }
  
  // Use Docker API for Docker-only devices
  if (device.type === 'docker' && supportsDocker(device)) {
    return 'docker';
  }
  
  // Default to SSH for Linux/Proxmox
  if (supportsSSH(device)) {
    return 'ssh';
  }
  
  return null;
}

/**
 * Formats connection error for user display
 */
export function formatConnectionError(error: string, device: Device): string {
  // Map technical errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'ECONNREFUSED': `Cannot connect to ${device.name} at ${device.ip}. The device may be offline or blocking connections.`,
    'ETIMEDOUT': `Connection to ${device.name} timed out. Please check network connectivity.`,
    'EHOSTUNREACH': `Cannot reach ${device.name}. Please verify the IP address and network configuration.`,
    'Authentication failed': `Authentication failed for ${device.name}. Please check your credentials.`,
    'Permission denied': `Permission denied when connecting to ${device.name}. Please verify your access rights.`,
  };
  
  for (const [key, message] of Object.entries(errorMappings)) {
    if (error.includes(key)) {
      return message;
    }
  }
  
  return `Failed to connect to ${device.name}: ${error}`;
}

/**
 * Estimates connection timeout based on device type and network conditions
 */
export function estimateConnectionTimeout(device: Device, averageLatency?: number): number {
  let baseTimeout = DEFAULT_CONNECTION_CONFIG.timeout;
  
  // Adjust based on device type
  if (device.type === 'proxmox') {
    baseTimeout *= 1.5; // Proxmox connections may take longer
  }
  
  // Adjust based on auth type
  if (device.authType === 'key') {
    baseTimeout *= 1.2; // Key auth can be slower
  }
  
  // Adjust based on network latency if known
  if (averageLatency) {
    if (averageLatency > 200) {
      baseTimeout *= 1.5; // High latency network
    } else if (averageLatency > 100) {
      baseTimeout *= 1.2; // Moderate latency
    }
  }
  
  return Math.min(baseTimeout, 120000); // Cap at 2 minutes
}