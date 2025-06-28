import { describe, it, expect } from 'vitest';
import {
  canConnectToDevice,
  isValidIP,
  hasValidAuthConfiguration,
  shouldRetryConnection,
  calculateRetryDelay,
  validateConnectionConfig,
  getConnectionHealth,
  supportsSSH,
  supportsDocker,
  getRecommendedConnectionMethod,
  formatConnectionError,
  estimateConnectionTimeout,
  DEFAULT_CONNECTION_CONFIG,
  ConnectionConfig,
} from '../device-connectivity';
import { Device } from '../types';

// Test data
const mockDevices: Device[] = [
  {
    uuid: 'dev-1',
    name: 'Linux Server',
    ip: '192.168.1.100',
    status: 'online',
    type: 'linux',
    authType: 'key',
    version: '1.0.0',
    capabilities: {
      docker: true,
      proxmox: false,
      containers: true,
      monitoring: true,
      ssh: true,
      ansible: true,
    },
  },
  {
    uuid: 'dev-2',
    name: 'Offline Device',
    ip: '192.168.1.101',
    status: 'offline',
    type: 'docker',
    authType: 'password',
    capabilities: {
      docker: true,
      proxmox: false,
      containers: true,
      monitoring: false,
      ssh: false,
      ansible: false,
    },
  },
  {
    uuid: 'dev-3',
    name: 'Invalid IP Device',
    ip: '999.999.999.999',
    status: 'online',
    type: 'linux',
    authType: 'agent',
    capabilities: {
      docker: false,
      proxmox: false,
      containers: false,
      monitoring: true,
      ssh: true,
      ansible: true,
    },
  },
];

