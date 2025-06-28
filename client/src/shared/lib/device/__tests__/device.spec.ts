import { describe, it, expect } from 'vitest';
import {
  Device,
  DeviceFilters,
  isDeviceOnline,
  needsAttention,
  supportsContainers,
  supportsMonitoring,
  getLastSeenDuration,
  formatUptime,
  getDeviceHealth,
  getPerformanceScore,
  filterDevices,
  sortDevices,
  groupDevicesByStatus,
  groupDevicesByType,
  calculateDeviceStats,
  validateDeviceConfig,
  requiresReconnection,
  getRecommendedActions,
} from '../index';

// ============================================================================
// TEST DATA
// ============================================================================

const mockDevices: Device[] = [
  {
    uuid: 'dev-1',
    name: 'Production Server',
    ip: '192.168.1.100',
    status: 'online',
    type: 'linux',
    authType: 'key',
    lastSeen: new Date(),
    version: '1.0.0',
    capabilities: {
      docker: true,
      proxmox: false,
      containers: true,
      monitoring: true,
      ssh: true,
      ansible: true,
    },
    stats: {
      cpu: 45,
      memory: 60,
      disk: 70,
      uptime: 86400 * 7, // 7 days
      load: [2.5, 2.0, 1.8],
    },
    services: [
      { name: 'docker', status: 'running', port: 2375 },
      { name: 'ssh', status: 'running', port: 22 },
    ],
  },
  {
    uuid: 'dev-2',
    name: 'Database Server',
    ip: '192.168.1.101',
    status: 'offline',
    type: 'docker',
    authType: 'password',
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
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
    name: 'Proxmox Node',
    ip: '192.168.1.102',
    status: 'warning',
    type: 'proxmox',
    authType: 'agent',
    lastSeen: new Date(),
    version: '2.0.0',
    capabilities: {
      docker: false,
      proxmox: true,
      containers: false,
      monitoring: true,
      ssh: true,
      ansible: true,
    },
    stats: {
      cpu: 85,
      memory: 82,
      disk: 50,
      uptime: 3600 * 12, // 12 hours
      load: [6.0, 5.5, 5.2],
    },
  },
];

// ============================================================================
// DEVICE STATE TESTS
// ============================================================================

describe('Device State Functions', () => {
  describe('isDeviceOnline', () => {
    it('should correctly identify online devices', () => {
      expect(isDeviceOnline(mockDevices[0])).toBe(true);
      expect(isDeviceOnline(mockDevices[1])).toBe(false);
      expect(isDeviceOnline(mockDevices[2])).toBe(false);
    });
  });

  describe('needsAttention', () => {
    it('should identify devices needing attention', () => {
      expect(needsAttention(mockDevices[0])).toBe(false); // online
      expect(needsAttention(mockDevices[1])).toBe(true); // offline
      expect(needsAttention(mockDevices[2])).toBe(true); // warning
    });
  });

  describe('supportsContainers', () => {
    it('should identify container support', () => {
      expect(supportsContainers(mockDevices[0])).toBe(true); // has docker
      expect(supportsContainers(mockDevices[1])).toBe(true); // has containers
      expect(supportsContainers(mockDevices[2])).toBe(false); // no container support
    });
  });

  describe('supportsMonitoring', () => {
    it('should identify monitoring support', () => {
      expect(supportsMonitoring(mockDevices[0])).toBe(true);
      expect(supportsMonitoring(mockDevices[1])).toBe(false);
      expect(supportsMonitoring(mockDevices[2])).toBe(true);
    });
  });
});

// ============================================================================
// TIME FORMATTING TESTS
// ============================================================================

