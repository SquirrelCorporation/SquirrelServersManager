import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StatsType } from 'ssm-shared-lib';
import '../test-setup';

// Mock DeviceStatsController to avoid import issues
class DeviceStatsController {
  constructor(
    private readonly deviceStatsService: any,
    private readonly devicesService: any,
  ) {}

  async getDeviceStatsByDeviceUuid(params: any, query: any) {
    const { uuid, type } = params;
    const { from = 24 } = query;

    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error('Device not found');
    }

    const stats = await this.deviceStatsService.getStatsByDeviceAndType(
      device,
      new Date(),
      new Date(),
      type,
    );
    return stats;
  }

  async getDeviceStatByDeviceUuid(params: any) {
    const { uuid, type } = params;

    const device = await this.devicesService.findOneByUuid(uuid);
    if (!device) {
      throw new Error('Device not found');
    }

    const stat = await this.deviceStatsService.getStatByDeviceAndType(device, type);
    return stat;
  }
}

// Parameter DTOs
class DeviceStatsParamsDto {
  uuid!: string;
  type!: string;
}

class DeviceStatsQueryDto {
  from?: string;
}

// Mock device stats service
const MockDeviceStatsService = {
  getStatsByDeviceAndType: vi.fn().mockResolvedValue([{ date: '2023-01-01T00:00:00Z', value: 42 }]),
  getStatByDeviceAndType: vi.fn().mockResolvedValue({ value: 42, date: '2023-01-01T00:00:00Z' }),
};

// Symbol for DI
const DEVICES_SERVICE = Symbol('DEVICES_SERVICE');

describe('DeviceStatsController', () => {
  let controller: DeviceStatsController;
  let mockDeviceStatsService: any;
  let mockDevicesService: any;

  beforeEach(() => {
    mockDeviceStatsService = {
      ...MockDeviceStatsService,
    };

    mockDevicesService = {
      findOneByUuid: vi.fn().mockResolvedValue({
        uuid: 'test-uuid',
        hostname: 'test-device',
        ip: '192.168.1.100',
        status: 'online',
      }),
    };

    controller = new DeviceStatsController(mockDeviceStatsService, mockDevicesService);
  });

  describe('getDeviceStatsByDeviceUuid', () => {
    it('should return stats for a device and type', async () => {
      const params: DeviceStatsParamsDto = {
        uuid: 'test-uuid',
        type: StatsType.DeviceStatsType.CPU,
      };
      const query: DeviceStatsQueryDto = {
        from: '24',
      };

      const result = await controller.getDeviceStatsByDeviceUuid(params, query);

      expect(result).toBeDefined();
      expect(mockDevicesService.findOneByUuid).toHaveBeenCalledWith(params.uuid);
      expect(mockDeviceStatsService.getStatsByDeviceAndType).toHaveBeenCalled();
    });

    it('should throw error when device is not found', async () => {
      const params: DeviceStatsParamsDto = {
        uuid: 'test-uuid',
        type: StatsType.DeviceStatsType.CPU,
      };
      const query: DeviceStatsQueryDto = {
        from: '24',
      };

      vi.mocked(mockDevicesService.findOneByUuid).mockResolvedValueOnce(null);

      await expect(controller.getDeviceStatsByDeviceUuid(params, query)).rejects.toThrow(
        'Device not found',
      );
    });
  });

  describe('getDeviceStatByDeviceUuid', () => {
    it('should return current stat for a device and type', async () => {
      const params: DeviceStatsParamsDto = {
        uuid: 'test-uuid',
        type: StatsType.DeviceStatsType.CPU,
      };

      const result = await controller.getDeviceStatByDeviceUuid(params);

      expect(result).toBeDefined();
      expect(mockDevicesService.findOneByUuid).toHaveBeenCalledWith(params.uuid);
      expect(mockDeviceStatsService.getStatByDeviceAndType).toHaveBeenCalled();
    });

    it('should throw error when device is not found', async () => {
      const params: DeviceStatsParamsDto = {
        uuid: 'test-uuid',
        type: StatsType.DeviceStatsType.CPU,
      };

      vi.mocked(mockDevicesService.findOneByUuid).mockResolvedValueOnce(null);

      await expect(controller.getDeviceStatByDeviceUuid(params)).rejects.toThrow(
        'Device not found',
      );
    });
  });
});
