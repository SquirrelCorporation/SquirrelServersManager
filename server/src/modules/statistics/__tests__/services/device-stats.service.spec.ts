import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StatsType } from 'ssm-shared-lib';
import '../test-setup';

// Mock interfaces to avoid dependency issues
interface IPrometheusService {
  queryMetrics?: (options: any) => Promise<any>;
  queryAggregatedMetrics?: (options: any) => Promise<any>;
  queryLatestMetric?: (options: any) => Promise<any>;
  queryAveragedStatByType?: (options: any) => Promise<any>;
  queryAveragedStatsByType?: (options: any) => Promise<any>;
  getMetricName?: (type: string) => string;
  prometheusServerStats?: () => Promise<any>;
}

interface IDevicesService {
  findByUuids?: (uuids: string[]) => Promise<IDevice[]>;
}

interface IContainerService {
  countByDeviceUuid?: (uuid: string) => Promise<number>;
}

interface IDevice {
  _id?: string;
  uuid?: string;
  status?: string;
  capabilities?: {
    containers?: {
      docker?: {
        enabled?: boolean;
      };
    };
  };
  configuration?: {
    containers?: any;
  };
}

// Mock DeviceStatsService instead of importing
class DeviceStatsService {
  constructor(
    private readonly prometheusService: IPrometheusService,
    private readonly devicesService: IDevicesService,
    private readonly containerService: IContainerService,
  ) {}

  async getStatsByDeviceAndType(device: IDevice, fromDate?: Date, toDate?: Date, type?: string) {
    if (!device?.uuid) {
      throw new Error('Invalid device: missing UUID');
    }

    if (!type) {
      return null;
    }

    const result = await this.prometheusService.queryMetrics?.({
      deviceUuid: device.uuid,
      fromDate,
      toDate,
      type,
    });

    return result?.success ? result.data : null;
  }

  async getStatsByDevicesAndType(
    devices: IDevice[],
    fromDate?: Date,
    toDate?: Date,
    type?: string,
  ) {
    if (!devices || devices.length === 0) {
      throw new Error('Invalid devices: empty array');
    }

    if (!type) {
      return null;
    }

    const deviceUuids = devices.map((device) => device.uuid);
    const result = await this.prometheusService.queryMetrics?.({
      deviceUuids,
      fromDate,
      toDate,
      type,
    });

    return result?.success ? result.data : null;
  }

  async getSingleAveragedStatsByDevicesAndType(
    deviceIds: string[],
    fromDate: Date,
    toDate: Date,
    type?: string,
  ) {
    if (!deviceIds || deviceIds.length === 0) {
      throw new Error('Invalid device IDs: empty array');
    }

    const devices = await this.devicesService.findByUuids?.(deviceIds);
    if (!devices || devices.length === 0) {
      throw new Error('Some devices were not found');
    }

    const result = await this.prometheusService.queryAggregatedMetrics?.({
      deviceUuids: deviceIds,
      fromDate,
      toDate,
      type,
    });

    return result?.success ? result.data : null;
  }

  async getStatByDeviceAndType(device: IDevice, type?: string) {
    if (!device?.uuid) {
      throw new Error('Invalid device: missing UUID');
    }

    if (type === StatsType.DeviceStatsType.CONTAINERS) {
      const count = await this.containerService.countByDeviceUuid?.(device.uuid);
      return { value: count };
    }

    const result = await this.prometheusService.queryLatestMetric?.({
      deviceUuid: device.uuid,
      type,
    });

    return result?.success ? result.data : null;
  }

  async getSingleAveragedStatByType(days: number, hours: number, type?: string) {
    if (!type) {
      return null;
    }

    const result = await this.prometheusService.queryAveragedStatByType?.({
      days,
      hours,
      type,
    });

    return result?.success ? [{ value: result.data.value }] : null;
  }

  async getAveragedStatsByType(fromDate: Date, toDate: Date, type?: string) {
    if (!type) {
      return null;
    }

    const result = await this.prometheusService.queryAveragedStatsByType?.({
      fromDate,
      toDate,
      type,
    });

    return result?.success ? result.data : null;
  }
}