describe('Time Formatting Functions', () => {
  describe('getLastSeenDuration', () => {
    it('should return null for online devices', () => {
      expect(getLastSeenDuration(mockDevices[0])).toBe(null);
    });

    it('should format last seen duration correctly', () => {
      const now = Date.now();
      
      // Minutes
      const device1 = {
        ...mockDevices[1],
        lastSeen: new Date(now - 30 * 60 * 1000),
      };
      expect(getLastSeenDuration(device1)).toBe('30 minutes ago');
      
      // Hours
      const device2 = {
        ...mockDevices[1],
        lastSeen: new Date(now - 2 * 60 * 60 * 1000),
      };
      expect(getLastSeenDuration(device2)).toBe('2 hours ago');
      
      // Days
      const device3 = {
        ...mockDevices[1],
        lastSeen: new Date(now - 3 * 24 * 60 * 60 * 1000),
      };
      expect(getLastSeenDuration(device3)).toBe('3 days ago');
    });

    it('should handle singular forms', () => {
      const now = Date.now();
      
      const device1 = {
        ...mockDevices[1],
        lastSeen: new Date(now - 1 * 60 * 1000),
      };
      expect(getLastSeenDuration(device1)).toBe('1 minute ago');
      
      const device2 = {
        ...mockDevices[1],
        lastSeen: new Date(now - 1 * 60 * 60 * 1000),
      };
      expect(getLastSeenDuration(device2)).toBe('1 hour ago');
    });
  });

  describe('formatUptime', () => {
    it('should format uptime correctly', () => {
      expect(formatUptime(30 * 60)).toBe('30m');
      expect(formatUptime(90 * 60)).toBe('1h 30m');
      expect(formatUptime(25 * 60 * 60)).toBe('1d 1h 0m');
      expect(formatUptime(7 * 24 * 60 * 60 + 2 * 60 * 60 + 15 * 60)).toBe('7d 2h 15m');
    });
  });
});

// ============================================================================
// HEALTH AND PERFORMANCE TESTS
// ============================================================================

describe('Health and Performance Functions', () => {
  describe('getDeviceHealth', () => {
    it('should return unknown for offline devices', () => {
      expect(getDeviceHealth(mockDevices[1])).toBe('unknown');
    });

    it('should return unknown for devices without stats', () => {
      const device = { ...mockDevices[0], stats: undefined };
      expect(getDeviceHealth(device)).toBe('unknown');
    });

    it('should categorize health correctly', () => {
      // Healthy device
      const healthy = {
        ...mockDevices[0],
        stats: { cpu: 30, memory: 40, disk: 50, uptime: 1000, load: [1.0, 1.0, 1.0] },
      };
      expect(getDeviceHealth(healthy)).toBe('healthy');
      
      // Warning device - but it's not online so returns unknown
      expect(getDeviceHealth(mockDevices[2])).toBe('unknown'); // Device is in warning state, not online
      
      // Test with an online device with warning-level stats
      const warningDevice = {
        ...mockDevices[0],
        status: 'online' as const,
        stats: { cpu: 85, memory: 82, disk: 50, uptime: 1000, load: [6.0, 5.5, 5.2] },
      };
      expect(getDeviceHealth(warningDevice)).toBe('warning');
      
      // Critical device
      const critical = {
        ...mockDevices[0],
        stats: { cpu: 96, memory: 95, disk: 95, uptime: 1000, load: [11.0, 10.0, 9.0] },
      };
      expect(getDeviceHealth(critical)).toBe('critical');
    });
  });

  describe('getPerformanceScore', () => {
    it('should return null for offline devices', () => {
      expect(getPerformanceScore(mockDevices[1])).toBe(null);
    });

    it('should calculate performance score', () => {
      const score = getPerformanceScore(mockDevices[0]);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should give lower scores for high resource usage', () => {
      const lowPerf = {
        ...mockDevices[0],
        stats: { cpu: 90, memory: 85, disk: 80, uptime: 1000, load: [8.0, 7.0, 6.0] },
      };
      const highPerf = {
        ...mockDevices[0],
        stats: { cpu: 10, memory: 20, disk: 30, uptime: 1000, load: [0.5, 0.5, 0.5] },
      };
      
      const lowScore = getPerformanceScore(lowPerf);
      const highScore = getPerformanceScore(highPerf);
      
      expect(lowScore).toBeLessThan(highScore);
    });
  });
});

// ============================================================================
// FILTERING TESTS
// ============================================================================

describe('Device Filtering', () => {
  describe('filterDevices', () => {
    it('should filter by search term', () => {
      const filters: DeviceFilters = { search: 'production' };
      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Production Server');
    });

    it('should search in name, IP, and UUID', () => {
      const filters1: DeviceFilters = { search: '192.168.1.101' };
      expect(filterDevices(mockDevices, filters1)).toHaveLength(1);
      
      const filters2: DeviceFilters = { search: 'dev-3' };
      expect(filterDevices(mockDevices, filters2)).toHaveLength(1);
    });

    it('should filter by status', () => {
      const filters: DeviceFilters = { status: ['online', 'warning'] };
      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(2);
    });

    it('should filter by type', () => {
      const filters: DeviceFilters = { type: ['linux', 'docker'] };
      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(2);
    });

    it('should filter by capabilities', () => {
      const filters: DeviceFilters = { capabilities: ['docker', 'monitoring'] };
      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(1); // Only Production Server has both
      expect(result[0].name).toBe('Production Server');
    });

    it('should filter by container support', () => {
      const filters: DeviceFilters = { hasContainers: true };
      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(2);
      expect(result.every(d => supportsContainers(d))).toBe(true);
    });

    it('should apply multiple filters', () => {
      const filters: DeviceFilters = {
        status: ['online', 'warning'],
        type: ['linux'],
        capabilities: ['monitoring'],
      };
      const result = filterDevices(mockDevices, filters);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Production Server');
    });
  });
});

