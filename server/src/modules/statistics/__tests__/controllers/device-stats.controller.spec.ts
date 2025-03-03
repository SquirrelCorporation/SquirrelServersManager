import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeviceRepo from '../../../../data/database/repository/DeviceRepo';
import { DeviceStatsController } from '../../controllers/device-stats.controller';
import { DeviceStatsService } from '../../services/device-stats.service';

// Mock dependencies
vi.mock('../../../../data/database/repository/DeviceRepo', () => ({
  default: {
    findByUuid: vi.fn(),
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

describe('DeviceStatsController', () => {
  let controller: DeviceStatsController;
  let deviceStatsService: DeviceStatsService;

  beforeEach(async () => {
    const mockDeviceStatsService = {
      getStatsByDeviceAndType: vi.fn(),
      getStatByDeviceAndType: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceStatsController],
      providers: [
        {
          provide: DeviceStatsService,
          useValue: mockDeviceStatsService,
        },
      ],
    }).compile();

    controller = module.get<DeviceStatsController>(DeviceStatsController);
    deviceStatsService = module.get<DeviceStatsService>(DeviceStatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDeviceStatsByDeviceUuid', () => {
    it('should return device stats by type', async () => {
      const mockParams = {
        uuid: 'test-device-uuid',
        type: 'cpu',
      };
      const mockQuery = {
        from: '2023-01-01T00:00:00Z',
        to: '2023-01-31T23:59:59Z',
      };
      const mockDevice = {
        uuid: 'test-device-uuid',
        name: 'Test Device',
      };
      const mockStats = [
        { date: '2023-01-01-00:00:00', value: 45.2 },
        { date: '2023-01-02-00:00:00', value: 38.7 },
      ];

      vi.mocked(DeviceRepo.default.findByUuid).mockResolvedValue(mockDevice);
      vi.spyOn(deviceStatsService, 'getStatsByDeviceAndType').mockResolvedValue(mockStats);

      const result = await controller.getDeviceStatsByDeviceUuid(mockParams, mockQuery);

      expect(DeviceRepo.default.findByUuid).toHaveBeenCalledWith(mockParams.uuid);
      expect(deviceStatsService.getStatsByDeviceAndType).toHaveBeenCalledWith(
        mockDevice,
        new Date(mockQuery.from),
        new Date(mockQuery.to),
        mockParams.type,
      );
      expect(result).toEqual(mockStats);
    });

    it('should use default date range if not provided', async () => {
      const mockParams = {
        uuid: 'test-device-uuid',
        type: 'cpu',
      };
      const mockQuery = {};
      const mockDevice = {
        uuid: 'test-device-uuid',
        name: 'Test Device',
      };
      const mockStats = [
        { date: '2023-01-01-00:00:00', value: 45.2 },
        { date: '2023-01-02-00:00:00', value: 38.7 },
      ];

      vi.mocked(DeviceRepo.default.findByUuid).mockResolvedValue(mockDevice);
      vi.spyOn(deviceStatsService, 'getStatsByDeviceAndType').mockResolvedValue(mockStats);

      const result = await controller.getDeviceStatsByDeviceUuid(mockParams, mockQuery);

      expect(DeviceRepo.default.findByUuid).toHaveBeenCalledWith(mockParams.uuid);
      expect(deviceStatsService.getStatsByDeviceAndType).toHaveBeenCalledWith(
        mockDevice,
        expect.any(Date), // 7 days ago
        expect.any(Date), // now
        mockParams.type,
      );
      expect(result).toEqual(mockStats);
    });

    it('should throw an error if device is not found', async () => {
      const mockParams = {
        uuid: 'non-existent-uuid',
        type: 'cpu',
      };
      const mockQuery = {};

      vi.mocked(DeviceRepo.default.findByUuid).mockResolvedValue(null);

      await expect(controller.getDeviceStatsByDeviceUuid(mockParams, mockQuery)).rejects.toThrow(
        'Device not found',
      );
    });
  });

  describe('getDeviceStatByDeviceUuid', () => {
    it('should return the latest device stat by type', async () => {
      const mockParams = {
        uuid: 'test-device-uuid',
        type: 'cpu',
      };
      const mockDevice = {
        uuid: 'test-device-uuid',
        name: 'Test Device',
      };
      const mockStat = [{ value: 45.2, date: '2023-01-31T12:00:00Z' }];

      vi.mocked(DeviceRepo.default.findByUuid).mockResolvedValue(mockDevice);
      vi.spyOn(deviceStatsService, 'getStatByDeviceAndType').mockResolvedValue(mockStat);

      const result = await controller.getDeviceStatByDeviceUuid(mockParams);

      expect(DeviceRepo.default.findByUuid).toHaveBeenCalledWith(mockParams.uuid);
      expect(deviceStatsService.getStatByDeviceAndType).toHaveBeenCalledWith(
        mockDevice,
        mockParams.type,
      );
      expect(result).toEqual(mockStat);
    });

    it('should throw an error if device is not found', async () => {
      const mockParams = {
        uuid: 'non-existent-uuid',
        type: 'cpu',
      };

      vi.mocked(DeviceRepo.default.findByUuid).mockResolvedValue(null);

      await expect(controller.getDeviceStatByDeviceUuid(mockParams)).rejects.toThrow(
        'Device not found',
      );
    });
  });
});
