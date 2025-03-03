import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeviceRepo from '../../../../data/database/repository/DeviceRepo';
import { DashboardController } from '../../controllers/dashboard.controller';
import { DashboardService } from '../../services/dashboard.service';

// Mock dependencies
vi.mock('../../../../data/database/repository/DeviceRepo', () => ({
  default: {
    findByUuids: vi.fn(),
  },
}));

// Mock JwtAuthGuard
vi.mock('../../../../auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class JwtAuthGuard {
    canActivate() {
      return true;
    }
  },
}));

describe('DashboardController', () => {
  let controller: DashboardController;
  let dashboardService: DashboardService;

  beforeEach(async () => {
    const mockDashboardService = {
      getSystemPerformance: vi.fn(),
      getDevicesAvailability: vi.fn(),
      getAveragedStatsByDevices: vi.fn(),
      getDashboardStat: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboardPerformanceStats', () => {
    it('should return performance stats', async () => {
      const mockPerformanceStats = {
        currentMem: 80,
        previousMem: 75,
        currentCpu: 30,
        previousCpu: 35,
        message: 'HEALTHY',
        danger: false,
      };

      vi.spyOn(dashboardService, 'getSystemPerformance').mockResolvedValue(mockPerformanceStats);

      const result = await controller.getDashboardPerformanceStats();

      expect(dashboardService.getSystemPerformance).toHaveBeenCalled();
      expect(result).toEqual(mockPerformanceStats);
    });
  });

  describe('getDashboardAvailabilityStats', () => {
    it('should return availability stats', async () => {
      const mockAvailabilityStats = {
        availability: 98.5,
        lastMonth: 97.2,
        byDevice: [
          { uuid: 'device1', name: 'Device 1', availability: 99.1 },
          { uuid: 'device2', name: 'Device 2', availability: 97.9 },
        ],
      };

      vi.spyOn(dashboardService, 'getDevicesAvailability').mockResolvedValue(mockAvailabilityStats);

      const result = await controller.getDashboardAvailabilityStats();

      expect(dashboardService.getDevicesAvailability).toHaveBeenCalled();
      expect(result).toEqual({
        availability: 98.5,
        lastMonth: 97.2,
        byDevice: [
          { uuid: 'device1', name: 'Device 1', availability: 99.1 },
          { uuid: 'device2', name: 'Device 2', availability: 97.9 },
        ],
      });
    });
  });

  describe('getDashboardAveragedStats', () => {
    it('should return averaged stats for devices', async () => {
      const mockDevices = ['device1', 'device2'];
      const mockQuery = {
        from: '2023-01-01',
        to: '2023-01-31',
      };
      const mockBody = {
        devices: mockDevices,
      };
      const mockType = 'cpu';
      const mockStats = [
        { name: 'device1', value: 45.2 },
        { name: 'device2', value: 38.7 },
      ];

      const mockDeviceObjects = [
        { uuid: 'device1', name: 'Device 1' },
        { uuid: 'device2', name: 'Device 2' },
      ];

      vi.mocked(DeviceRepo.default.findByUuids).mockResolvedValue(mockDeviceObjects);
      vi.spyOn(dashboardService, 'getAveragedStatsByDevices').mockResolvedValue(mockStats);

      const result = await controller.getDashboardAveragedStats(mockType, mockQuery, mockBody);

      expect(DeviceRepo.default.findByUuids).toHaveBeenCalledWith(mockDevices);

      // Verify date conversion
      const fromDate = DateTime.fromJSDate(new Date(mockQuery.from.split('T')[0]))
        .endOf('day')
        .toJSDate();
      const toDate = DateTime.fromJSDate(new Date(mockQuery.to.split('T')[0]))
        .endOf('day')
        .toJSDate();

      expect(dashboardService.getAveragedStatsByDevices).toHaveBeenCalledWith(
        mockDevices,
        fromDate,
        toDate,
        mockType,
      );
      expect(result).toEqual(mockStats);
    });

    it('should throw an error if some devices are not found', async () => {
      const mockDevices = ['device1', 'device2'];
      const mockQuery = {
        from: '2023-01-01',
        to: '2023-01-31',
      };
      const mockBody = {
        devices: mockDevices,
      };
      const mockType = 'cpu';

      // Only return one device
      vi.mocked(DeviceRepo.default.findByUuids).mockResolvedValue([
        { uuid: 'device1', name: 'Device 1' },
      ]);

      await expect(
        controller.getDashboardAveragedStats(mockType, mockQuery, mockBody),
      ).rejects.toThrow('Some devices were not found');
    });
  });

  describe('getDashboardStat', () => {
    it('should return dashboard stats by type', async () => {
      const mockQuery = {
        from: '2023-01-01',
        to: '2023-01-31',
      };
      const mockType = 'cpu';
      const mockStats = [
        { date: '2023-01-01-00:00:00', value: '45.2' },
        { date: '2023-01-02-00:00:00', value: '38.7' },
      ];

      vi.spyOn(dashboardService, 'getDashboardStat').mockResolvedValue(mockStats);

      const result = await controller.getDashboardStat(mockType, mockQuery);

      expect(dashboardService.getDashboardStat).toHaveBeenCalled();

      // Verify date conversion
      const fromDate = DateTime.fromJSDate(new Date(mockQuery.from.split('T')[0]))
        .endOf('day')
        .toJSDate();
      const toDate = DateTime.fromJSDate(new Date(mockQuery.to.split('T')[0]))
        .endOf('day')
        .toJSDate();

      expect(dashboardService.getDashboardStat).toHaveBeenCalledWith(fromDate, toDate, mockType);
      expect(result).toEqual(mockStats);
    });
  });
});