// ============================================================================
// SORTING TESTS
// ============================================================================

describe('Device Sorting', () => {
  describe('sortDevices', () => {
    it('should sort by name', () => {
      const sorted = sortDevices(mockDevices, 'name', 'asc');
      expect(sorted[0].name).toBe('Database Server');
      expect(sorted[2].name).toBe('Proxmox Node');
    });

    it('should sort by status with custom order', () => {
      const sorted = sortDevices(mockDevices, 'status', 'asc');
      expect(sorted[0].status).toBe('online');
      expect(sorted[1].status).toBe('warning');
      expect(sorted[2].status).toBe('offline');
    });

    it('should sort by type', () => {
      const sorted = sortDevices(mockDevices, 'type', 'asc');
      expect(sorted.map(d => d.type)).toEqual(['docker', 'linux', 'proxmox']);
    });

    it('should sort by performance', () => {
      const devicesWithStats = mockDevices.filter(d => d.stats);
      const sorted = sortDevices(devicesWithStats, 'performance', 'desc');
      // Higher performance score should come first
      expect(sorted[0].name).toBe('Production Server');
    });

    it('should handle desc order', () => {
      const sorted = sortDevices(mockDevices, 'name', 'desc');
      expect(sorted[0].name).toBe('Proxmox Node');
      expect(sorted[2].name).toBe('Database Server');
    });
  });
});

// ============================================================================
// GROUPING TESTS
// ============================================================================

describe('Device Grouping', () => {
  describe('groupDevicesByStatus', () => {
    it('should group devices by status', () => {
      const grouped = groupDevicesByStatus(mockDevices);
      expect(Object.keys(grouped).sort()).toEqual(['offline', 'online', 'warning']);
      expect(grouped.online).toHaveLength(1);
      expect(grouped.offline).toHaveLength(1);
      expect(grouped.warning).toHaveLength(1);
    });
  });

  describe('groupDevicesByType', () => {
    it('should group devices by type', () => {
      const grouped = groupDevicesByType(mockDevices);
      expect(Object.keys(grouped).sort()).toEqual(['docker', 'linux', 'proxmox']);
      expect(grouped.linux).toHaveLength(1);
      expect(grouped.docker).toHaveLength(1);
      expect(grouped.proxmox).toHaveLength(1);
    });
  });
});

// ============================================================================
// STATISTICS TESTS
// ============================================================================

