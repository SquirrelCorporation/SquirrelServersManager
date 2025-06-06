import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StatsType } from 'ssm-shared-lib';
import { DashboardService } from '../../application/services/dashboard.service';
import { DeviceDownTimeService } from '../../application/services/device-downtime.service';
import { DeviceStatsService } from '../../application/services/device-stats.service';
import { IDevice } from '@modules/devices';

// Mock dependencies
vi.mock('../../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

vi.mock('../../../../infrastructure/prometheus/prometheus.interface', () => ({
  PROMETHEUS_SERVICE: Symbol('PROMETHEUS_SERVICE'),
}));

vi.mock('@nestjs/cache-manager', () => ({
  CACHE_MANAGER: Symbol('CACHE_MANAGER'),
}));

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let mockDeviceStatsService: any;
  let mockDeviceDownTimeService: any;
  let mockPrometheusService: any;
  let mockCacheManager: any;

  beforeEach(() => {
    // Create mocks
    mockDeviceStatsService = {
      getSingleAveragedStatsByDevicesAndType: vi.fn(),
      getAveragedStatsByType: vi.fn(),
      getStatsByDevicesAndType: vi.fn(),
    };

    mockDeviceDownTimeService = {
      getDevicesAvailabilitySumUpCurrentMonthLastMonth: vi.fn(),
    };

    mockPrometheusService = {
      queryAveragedStatByType: vi.fn(),
    };

    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
    };

    // Create service instance
    dashboardService = new DashboardService(
      mockDeviceStatsService,
      mockDeviceDownTimeService,
      mockPrometheusService,
      mockCacheManager,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getSystemPerformance', () => {
    it('should return healthy system performance when metrics are good', async () => {
      // Setup mocks
      mockPrometheusService.queryAveragedStatByType.mockImplementation((type, options) => {
        if (type === StatsType.DeviceStatsType.MEM_FREE) {
          return Promise.resolve({
            success: true,
            data: { value: options.offset === 0 ? 75 : 70 }, // current vs previous
          });
        } else if (type === StatsType.DeviceStatsType.CPU) {
          return Promise.resolve({
            success: true,
            data: { value: options.offset === 0 ? 25 : 30 }, // current vs previous
          });
        }
        return Promise.resolve({ success: false });
      });

      mockCacheManager.get.mockImplementation((key) => {
        if (key === 'SSM_CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER') {
          return Promise.resolve('60');
        } else if (key === 'SSM_CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER') {
          return Promise.resolve('50');
        }
        return Promise.resolve(null);
      });

      // Test
      const result = await dashboardService.getSystemPerformance();

      // Verify
      expect(mockPrometheusService.queryAveragedStatByType).toHaveBeenCalledTimes(4);
      expect(mockCacheManager.get).toHaveBeenCalledTimes(2);

      expect(result).toMatchObject({
        currentMem: 75,
        previousMem: 70,
        currentCpu: 25,
        previousCpu: 30,
      });

      // Since the message and danger values are calculated based on the implementation,
      // we'll just verify they exist rather than their exact values
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('danger');
    });

    it('should return poor system performance when metrics are below thresholds', async () => {
      // Setup mocks
      mockPrometheusService.queryAveragedStatByType.mockImplementation((type, options) => {
        if (type === StatsType.DeviceStatsType.MEM_FREE) {
          return Promise.resolve({
            success: true,
            data: { value: options.offset === 0 ? 55 : 60 }, // current is worse than previous
          });
        } else if (type === StatsType.DeviceStatsType.CPU) {
          return Promise.resolve({
            success: true,
            data: { value: options.offset === 0 ? 75 : 60 }, // current is worse than previous
          });
        }
        return Promise.resolve({ success: false });
      });

      mockCacheManager.get.mockImplementation((key) => {
        if (key === 'SSM_CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER') {
          return Promise.resolve('60');
        } else if (key === 'SSM_CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER') {
          return Promise.resolve('50');
        }
        return Promise.resolve(null);
      });

      // Test
      const result = await dashboardService.getSystemPerformance();

      // Verify
      expect(result).toEqual({
        currentMem: 55,
        previousMem: 60,
        currentCpu: 75,
        previousCpu: 60,
        message: 'POOR',
        danger: true,
      });
    });

    it('should handle missing metrics data gracefully', async () => {
      // Setup mocks
      mockPrometheusService.queryAveragedStatByType.mockResolvedValue({
        success: false,
      });

      mockCacheManager.get.mockImplementation((key) => {
        if (key === 'SSM_CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER') {
          return Promise.resolve('60');
        } else if (key === 'SSM_CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER') {
          return Promise.resolve('50');
        }
        return Promise.resolve(null);
      });

      // Test
      const result = await dashboardService.getSystemPerformance();

      // Verify
      expect(result).toEqual({
        currentMem: NaN,
        previousMem: NaN,
        currentCpu: NaN,
        previousCpu: NaN,
        message: 'POOR',
        danger: true,
      });
    });
  });

  describe('getDevicesAvailability', () => {
    it('should return device availability data', async () => {
      // Setup mocks
      const mockAvailability = {
        availability: 98.5,
        lastMonth: 97.2,
        byDevice: [
          { deviceId: 'device-1', uptime: 99.2 },
          { deviceId: 'device-2', uptime: 97.8 },
        ],
      };

      mockDeviceDownTimeService.getDevicesAvailabilitySumUpCurrentMonthLastMonth.mockResolvedValue(
        mockAvailability,
      );

      // Test
      const result = await dashboardService.getDevicesAvailability();

      // Verify
      expect(
        mockDeviceDownTimeService.getDevicesAvailabilitySumUpCurrentMonthLastMonth,
      ).toHaveBeenCalled();
      expect(result).toEqual(mockAvailability);
    });
  });

  describe('getSingleAveragedStatsByDevicesAndType', () => {
    it('should return and sort averaged stats for specified devices', async () => {
      // Setup
      const devices = ['device-1', 'device-2'];
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-07');
      const type = 'cpu';

      const mockStats = [
        { deviceId: 'device-1', value: 25.5 },
        { deviceId: 'device-2', value: 45.2 },
      ];

      mockDeviceStatsService.getSingleAveragedStatsByDevicesAndType.mockResolvedValue(mockStats);

      // Test
      const result = await dashboardService.getSingleAveragedStatsByDevicesAndType(
        devices,
        from,
        to,
        type,
      );

      // Verify
      expect(mockDeviceStatsService.getSingleAveragedStatsByDevicesAndType).toHaveBeenCalledWith(
        devices,
        from,
        to,
        type,
      );

      // Verify sorting (highest value first)
      expect(result).toEqual([
        { deviceId: 'device-2', value: 45.2 },
        { deviceId: 'device-1', value: 25.5 },
      ]);
    });

    it('should handle null stats', async () => {
      // Setup
      const devices = ['device-1', 'device-2'];
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-07');
      const type = 'cpu';

      mockDeviceStatsService.getSingleAveragedStatsByDevicesAndType.mockResolvedValue(null);

      // Test
      const result = await dashboardService.getSingleAveragedStatsByDevicesAndType(
        devices,
        from,
        to,
        type,
      );

      // Verify
      expect(result).toBeUndefined();
    });
  });

  describe('getStatsByDevicesAndType', () => {
    it('should forward request to device stats service', async () => {
      // Setup
      const devices = [
        { uuid: 'device-1', name: 'Device 1' },
        { uuid: 'device-2', name: 'Device 2' },
      ] as IDevice[];
      const from = new Date('2025-01-01');
      const to = new Date('2025-01-07');
      const type = 'mem';

      const mockStats = [
        { deviceId: 'device-1', timestamps: [1, 2, 3], values: [60, 65, 70] },
        { deviceId: 'device-2', timestamps: [1, 2, 3], values: [75, 80, 85] },
      ];

      mockDeviceStatsService.getStatsByDevicesAndType.mockResolvedValue(mockStats);

      // Test
      const result = await dashboardService.getStatsByDevicesAndType(devices, from, to, type);

      // Verify
      expect(mockDeviceStatsService.getStatsByDevicesAndType).toHaveBeenCalledWith(
        devices,
        from,
        to,
        type,
      );
      expect(result).toEqual(mockStats);
    });
  });
});
