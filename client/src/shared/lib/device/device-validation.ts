/**
 * Device Validation Functions
 * Pure functions for validating device configuration and inputs
 */

import { DeviceConfig } from './types';

/**
 * Validates device configuration before creation/update
 */
export function validateDeviceConfig(config: {
  name: string;
  ip: string;
  type: 'linux' | 'docker' | 'proxmox';
  authType: 'password' | 'key' | 'agent';
  username?: string;
  password?: string;
  privateKey?: string;
  port?: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Name validation
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Device name is required');
  } else if (config.name.length > 50) {
    errors.push('Device name must be 50 characters or less');
  }
  
  // IP validation
  if (!config.ip || config.ip.trim().length === 0) {
    errors.push('IP address is required');
  } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(config.ip)) {
    errors.push('Invalid IP address format');
  }
  
  // Port validation
  if (config.port && (config.port < 1 || config.port > 65535)) {
    errors.push('Port must be between 1 and 65535');
  }
  
  // Authentication validation
  if (config.authType === 'password') {
    if (!config.username) errors.push('Username is required for password authentication');
    if (!config.password) errors.push('Password is required for password authentication');
  } else if (config.authType === 'key') {
    if (!config.username) errors.push('Username is required for key authentication');
    if (!config.privateKey) errors.push('Private key is required for key authentication');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates device name format
 */
export function validateDeviceName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Device name is required' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Device name must be 50 characters or less' };
  }
  
  // Allow alphanumeric, spaces, hyphens, underscores
  const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validNamePattern.test(name)) {
    return { 
      isValid: false, 
      error: 'Device name can only contain letters, numbers, spaces, hyphens, and underscores' 
    };
  }
  
  return { isValid: true };
}

/**
 * Validates IP address format
 */
export function validateIPAddress(ip: string): {
  isValid: boolean;
  error?: string;
} {
  if (!ip || ip.trim().length === 0) {
    return { isValid: false, error: 'IP address is required' };
  }
  
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  if (!ipRegex.test(ip)) {
    return { isValid: false, error: 'Invalid IP address format' };
  }
  
  // Check for reserved IPs
  const parts = ip.split('.').map(Number);
  if (parts[0] === 0) {
    return { isValid: false, error: 'IP address cannot start with 0' };
  }
  
  if (parts[0] === 127) {
    return { isValid: false, error: 'Cannot use loopback addresses' };
  }
  
  return { isValid: true };
}

/**
 * Validates SSH port number
 */
export function validatePort(port: number): {
  isValid: boolean;
  error?: string;
} {
  if (port < 1 || port > 65535) {
    return { isValid: false, error: 'Port must be between 1 and 65535' };
  }
  
  // Warn about well-known ports
  if (port < 1024) {
    return { 
      isValid: true, 
      error: 'Warning: Using a well-known port (< 1024) may require elevated privileges' 
    };
  }
  
  return { isValid: true };
}

/**
 * Validates authentication configuration
 */
export function validateAuthConfig(
  authType: DeviceConfig['authType'],
  config: Partial<DeviceConfig>
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  switch (authType) {
    case 'password':
      if (!config.username) {
        errors.push('Username is required for password authentication');
      }
      if (!config.password) {
        errors.push('Password is required for password authentication');
      }
      break;
      
    case 'key':
      if (!config.username) {
        errors.push('Username is required for key authentication');
      }
      if (!config.privateKey) {
        errors.push('Private key is required for key authentication');
      }
      // Basic key format validation
      if (config.privateKey && !config.privateKey.includes('BEGIN') && !config.privateKey.includes('PRIVATE KEY')) {
        errors.push('Invalid private key format');
      }
      break;
      
    case 'agent':
      // Agent auth doesn't require additional config
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes device configuration for storage
 */
export function sanitizeDeviceConfig(config: DeviceConfig): DeviceConfig {
  return {
    ...config,
    name: config.name.trim(),
    ip: config.ip.trim(),
    username: config.username?.trim(),
    // Don't trim password or keys as they may have meaningful whitespace
  };
}