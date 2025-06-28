/**
 * Container Validation Functions
 * Pure functions for validating container configuration
 */

import { ContainerConfig } from './types';

/**
 * Validates container configuration before creation/update
 */
export function validateContainerConfig(config: ContainerConfig): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Name validation
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Container name is required');
  } else if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(config.name)) {
    errors.push('Container name can only contain letters, numbers, underscores, periods, and hyphens');
  }
  
  // Image validation
  if (!config.image || config.image.trim().length === 0) {
    errors.push('Container image is required');
  }
  
  // Port validation
  if (config.ports) {
    config.ports.forEach((port, index) => {
      if (port.private < 1 || port.private > 65535) {
        errors.push(`Port ${index + 1}: Private port must be between 1 and 65535`);
      }
      if (port.public && (port.public < 1 || port.public > 65535)) {
        errors.push(`Port ${index + 1}: Public port must be between 1 and 65535`);
      }
    });
  }
  
  // Volume validation
  if (config.volumes) {
    config.volumes.forEach((volume, index) => {
      if (!volume.source || volume.source.trim().length === 0) {
        errors.push(`Volume ${index + 1}: Source path is required`);
      }
      if (!volume.target || volume.target.trim().length === 0) {
        errors.push(`Volume ${index + 1}: Target path is required`);
      }
      if (!volume.target.startsWith('/')) {
        errors.push(`Volume ${index + 1}: Target path must be absolute`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates container name
 */
export function validateContainerName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Container name is required' };
  }
  
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name)) {
    return { 
      isValid: false, 
      error: 'Container name can only contain letters, numbers, underscores, periods, and hyphens' 
    };
  }
  
  if (name.length > 128) {
    return { isValid: false, error: 'Container name must be 128 characters or less' };
  }
  
  return { isValid: true };
}

/**
 * Validates Docker image name
 */
export function validateImageName(image: string): {
  isValid: boolean;
  error?: string;
} {
  if (!image || image.trim().length === 0) {
    return { isValid: false, error: 'Image name is required' };
  }
  
  // Basic Docker image name validation
  const imageRegex = /^[a-z0-9]+([\._\-\/][a-z0-9]+)*(:[a-zA-Z0-9_\.\-]+)?$/;
  
  if (!imageRegex.test(image)) {
    return { isValid: false, error: 'Invalid Docker image name format' };
  }
  
  return { isValid: true };
}

/**
 * Validates environment variables
 */
export function validateEnvironmentVariables(env: Record<string, string>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  Object.entries(env).forEach(([key, value]) => {
    if (!key || key.trim().length === 0) {
      errors.push('Environment variable name cannot be empty');
    }
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      errors.push(`Invalid environment variable name: ${key}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes container configuration
 */
export function sanitizeContainerConfig(config: ContainerConfig): ContainerConfig {
  return {
    ...config,
    name: config.name.trim(),
    image: config.image.trim(),
  };
}