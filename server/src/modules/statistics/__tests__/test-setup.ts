import { vi } from 'vitest';

// Mock the devices module
vi.mock('@modules/devices', () => ({
  DEVICES_SERVICE: Symbol('DEVICES_SERVICE'),
  IDevicesService: class IDevicesService {},
  DevicesService: class DevicesService {
    findOneByUuid = vi.fn().mockResolvedValue({
      uuid: 'test-uuid',
      hostname: 'test-device',
      ip: '192.168.1.100',
      status: 'online',
    });
    findByUuids = vi.fn().mockResolvedValue([
      {
        uuid: 'test-uuid-1',
        hostname: 'test-device-1',
        ip: '192.168.1.101',
        status: 'online',
      },
      {
        uuid: 'test-uuid-2',
        hostname: 'test-device-2',
        ip: '192.168.1.102',
        status: 'online',
      },
    ]);
  },
  DeviceStatus: {
    ONLINE: 'online',
    OFFLINE: 'offline',
  },
  IDevice: class IDevice {},
}));

// Mock the containers module
vi.mock('@modules/containers', () => ({
  IContainerService: class IContainerService {},
  CONTAINER_SERVICE: Symbol('CONTAINER_SERVICE'),
}));

// Mock the prometheus service
export const MockPrometheusService = {
  queryRange: vi.fn().mockResolvedValue([
    { date: '2023-01-01T00:00:00Z', value: 42 },
    { date: '2023-01-01T00:01:00Z', value: 43 },
  ]),
  query: vi.fn().mockResolvedValue({ value: 42 }),
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

// Mock the container service
export const MockContainerService = {
  getContainerStats: vi.fn().mockResolvedValue({
    cpu: 50,
    memory: 1024,
    timestamp: '2023-01-01T00:00:00Z',
  }),
  countByDeviceUuid: vi.fn().mockResolvedValue(5),
};

// Mock the device stats service
export const MockDeviceStatsService = {
  getStatsByDeviceAndType: vi.fn().mockResolvedValue([{ date: '2023-01-01T00:00:00Z', value: 42 }]),
  getStatsByDevicesAndType: vi.fn().mockResolvedValue([
    { deviceUuid: 'test-uuid-1', stats: [{ date: '2023-01-01T00:00:00Z', value: 42 }] },
    { deviceUuid: 'test-uuid-2', stats: [{ date: '2023-01-01T00:00:00Z', value: 43 }] },
  ]),
  getSingleAveragedStatsByDevicesAndType: vi.fn().mockResolvedValue([
    { deviceUuid: 'test-uuid-1', value: 42 },
    { deviceUuid: 'test-uuid-2', value: 43 },
  ]),
  getStatByDeviceAndType: vi.fn().mockResolvedValue({
    value: 42,
    date: '2023-01-01T00:00:00Z',
  }),
  getSingleAveragedStatByType: vi.fn().mockResolvedValue(42),
  getAveragedStatsByType: vi.fn().mockResolvedValue([{ date: '2023-01-01T00:00:00Z', value: 42 }]),
};
