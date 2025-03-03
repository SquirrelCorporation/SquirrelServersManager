import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Device from '../../../../data/database/model/Device';
import DeviceRepo from '../../../../data/database/repository/DeviceRepo';
import { PROMETHEUS_SERVICE } from '../../../../infrastructure/prometheus/prometheus.provider';
import { PrometheusService } from '../../../../infrastructure/prometheus/prometheus.service';
import { DeviceStatsService } from '../../services/device-stats.service';

// Mock dependencies
vi.mock('../../../../data/database/repository/DeviceRepo', () => ({
  default: {
    findByUuids: vi.fn(),
  },
}));

describe('DeviceStatsService', () => {
  let service: DeviceStatsService;
  let prometheusService: PrometheusService;

  const mockDevice: Device = {
    uuid: 'test-device-uuid',
    name: 'Test Device',
  } as Device;

  beforeEach(async () => {
    const mockPrometheusService = {
      queryMetrics: vi.fn(),
      queryAggregatedMetrics: vi.fn(),
      queryLatestMetric: vi.fn(),
      queryAveragedStatByType: vi.fn(),
      queryAveragedStatsByType: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceStatsService,
        {
          provide: PROMETHEUS_SERVICE,
          useValue: mockPrometheusService,
        },
      ],
    }).compile();

    service = module.get<DeviceStatsService>(DeviceStatsService);
    prometheusService = module.get<PrometheusService>(PROMETHEUS_SERVICE);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatsByDeviceAndType', () => {
    it('should return stats for a device and type', async () => {
      const mockFrom = new Date('2023-01-01');
      const mockTo = new Date('2023-01-31');
      const mockType = 'cpu';
      const mockResult = {
        success: true,
        data: [
          { date: '2023-01-01', value: 10 },
          { date: '2023-01-02', value: 20 },
        ],
      };

      vi.spyOn(prometheusService, 'queryMetrics').mockResolvedValue(mockResult);

      const result = await service.getStatsByDeviceAndType(mockDevice, mockFrom, mockTo, mockType);

      expect(prometheusService.queryMetrics).toHaveBeenCalledWith(
        mockType,
        { type: 'devices', deviceIds: [mockDevice.uuid] },
        { from: mockFrom, to: mockTo },
      );
      expect(result).toEqual([
        { date: '2023-01-01', value: 10 },
        { date: '2023-01-02', value: 20 },
      ]);
    });

    it('should return null if type is not provided', async () => {
      const mockFrom = new Date('2023-01-01');
      const mockTo = new Date('2023-01-31');

      const result = await service.getStatsByDeviceAndType(mockDevice, mockFrom, mockTo);

      expect(prometheusService.queryMetrics).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null if prometheus service returns unsuccessful result', async () => {
      const mockFrom = new Date('2023-01-01');
      const mockTo = new Date('2023-01-31');
      const mockType = 'cpu';
      const mockResult = {
        success: false,
        data: null,
      };

      vi.spyOn(prometheusService, 'queryMetrics').mockResolvedValue(mockResult);

      const result = await service.getStatsByDeviceAndType(mockDevice, mockFrom, mockTo, mockType);

      expect(prometheusService.queryMetrics).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw error if device is invalid', async () => {
      const mockFrom = new Date('2023-01-01');
      const mockTo = new Date('2023-01-31');
      const mockType = 'cpu';

      await expect(
        service.getStatsByDeviceAndType({} as Device, mockFrom, mockTo, mockType),
      ).rejects.toThrow('Invalid device: missing UUID');
    });

    it('should handle errors and return null', async () => {
      const mockFrom = new Date('2023-01-01');
      const mockTo = new Date('2023-01-31');
      const mockType = 'cpu';

      vi.spyOn(prometheusService, 'queryMetrics').mockRejectedValue(new Error('Test error'));

      const result = await service.getStatsByDeviceAndType(mockDevice, mockFrom, mockTo, mockType);

      expect(prometheusService.queryMetrics).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('getStatsByDevicesAndType', () => {
    it('should return stats for multiple devices and type', async () => {
      const mockDevices = [mockDevice, { uuid: 'device-2', name: 'Device 2' } as Device];
      const mockFrom = new Date('2023-01-01');
      const mockTo = new Date('2023-01-31');
      const mockType = 'cpu';
      const mockResult = {
        success: true,
        data: [
          { date: '2023-01-01', value: 10 },
          { date: '2023-01-02', value: 20 },
        ],
      };

      vi.spyOn(prometheusService, 'queryMetrics').mockResolvedValue(mockResult);

      const result = await service.getStatsByDevicesAndType(
        mockDevices,
        mockFrom,
        mockTo,
        mockType,
      );

      expect(prometheusService.queryMetrics).toHaveBeenCalledWith(
        mockType,
        { type: 'devices', deviceIds: mockDevices.map((d) => d.uuid) },
        { from: mockFrom, to: mockTo },
      );
      expect(result).toEqual(mockResult.data);
    });
  });

  describe('getSingleAveragedStatsByDevicesAndType', () => {
    it('should return averaged stats for multiple devices', async () => {
      const mockDeviceIds = ['device1', 'device2'];
      const mockFrom = new Date('2023-01-01');
      const mockTo = new Date('2023-01-31');
      const mockType = 'cpu';
      const mockDevices = [
        { uuid: 'device1', name: 'Device 1' },
        { uuid: 'device2', name: 'Device 2' },
      ] as Device[];
      const mockResult = {
        success: true,
        data: { value: 15 },
      };

      DeviceRepo.findByUuids = vi.fn().mockResolvedValue(mockDevices);
      vi.spyOn(prometheusService, 'queryAggregatedMetrics').mockResolvedValue(mockResult);

      const result = await service.getSingleAveragedStatsByDevicesAndType(
        mockDeviceIds,
        mockFrom,
        mockTo,
        mockType,
      );

      expect(DeviceRepo.findByUuids).toHaveBeenCalledWith(mockDeviceIds);
      expect(prometheusService.queryAggregatedMetrics).toHaveBeenCalledWith(
        mockType,
        { type: 'devices', deviceIds: mockDeviceIds },
        { from: mockFrom, to: mockTo },
      );
      expect(result).toEqual(mockResult.data);
    });
  });

  describe('getStatByDeviceAndType', () => {
    it('should return latest stat for a device and type', async () => {
      const mockType = 'cpu';
      const mockResult = {
        success: true,
        data: { value: 15, date: '2023-01-01' },
      };

      vi.spyOn(prometheusService, 'queryLatestMetric').mockResolvedValue(mockResult);

      const result = await service.getStatByDeviceAndType(mockDevice, mockType);

      expect(prometheusService.queryLatestMetric).toHaveBeenCalledWith(mockType, {
        type: 'device',
        deviceId: mockDevice.uuid,
      });
      expect(result).toEqual([{ value: 15, date: '2023-01-01' }]);
    });
  });

  describe('getSingleAveragedStatByType', () => {
    it('should return averaged stat by type', async () => {
      const mockDays = 30;
      const mockOffset = 0;
      const mockType = 'cpu';
      const mockResult = {
        success: true,
        data: { value: 15 },
      };

      vi.spyOn(prometheusService, 'queryAveragedStatByType').mockResolvedValue(mockResult);

      const result = await service.getSingleAveragedStatByType(mockDays, mockOffset, mockType);

      expect(prometheusService.queryAveragedStatByType).toHaveBeenCalledWith(mockType, {
        days: mockDays,
        offset: mockOffset,
      });
      expect(result).toEqual([{ value: 15 }]);
    });
  });

  describe('getAveragedStatsByType', () => {
    it('should return averaged stats by type', async () => {
      const mockFrom = new Date('2023-01-01');
      const mockTo = new Date('2023-01-31');
      const mockType = 'cpu';
      const mockResult = {
        success: true,
        data: [
          { date: '2023-01-01', value: 10 },
          { date: '2023-01-02', value: 20 },
        ],
      };

      vi.spyOn(prometheusService, 'queryAveragedStatsByType').mockResolvedValue(mockResult);

      const result = await service.getAveragedStatsByType(mockFrom, mockTo, mockType);

      expect(prometheusService.queryAveragedStatsByType).toHaveBeenCalledWith(mockType, {
        from: mockFrom,
        to: mockTo,
      });
      expect(result).toEqual(mockResult.data);
    });
  });
});