describe('Device Connectivity', () => {
  describe('canConnectToDevice', () => {
    it('should allow connection to online devices with valid config', () => {
      expect(canConnectToDevice(mockDevices[0])).toBe(true);
    });

    it('should not allow connection to offline devices', () => {
      expect(canConnectToDevice(mockDevices[1])).toBe(false);
    });

    it('should not allow connection to devices with invalid IP', () => {
      expect(canConnectToDevice(mockDevices[2])).toBe(false);
    });

    it('should not allow connection to unknown status devices', () => {
      const device: Device = { ...mockDevices[0], status: 'unknown' };
      expect(canConnectToDevice(device)).toBe(false);
    });
  });

  describe('isValidIP', () => {
    it('should validate correct IP addresses', () => {
      expect(isValidIP('192.168.1.1')).toBe(true);
      expect(isValidIP('10.0.0.1')).toBe(true);
      expect(isValidIP('172.16.0.1')).toBe(true);
      expect(isValidIP('8.8.8.8')).toBe(true);
      expect(isValidIP('255.255.255.255')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(isValidIP('256.1.1.1')).toBe(false);
      expect(isValidIP('192.168.1')).toBe(false);
      expect(isValidIP('192.168.1.1.1')).toBe(false);
      expect(isValidIP('abc.def.ghi.jkl')).toBe(false);
      expect(isValidIP('')).toBe(false);
    });
  });

  describe('hasValidAuthConfiguration', () => {
    it('should validate password auth requirements', () => {
      const device: Device = { ...mockDevices[1], authType: 'password' };
      expect(hasValidAuthConfiguration(device)).toBe(true); // Has UUID
    });

    it('should validate key auth requirements', () => {
      const device: Device = { ...mockDevices[0], authType: 'key' };
      expect(hasValidAuthConfiguration(device)).toBe(true); // Has UUID and SSH capability
      
      const noSSH: Device = { ...device, capabilities: { ...device.capabilities, ssh: false } };
      expect(hasValidAuthConfiguration(noSSH)).toBe(false);
    });

    it('should validate agent auth requirements', () => {
      const online: Device = { ...mockDevices[0], authType: 'agent', status: 'online', version: '1.0.0' };
      expect(hasValidAuthConfiguration(online)).toBe(true);
      
      const offline: Device = { ...online, status: 'offline' };
      expect(hasValidAuthConfiguration(offline)).toBe(false);
      
      const noVersion: Device = { ...online, version: undefined };
      expect(hasValidAuthConfiguration(noVersion)).toBe(false);
    });
  });

  describe('shouldRetryConnection', () => {
    it('should allow retry within attempt limit', () => {
      const config: ConnectionConfig = { retryAttempts: 3 };
      expect(shouldRetryConnection(1, config)).toBe(true);
      expect(shouldRetryConnection(2, config)).toBe(true);
      expect(shouldRetryConnection(3, config)).toBe(false);
    });

    it('should not retry on authentication errors', () => {
      const config: ConnectionConfig = { retryAttempts: 3 };
      expect(shouldRetryConnection(1, config, 'Authentication failed')).toBe(false);
      expect(shouldRetryConnection(1, config, 'Permission denied')).toBe(false);
      expect(shouldRetryConnection(1, config, 'Invalid credentials')).toBe(false);
    });

    it('should retry on network errors', () => {
      const config: ConnectionConfig = { retryAttempts: 3 };
      expect(shouldRetryConnection(1, config, 'Connection timeout')).toBe(true);
      expect(shouldRetryConnection(1, config, 'Network unreachable')).toBe(true);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff', () => {
      expect(calculateRetryDelay(1)).toBe(1000); // 1s
      expect(calculateRetryDelay(2)).toBe(2000); // 2s
      expect(calculateRetryDelay(3)).toBe(4000); // 4s
      expect(calculateRetryDelay(4)).toBe(8000); // 8s
    });

    it('should cap delay at 30 seconds', () => {
      expect(calculateRetryDelay(10)).toBe(30000);
      expect(calculateRetryDelay(20)).toBe(30000);
    });

    it('should use custom base delay', () => {
      expect(calculateRetryDelay(1, 500)).toBe(500);
      expect(calculateRetryDelay(2, 500)).toBe(1000);
      expect(calculateRetryDelay(3, 500)).toBe(2000);
    });
  });

  describe('validateConnectionConfig', () => {
    it('should accept valid configurations', () => {
      const config: ConnectionConfig = {
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
      };
      expect(validateConnectionConfig(config)).toEqual([]);
    });

    it('should validate timeout bounds', () => {
      expect(validateConnectionConfig({ timeout: 500 })).toContain('Timeout must be at least 1000ms');
      expect(validateConnectionConfig({ timeout: 400000 })).toContain('Timeout cannot exceed 300000ms (5 minutes)');
    });

    it('should validate retry attempts', () => {
      expect(validateConnectionConfig({ retryAttempts: -1 })).toContain('Retry attempts cannot be negative');
      expect(validateConnectionConfig({ retryAttempts: 15 })).toContain('Retry attempts cannot exceed 10');
    });

    it('should validate retry delay', () => {
      expect(validateConnectionConfig({ retryDelay: 50 })).toContain('Retry delay must be at least 100ms');
      expect(validateConnectionConfig({ retryDelay: 70000 })).toContain('Retry delay cannot exceed 60000ms (1 minute)');
    });
  });

  describe('getConnectionHealth', () => {
    it('should categorize latency correctly', () => {
      expect(getConnectionHealth(30)).toBe('excellent');
      expect(getConnectionHealth(100)).toBe('good');
      expect(getConnectionHealth(200)).toBe('fair');
      expect(getConnectionHealth(500)).toBe('poor');
    });
  });

  describe('supportsSSH', () => {
    it('should identify SSH support', () => {
      expect(supportsSSH(mockDevices[0])).toBe(true); // Linux with SSH
      expect(supportsSSH(mockDevices[1])).toBe(false); // Docker without SSH
      
      const proxmox: Device = { ...mockDevices[0], type: 'proxmox' };
      expect(supportsSSH(proxmox)).toBe(true);
    });
  });

  describe('supportsDocker', () => {
    it('should identify Docker support', () => {
      expect(supportsDocker(mockDevices[0])).toBe(true); // Has docker capability
      expect(supportsDocker(mockDevices[1])).toBe(true); // Docker type
      expect(supportsDocker(mockDevices[2])).toBe(false); // No docker
    });
  });

  describe('getRecommendedConnectionMethod', () => {
    it('should recommend agent for online agent devices', () => {
      const agent: Device = { ...mockDevices[0], authType: 'agent', status: 'online' };
      expect(getRecommendedConnectionMethod(agent)).toBe('agent');
    });

    it('should recommend docker for docker-only devices', () => {
      expect(getRecommendedConnectionMethod(mockDevices[1])).toBe(null); // Offline
      
      const online: Device = { ...mockDevices[1], status: 'online' };
      expect(getRecommendedConnectionMethod(online)).toBe('docker');
    });

    it('should recommend SSH for Linux/Proxmox', () => {
      expect(getRecommendedConnectionMethod(mockDevices[0])).toBe('ssh');
    });

    it('should return null for unconnectable devices', () => {
      expect(getRecommendedConnectionMethod(mockDevices[1])).toBe(null); // Offline
      expect(getRecommendedConnectionMethod(mockDevices[2])).toBe(null); // Invalid IP
    });
  });

  describe('formatConnectionError', () => {
    it('should format known error codes', () => {
      const device = mockDevices[0];
      
      expect(formatConnectionError('ECONNREFUSED', device)).toContain('may be offline or blocking connections');
      expect(formatConnectionError('ETIMEDOUT', device)).toContain('timed out');
      expect(formatConnectionError('EHOSTUNREACH', device)).toContain('Cannot reach');
      expect(formatConnectionError('Authentication failed', device)).toContain('check your credentials');
    });

    it('should handle unknown errors', () => {
      const device = mockDevices[0];
      const error = 'Unknown error occurred';
      expect(formatConnectionError(error, device)).toBe(`Failed to connect to ${device.name}: ${error}`);
    });
  });

  describe('estimateConnectionTimeout', () => {
    it('should use default timeout', () => {
      expect(estimateConnectionTimeout(mockDevices[0])).toBe(DEFAULT_CONNECTION_CONFIG.timeout);
    });

    it('should increase timeout for Proxmox', () => {
      const proxmox: Device = { ...mockDevices[0], type: 'proxmox' };
      expect(estimateConnectionTimeout(proxmox)).toBe(DEFAULT_CONNECTION_CONFIG.timeout * 1.5);
    });

    it('should increase timeout for key auth', () => {
      const device: Device = { ...mockDevices[0], authType: 'key' };
      expect(estimateConnectionTimeout(device)).toBe(DEFAULT_CONNECTION_CONFIG.timeout * 1.2);
    });

    it('should adjust for network latency', () => {
      expect(estimateConnectionTimeout(mockDevices[0], 250)).toBe(DEFAULT_CONNECTION_CONFIG.timeout * 1.5);
      expect(estimateConnectionTimeout(mockDevices[0], 150)).toBe(DEFAULT_CONNECTION_CONFIG.timeout * 1.2);
      expect(estimateConnectionTimeout(mockDevices[0], 50)).toBe(DEFAULT_CONNECTION_CONFIG.timeout);
    });

    it('should cap timeout at 2 minutes', () => {
      const proxmox: Device = { ...mockDevices[0], type: 'proxmox', authType: 'key' };
      const timeout = estimateConnectionTimeout(proxmox, 300);
      expect(timeout).toBeLessThanOrEqual(120000);
    });
  });
});