describe('Device Statistics', () => {
  describe('calculateDeviceStats', () => {
    it('should calculate status distribution', () => {
      const stats = calculateDeviceStats(mockDevices);
      expect(stats.total).toBe(3);
      expect(stats.online).toBe(1);
      expect(stats.offline).toBe(1);
      expect(stats.warning).toBe(1);
      expect(stats.unknown).toBe(0);
    });

    it('should calculate type distribution', () => {
      const stats = calculateDeviceStats(mockDevices);
      expect(stats.linux).toBe(1);
      expect(stats.docker).toBe(1);
      expect(stats.proxmox).toBe(1);
    });

    it('should calculate capability distribution', () => {
      const stats = calculateDeviceStats(mockDevices);
      expect(stats.containerSupport).toBe(2);
      expect(stats.monitoringEnabled).toBe(2);
      expect(stats.sshEnabled).toBe(2);
      expect(stats.ansibleEnabled).toBe(2);
    });

    it('should calculate performance averages', () => {
      const stats = calculateDeviceStats(mockDevices);
      // Only online devices with stats
      expect(stats.averageCpu).toBeGreaterThan(0);
      expect(stats.averageMemory).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('Device Configuration Validation', () => {
  describe('validateDeviceConfig', () => {
    it('should validate valid configuration', () => {
      const config = {
        name: 'Test Server',
        ip: '192.168.1.100',
        type: 'linux' as const,
        authType: 'password' as const,
        username: 'admin',
        password: 'secret',
        port: 22,
      };
      const result = validateDeviceConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate name requirements', () => {
      const config = {
        name: '',
        ip: '192.168.1.100',
        type: 'linux' as const,
        authType: 'password' as const,
      };
      const result = validateDeviceConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('name is required'))).toBe(true);
    });

    it('should validate name length', () => {
      const config = {
        name: 'a'.repeat(51),
        ip: '192.168.1.100',
        type: 'linux' as const,
        authType: 'password' as const,
      };
      const result = validateDeviceConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('50 characters'))).toBe(true);
    });

    it('should validate IP address format', () => {
      const invalidIPs = ['', 'not-an-ip', '256.256.256.256', '192.168.1'];
      invalidIPs.forEach(ip => {
        const config = {
          name: 'Test',
          ip,
          type: 'linux' as const,
          authType: 'password' as const,
        };
        const result = validateDeviceConfig(config);
        expect(result.isValid).toBe(false);
      });
    });

    it('should validate port range', () => {
      const invalidPorts = [0, -1, 70000];
      invalidPorts.forEach(port => {
        const config = {
          name: 'Test',
          ip: '192.168.1.100',
          type: 'linux' as const,
          authType: 'password' as const,
          port,
        };
        const result = validateDeviceConfig(config);
        expect(result.isValid).toBe(false);
      });
    });

    it('should validate password auth requirements', () => {
      const config = {
        name: 'Test',
        ip: '192.168.1.100',
        type: 'linux' as const,
        authType: 'password' as const,
        // Missing username and password
      };
      const result = validateDeviceConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Username is required'))).toBe(true);
      expect(result.errors.some(e => e.includes('Password is required'))).toBe(true);
    });

    it('should validate key auth requirements', () => {
      const config = {
        name: 'Test',
        ip: '192.168.1.100',
        type: 'linux' as const,
        authType: 'key' as const,
        // Missing username and privateKey
      };
      const result = validateDeviceConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Username is required'))).toBe(true);
      expect(result.errors.some(e => e.includes('Private key is required'))).toBe(true);
    });
  });

  describe('requiresReconnection', () => {
    it('should detect IP changes', () => {
      const oldConfig = { ip: '192.168.1.100' };
      const newConfig = { ip: '192.168.1.101' };
      expect(requiresReconnection(oldConfig, newConfig)).toBe(true);
    });

    it('should detect auth changes', () => {
      const oldConfig = { authType: 'password' as const };
      const newConfig = { authType: 'key' as const };
      expect(requiresReconnection(oldConfig, newConfig)).toBe(true);
    });

    it('should ignore non-connection fields', () => {
      const oldConfig = { name: 'Old Name' };
      const newConfig = { name: 'New Name' };
      expect(requiresReconnection(oldConfig, newConfig)).toBe(false);
    });
  });
});

// ============================================================================
// RECOMMENDED ACTIONS TESTS
// ============================================================================

describe('Recommended Actions', () => {
  describe('getRecommendedActions', () => {
    it('should recommend reconnection for offline devices', () => {
      const actions = getRecommendedActions(mockDevices[1]);
      expect(actions.some(a => a.action === 'reconnect')).toBe(true);
      expect(actions.find(a => a.action === 'reconnect')?.priority).toBe('high');
    });

    it('should recommend disk cleanup for high disk usage', () => {
      const device = {
        ...mockDevices[0],
        stats: { ...mockDevices[0].stats!, disk: 92 },
      };
      const actions = getRecommendedActions(device);
      expect(actions.some(a => a.action === 'free_disk_space')).toBe(true);
    });

    it('should recommend memory check for high memory usage', () => {
      const actions = getRecommendedActions(mockDevices[2]); // Has 82% memory
      expect(actions.some(a => a.action === 'check_memory')).toBe(true);
      expect(actions.find(a => a.action === 'check_memory')?.priority).toBe('medium');
    });

    it('should recommend enabling monitoring', () => {
      const actions = getRecommendedActions(mockDevices[1]);
      expect(actions.some(a => a.action === 'enable_monitoring')).toBe(true);
    });

    it('should recommend agent update for devices without version', () => {
      const actions = getRecommendedActions(mockDevices[1]); // No version
      expect(actions.some(a => a.action === 'update_agent')).toBe(true);
      expect(actions.find(a => a.action === 'update_agent')?.priority).toBe('low');
    });

    it('should return empty array for healthy devices', () => {
      const healthyDevice = {
        ...mockDevices[0],
        stats: { cpu: 20, memory: 30, disk: 40, uptime: 1000, load: [1.0, 1.0, 1.0] },
      };
      const actions = getRecommendedActions(healthyDevice);
      // Should only have low priority update suggestion
      expect(actions.filter(a => a.priority === 'high')).toHaveLength(0);
      expect(actions.filter(a => a.priority === 'medium')).toHaveLength(0);
    });
  });
});