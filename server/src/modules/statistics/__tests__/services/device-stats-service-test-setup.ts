import { vi } from 'vitest';

// Mock the device-stats service to avoid imports from @modules/devices and @modules/containers
vi.mock('../../application/services/device-stats.service', async () => {
  const actual = await vi.importActual<any>('../../application/services/device-stats.service');
  
  // Create a modified version of the service
  class DeviceStatsService {
    constructor(
      private readonly prometheusService: any,
      private readonly devicesService: any,
      private readonly containerService: any,
    ) {}

    async getStatsByDeviceAndType(device: any, fromDate?: Date, toDate?: Date, type?: string) {
      if (!device?.uuid) {
        throw new Error('Invalid device: missing UUID');
      }
      
      if (!type) {
        return null;
      }
      
      const result = await this.prometheusService.queryMetrics({
        deviceUuid: device.uuid,
        fromDate,
        toDate,
        type,
      });
      
      return result.success ? result.data : null;
    }

    async getStatsByDevicesAndType(devices: any[], fromDate?: Date, toDate?: Date, type?: string) {
      if (!devices || devices.length === 0) {
        throw new Error('Invalid devices: empty array');
      }
      
      if (!type) {
        return null;
      }
      
      const deviceUuids = devices.map(device => device.uuid);
      const result = await this.prometheusService.queryMetrics({
        deviceUuids,
        fromDate,
        toDate,
        type,
      });
      
      return result.success ? result.data : null;
    }

    async getSingleAveragedStatsByDevicesAndType(deviceIds: string[], fromDate: Date, toDate: Date, type?: string) {
      if (!deviceIds || deviceIds.length === 0) {
        throw new Error('Invalid device IDs: empty array');
      }
      
      const devices = await this.devicesService.findByUuids(deviceIds);
      if (!devices || devices.length === 0) {
        throw new Error('Some devices were not found');
      }
      
      const result = await this.prometheusService.queryAggregatedMetrics({
        deviceUuids: deviceIds,
        fromDate,
        toDate,
        type,
      });
      
      return result.success ? result.data : null;
    }

    async getStatByDeviceAndType(device: any, type?: string) {
      if (!device?.uuid) {
        throw new Error('Invalid device: missing UUID');
      }
      
      if (type === 'containers') {
        const count = await this.containerService.countByDeviceUuid(device.uuid);
        return { value: count };
      }
      
      const result = await this.prometheusService.queryLatestMetric({
        deviceUuid: device.uuid,
        type,
      });
      
      return result.success ? result.data : null;
    }

    async getSingleAveragedStatByType(days: number, hours: number, type?: string) {
      if (!type) {
        return null;
      }
      
      const result = await this.prometheusService.queryAveragedStatByType({
        days,
        hours,
        type,
      });
      
      return result.success ? [{ value: result.data.value }] : null;
    }

    async getAveragedStatsByType(fromDate: Date, toDate: Date, type?: string) {
      if (!type) {
        return null;
      }
      
      const result = await this.prometheusService.queryAveragedStatsByType({
        fromDate,
        toDate,
        type,
      });
      
      return result.success ? result.data : null;
    }
  }

  return {
    ...actual,
    DeviceStatsService,
  };
});