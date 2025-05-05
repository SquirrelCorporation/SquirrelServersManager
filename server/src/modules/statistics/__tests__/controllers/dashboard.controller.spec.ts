import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DateTime } from 'luxon';
import { DashboardController } from '../../presentation/controllers/dashboard.controller';
import { DashboardStatQueryDto } from '../../presentation/dto/dashboard-stats.dto';
import {
  BadRequestException,
  EntityNotFoundException,
} from '../../../../infrastructure/exceptions';

// Mock dependencies
vi.mock('@modules/devices', () => ({
  DEVICES_SERVICE: Symbol('DEVICES_SERVICE'),
  IDevicesService: class IDevicesService {},
}));

vi.mock('@infrastructure/models/api-response.model', () => ({
  ApiSuccessResponse: vi.fn(),
  ApiErrorResponse: vi.fn(),
}));

describe('DashboardController', () => {
  let dashboardController: DashboardController;
  let mockDashboardService: any;
  let mockDevicesService: any;

  beforeEach(() => {
    // Create mocks
    mockDashboardService = {
      getSystemPerformance: vi.fn(),
      getDevicesAvailability: vi.fn(),
      getSingleAveragedStatsByDevicesAndType: vi.fn(),
      getStatsByDevicesAndType: vi.fn(),
    };

    mockDevicesService = {
      findByUuids: vi.fn(),
    };

    // Create controller instance with mocks
    dashboardController = new DashboardController(mockDashboardService, mockDevicesService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardPerformanceStats', () => {
    it('should return system performance data', async () => {
      // Setup mock data
      const mockPerformanceData = {
        currentMem: 75.5,
        previousMem: 70.2,
        currentCpu: 25.3,
        previousCpu: 30.1,
        message: 'HEALTHY',
        danger: false,
      };

      mockDashboardService.getSystemPerformance.mockResolvedValue(mockPerformanceData);

      // Test
      const result = await dashboardController.getDashboardPerformanceStats();

      // Verify
      expect(mockDashboardService.getSystemPerformance).toHaveBeenCalled();
      expect(result).toEqual(mockPerformanceData);
    });
  });

  describe('getDashboardAvailabilityStats', () => {
    it('should return device availability data', async () => {
      // Setup mock data
      const mockAvailabilityData = {
        availability: 98.5,
        lastMonth: 97.8,
        byDevice: [
          { deviceId: 'device-1', uptime: 99.2 },
          { deviceId: 'device-2', uptime: 97.8 },
        ],
        otherProperty: 'shouldBeFiltered',
      };

      mockDashboardService.getDevicesAvailability.mockResolvedValue(mockAvailabilityData);

      // Test
      const result = await dashboardController.getDashboardAvailabilityStats();

      // Verify
      expect(mockDashboardService.getDevicesAvailability).toHaveBeenCalled();
      expect(result).toEqual({
        availability: mockAvailabilityData.availability,
        lastMonth: mockAvailabilityData.lastMonth,
        byDevice: mockAvailabilityData.byDevice,
      });
      expect(result).not.toHaveProperty('otherProperty');
    });
  });

  describe('getSingleAveragedStatsByDevicesAndType', () => {
    it('should return averaged statistics for valid request', async () => {
      // Setup mock data
      const type = 'cpu';
      const query: DashboardStatQueryDto = {
        from: '2025-01-01',
        to: '2025-01-07',
      };
      const body = { devices: ['device-1', 'device-2'] };

      const mockDevices = [
        { uuid: 'device-1', name: 'Device 1' },
        { uuid: 'device-2', name: 'Device 2' },
      ];

      const mockStats = [
        { deviceId: 'device-1', value: 25.5 },
        { deviceId: 'device-2', value: 35.2 },
      ];

      mockDevicesService.findByUuids.mockResolvedValue(mockDevices);
      mockDashboardService.getSingleAveragedStatsByDevicesAndType.mockResolvedValue(mockStats);

      // Test
      const result = await dashboardController.getSingleAveragedStatsByDevicesAndType(
        type,
        query,
        body,
      );

      // Verify
      expect(mockDevicesService.findByUuids).toHaveBeenCalledWith(body.devices);

      // Verify the date conversion
      const fromDate = DateTime.fromJSDate(new Date(query.from.split('T')[0]))
        .endOf('day')
        .toJSDate();
      const toDate = DateTime.fromJSDate(new Date(query.to.split('T')[0]))
        .endOf('day')
        .toJSDate();

      expect(mockDashboardService.getSingleAveragedStatsByDevicesAndType).toHaveBeenCalledWith(
        body.devices,
        fromDate,
        toDate,
        type,
      );

      expect(result).toEqual(mockStats);
    });

    it('should throw BadRequestException when devices are not provided', async () => {
      // Setup
      const type = 'cpu';
      const query: DashboardStatQueryDto = {
        from: '2025-01-01',
        to: '2025-01-07',
      };
      const body = { devices: [] };

      // Test & Verify
      await expect(
        dashboardController.getSingleAveragedStatsByDevicesAndType(type, query, body),
      ).rejects.toThrow(BadRequestException);

      expect(mockDevicesService.findByUuids).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when date range is not provided', async () => {
      // Setup
      const type = 'cpu';
      const query: Partial<DashboardStatQueryDto> = {}; // Missing from and to
      const body = { devices: ['device-1', 'device-2'] };

      // Test & Verify
      await expect(
        dashboardController.getSingleAveragedStatsByDevicesAndType(
          type,
          query as DashboardStatQueryDto,
          body,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(mockDevicesService.findByUuids).not.toHaveBeenCalled();
    });

    it('should throw EntityNotFoundException when no devices are found', async () => {
      // Setup
      const type = 'cpu';
      const query: DashboardStatQueryDto = {
        from: '2025-01-01',
        to: '2025-01-07',
      };
      const body = { devices: ['device-1', 'device-2'] };

      mockDevicesService.findByUuids.mockResolvedValue([]);

      // Test & Verify
      await expect(
        dashboardController.getSingleAveragedStatsByDevicesAndType(type, query, body),
      ).rejects.toThrow(EntityNotFoundException);

      expect(mockDevicesService.findByUuids).toHaveBeenCalledWith(body.devices);
    });

    it('should throw EntityNotFoundException when some devices are not found', async () => {
      // Setup
      const type = 'cpu';
      const query: DashboardStatQueryDto = {
        from: '2025-01-01',
        to: '2025-01-07',
      };
      const body = { devices: ['device-1', 'device-2'] };

      // Only one device found
      mockDevicesService.findByUuids.mockResolvedValue([{ uuid: 'device-1', name: 'Device 1' }]);

      // Test & Verify
      await expect(
        dashboardController.getSingleAveragedStatsByDevicesAndType(type, query, body),
      ).rejects.toThrow(EntityNotFoundException);

      expect(mockDevicesService.findByUuids).toHaveBeenCalledWith(body.devices);
    });
  });

  describe('getStatsByDevicesAndType', () => {
    it('should return statistics for valid request', async () => {
      // Setup mock data
      const type = 'mem';
      const query: DashboardStatQueryDto = {
        from: '2025-01-01',
        to: '2025-01-07',
      };
      const body = { devices: ['device-1', 'device-2'] };

      const mockDevices = [
        { uuid: 'device-1', name: 'Device 1' },
        { uuid: 'device-2', name: 'Device 2' },
      ];

      const mockStats = [
        { deviceId: 'device-1', timestamps: [1, 2, 3], values: [60, 65, 70] },
        { deviceId: 'device-2', timestamps: [1, 2, 3], values: [75, 80, 85] },
      ];

      mockDevicesService.findByUuids.mockResolvedValue(mockDevices);
      mockDashboardService.getStatsByDevicesAndType.mockResolvedValue(mockStats);

      // Test
      const result = await dashboardController.getStatsByDevicesAndType(type, body, query);

      // Verify
      expect(mockDevicesService.findByUuids).toHaveBeenCalledWith(body.devices);

      // Verify the date conversion
      const fromDate = DateTime.fromJSDate(new Date(query.from.split('T')[0]))
        .endOf('day')
        .toJSDate();
      const toDate = DateTime.fromJSDate(new Date(query.to.split('T')[0]))
        .endOf('day')
        .toJSDate();

      expect(mockDashboardService.getStatsByDevicesAndType).toHaveBeenCalledWith(
        mockDevices,
        fromDate,
        toDate,
        type,
      );

      expect(result).toEqual(mockStats);
    });

    it('should throw BadRequestException when devices are not provided', async () => {
      // Setup
      const type = 'mem';
      const query: DashboardStatQueryDto = {
        from: '2025-01-01',
        to: '2025-01-07',
      };
      const body = { devices: [] };

      // Test & Verify
      await expect(dashboardController.getStatsByDevicesAndType(type, body, query)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockDevicesService.findByUuids).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when date range is not provided', async () => {
      // Setup
      const type = 'mem';
      const query: Partial<DashboardStatQueryDto> = {}; // Missing from and to
      const body = { devices: ['device-1', 'device-2'] };

      // Test & Verify
      await expect(
        dashboardController.getStatsByDevicesAndType(type, body, query as DashboardStatQueryDto),
      ).rejects.toThrow(BadRequestException);

      expect(mockDevicesService.findByUuids).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when type is not provided', async () => {
      // Setup
      const type = null as unknown as string;
      const query: DashboardStatQueryDto = {
        from: '2025-01-01',
        to: '2025-01-07',
      };
      const body = { devices: ['device-1', 'device-2'] };

      // Test & Verify
      await expect(dashboardController.getStatsByDevicesAndType(type, body, query)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockDevicesService.findByUuids).not.toHaveBeenCalled();
    });
  });
});