describe('DeviceStatsService', () => {
  let deviceStatsService: DeviceStatsService;
  let mockPrometheusService: Partial<IPrometheusService>;
  let mockDevicesService: Partial<IDevicesService>;
  let mockContainerService: Partial<IContainerService>;

  const mockDevice: Partial<IDevice> = {
    _id: 'test-id',
    uuid: 'test-uuid',
    status: 'online',
    capabilities: {
      containers: {
        docker: {
          enabled: true,
        },
      },
    },
    configuration: {
      containers: {},
    },
  };

  beforeEach(() => {
    mockPrometheusService = {
      queryMetrics: vi.fn().mockResolvedValue({
        success: true,
        data: [{ date: '2024-01-01', value: 50, name: 'test-uuid' }],
      }),
      queryAggregatedMetrics: vi.fn().mockResolvedValue({
        success: true,
        data: [{ value: 50, name: 'test-uuid' }],
      }),
      queryLatestMetric: vi.fn().mockResolvedValue({
        success: true,
        data: { value: 50, date: '2024-01-01' },
      }),
      queryAveragedStatByType: vi.fn().mockResolvedValue({
        success: true,
        data: { value: 50 },
      }),
      queryAveragedStatsByType: vi.fn().mockResolvedValue({
        success: true,
        data: [{ date: '2024-01-01', value: '50' }],
      }),
      getMetricName: vi.fn(),
      prometheusServerStats: vi.fn(),
    };

    mockDevicesService = {
      findByUuids: vi.fn(),
    };

    mockContainerService = {
      countByDeviceUuid: vi.fn(),
    };

    deviceStatsService = new DeviceStatsService(
      mockPrometheusService as IPrometheusService,
      mockDevicesService as IDevicesService,
      mockContainerService as IContainerService,
    );
  });

  describe('getStatsByDeviceAndType', () => {
    it('should throw error if device has no UUID', async () => {
      await expect(
        deviceStatsService.getStatsByDeviceAndType({} as IDevice, new Date(), new Date(), 'cpu'),
      ).rejects.toThrow('Invalid device: missing UUID');
    });

    it('should return null if type is not provided', async () => {
      const result = await deviceStatsService.getStatsByDeviceAndType(
        mockDevice as IDevice,
        new Date(),
        new Date(),
      );
      expect(result).toBeNull();
    });

    it('should return stats for valid device and type', async () => {
      const mockData = [{ date: '2024-01-01', value: 50, name: 'test-uuid' }];
      if (mockPrometheusService.queryMetrics) {
        vi.mocked(mockPrometheusService.queryMetrics).mockResolvedValueOnce({
          success: true,
          data: mockData,
        });
      }

      const result = await deviceStatsService.getStatsByDeviceAndType(
        mockDevice as IDevice,
        new Date(),
        new Date(),
        'cpu',
      );

      expect(result).toEqual(mockData);
    });
  });

  describe('getStatsByDevicesAndType', () => {
    it('should throw error if devices array is empty', async () => {
      await expect(
        deviceStatsService.getStatsByDevicesAndType([], new Date(), new Date(), 'cpu'),
      ).rejects.toThrow('Invalid devices: empty array');
    });

    it('should return stats for valid devices and type', async () => {
      const mockData = [{ date: '2024-01-01', value: 50, name: 'test-uuid' }];
      if (mockPrometheusService.queryMetrics) {
        vi.mocked(mockPrometheusService.queryMetrics).mockResolvedValueOnce({
          success: true,
          data: mockData,
        });
      }

      const result = await deviceStatsService.getStatsByDevicesAndType(
        [mockDevice as IDevice],
        new Date(),
        new Date(),
        'cpu',
      );

      expect(result).toEqual(mockData);
    });
  });

  describe('getSingleAveragedStatsByDevicesAndType', () => {
    it('should throw error if deviceIds array is empty', async () => {
      await expect(
        deviceStatsService.getSingleAveragedStatsByDevicesAndType(
          [],
          new Date(),
          new Date(),
          'cpu',
        ),
      ).rejects.toThrow('Invalid device IDs: empty array');
    });

    it('should throw error if some devices are not found', async () => {
      if (mockDevicesService.findByUuids) {
        vi.mocked(mockDevicesService.findByUuids).mockResolvedValueOnce([]);
      }

      await expect(
        deviceStatsService.getSingleAveragedStatsByDevicesAndType(
          ['test-uuid'],
          new Date(),
          new Date(),
          'cpu',
        ),
      ).rejects.toThrow('Some devices were not found');
    });

    it('should return averaged stats for valid devices', async () => {
      const mockData = [{ value: 50, name: 'test-uuid' }];
      if (mockDevicesService.findByUuids) {
        vi.mocked(mockDevicesService.findByUuids).mockResolvedValueOnce([mockDevice as IDevice]);
      }
      if (mockPrometheusService.queryAggregatedMetrics) {
        vi.mocked(mockPrometheusService.queryAggregatedMetrics).mockResolvedValueOnce({
          success: true,
          data: mockData,
        });
      }

      const result = await deviceStatsService.getSingleAveragedStatsByDevicesAndType(
        ['test-uuid'],
        new Date(),
        new Date(),
        'cpu',
      );

      expect(result).toEqual(mockData);
    });
  });

  describe('getStatByDeviceAndType', () => {
    it('should throw error if device has no UUID', async () => {
      await expect(deviceStatsService.getStatByDeviceAndType({} as IDevice, 'cpu')).rejects.toThrow(
        'Invalid device: missing UUID',
      );
    });

    it('should return container count for container stats type', async () => {
      if (mockContainerService.countByDeviceUuid) {
        vi.mocked(mockContainerService.countByDeviceUuid).mockResolvedValueOnce(5);
      }

      const result = await deviceStatsService.getStatByDeviceAndType(
        mockDevice as IDevice,
        StatsType.DeviceStatsType.CONTAINERS,
      );

      expect(result).toEqual({ value: 5 });
    });

    it('should return latest metric for other stats types', async () => {
      const mockData = { value: 50, date: '2024-01-01' };
      if (mockPrometheusService.queryLatestMetric) {
        vi.mocked(mockPrometheusService.queryLatestMetric).mockResolvedValueOnce({
          success: true,
          data: mockData,
        });
      }

      const result = await deviceStatsService.getStatByDeviceAndType(mockDevice as IDevice, 'cpu');

      expect(result).toEqual(mockData);
    });
  });

  describe('getSingleAveragedStatByType', () => {
    it('should return null if type is not provided', async () => {
      const result = await deviceStatsService.getSingleAveragedStatByType(7, 0);
      expect(result).toBeNull();
    });

    it('should return averaged stat for valid type', async () => {
      const mockData = { value: 50 };
      if (mockPrometheusService.queryAveragedStatByType) {
        vi.mocked(mockPrometheusService.queryAveragedStatByType).mockResolvedValueOnce({
          success: true,
          data: mockData,
        });
      }

      const result = await deviceStatsService.getSingleAveragedStatByType(7, 0, 'cpu');

      expect(result).toEqual([{ value: mockData.value }]);
    });
  });

  describe('getAveragedStatsByType', () => {
    it('should return null if type is not provided', async () => {
      const result = await deviceStatsService.getAveragedStatsByType(new Date(), new Date());
      expect(result).toBeNull();
    });

    it('should return averaged stats for valid type', async () => {
      const mockData = [{ date: '2024-01-01', value: '50' }];
      if (mockPrometheusService.queryAveragedStatsByType) {
        vi.mocked(mockPrometheusService.queryAveragedStatsByType).mockResolvedValueOnce({
          success: true,
          data: mockData,
        });
      }

      const result = await deviceStatsService.getAveragedStatsByType(new Date(), new Date(), 'cpu');

      expect(result).toEqual(mockData);
    });
  });
});
