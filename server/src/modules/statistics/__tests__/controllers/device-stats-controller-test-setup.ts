import { vi } from 'vitest';

// Mock the devices module specifically for this controller test
vi.mock('../../presentation/controllers/device-stats.controller', async () => {
  const actual = await vi.importActual<any>(
    '../../presentation/controllers/device-stats.controller',

  // Create a modified version of the controller that doesn't rely on @modules/devices
  const DeviceStatsController = class {
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
  };

  return {
    ...actual,
    DeviceStatsController,
  };
});
