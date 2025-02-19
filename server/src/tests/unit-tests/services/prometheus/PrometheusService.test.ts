import { PrometheusDriver, ResponseType } from 'prometheus-query';
import { StatsType } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prometheusConf } from '../../../../config';
import { PrometheusService } from '../../../../services/prometheus/PrometheusService';
import { MetricsIdsFilter } from '../../../../services/prometheus/types/filters';

// Mock dependencies
vi.mock('prometheus-query');
vi.mock('../../../data/statistics/DeviceMetricsService');
vi.mock('../../../logger');

describe('PrometheusService', () => {
  let service: PrometheusService;
  let mockDriver: ReturnType<typeof vi.mocked<PrometheusDriver>>;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset singleton instance
    (PrometheusService as any).instance = null;

    service = PrometheusService.getInstance();
    mockDriver = (service as any).driver;
  });

  describe('getInstance', () => {
    it('should create a singleton instance', () => {
      const instance1 = PrometheusService.getInstance();
      const instance2 = PrometheusService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with correct config', () => {
      expect(PrometheusDriver).toHaveBeenCalledWith({
        endpoint: prometheusConf.host,
        baseURL: prometheusConf.baseURL,
        auth: {
          username: prometheusConf.user,
          password: prometheusConf.password,
        },
      });
    });
  });

  describe('queryMetrics', () => {
    const mockRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-02'),
    };

    const mockDeviceFilter: MetricsIdsFilter = {
      type: 'devices',
      deviceIds: ['device1', 'device2'],
    };

    beforeEach(() => {
      vi.mocked(mockDriver.rangeQuery).mockResolvedValue({
        resultType: ResponseType.SCALAR,
        result: [
          {
            metric: { labels: { device_id: 'device1' } },
            values: [{ time: '2024-01-01T00:00:00Z', value: '42' }],
          },
        ],
      });
    });

    it('should query device metrics successfully', async () => {
      const result = await service.queryMetrics(
        StatsType.DeviceStatsType.CPU,
        mockDeviceFilter,
        mockRange,
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(mockDriver.rangeQuery).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(mockDriver.rangeQuery).mockRejectedValue(new Error('Network error'));

      const result = await service.queryMetrics(
        StatsType.DeviceStatsType.CPU,
        mockDeviceFilter,
        mockRange,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('queryAggregatedMetrics', () => {
    const mockRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-02'),
    };

    const mockContainerFilter: MetricsIdsFilter = {
      type: 'containers',
      containerIds: ['container1'],
    };

    beforeEach(() => {
      vi.mocked(mockDriver.instantQuery).mockResolvedValue({
        resultType: ResponseType.SCALAR,
        result: [
          {
            metric: { labels: { container_id: 'container1' } },
            value: { value: 42 },
          },
        ],
      });
    });

    it('should query aggregated metrics successfully', async () => {
      const result = await service.queryAggregatedMetrics(
        StatsType.ContainerStatsType.CPU,
        mockContainerFilter,
        mockRange,
      );

      expect(result.success).toBe(true);
      expect(result.data?.[0].value).toBe(42);
    });

    it('should handle empty results', async () => {
      vi.mocked(mockDriver.instantQuery).mockResolvedValue({
        resultType: ResponseType.SCALAR,
        result: null,
      });

      const result = await service.queryAggregatedMetrics(
        StatsType.ContainerStatsType.CPU,
        mockContainerFilter,
        mockRange,
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  describe('queryLatestMetric', () => {
    const mockDeviceFilter = {
      type: 'device' as const,
      deviceId: 'device1',
    };

    beforeEach(() => {
      vi.mocked(mockDriver.instantQuery).mockResolvedValue({
        resultType: ResponseType.SCALAR,
        result: [
          {
            value: {
              time: '2024-01-01T00:00:00Z',
              value: 42,
            },
          },
        ],
      });
    });

    it('should query latest metric successfully', async () => {
      const result = await service.queryLatestMetric(
        StatsType.DeviceStatsType.CPU,
        mockDeviceFilter,
      );

      expect(result.success).toBe(true);
      expect(result.data?.value).toBe(42);
    });
  });

  describe('queryAveragedStatByType', () => {
    const mockRange = {
      days: 7,
      offset: 0,
    };

    beforeEach(() => {
      vi.mocked(mockDriver.instantQuery).mockResolvedValue({
        resultType: ResponseType.SCALAR,
        result: [
          {
            value: { value: 42 },
          },
        ],
      });
    });

    it('should query averaged stat successfully', async () => {
      const result = await service.queryAveragedStatByType(
        StatsType.DeviceStatsType.CPU,
        mockRange,
      );

      expect(result.success).toBe(true);
      expect(result.data?.value).toBe(42);
    });

    it('should include offset in query when provided', async () => {
      const rangeWithOffset = { days: 7, offset: 2 };
      await service.queryAveragedStatByType(StatsType.DeviceStatsType.CPU, rangeWithOffset);

      expect(mockDriver.instantQuery).toHaveBeenCalledWith(expect.stringContaining('offset 2d'));
    });
  });

  describe('queryAveragedStatsByType', () => {
    const mockRange = {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-02'),
    };

    beforeEach(() => {
      vi.mocked(mockDriver.rangeQuery).mockResolvedValue({
        resultType: ResponseType.SCALAR,
        result: [
          {
            values: [
              {
                time: '2024-01-01T00:00:00Z',
                value: '42',
              },
            ],
          },
        ],
      });
    });

    it('should query averaged stats successfully', async () => {
      const result = await service.queryAveragedStatsByType(
        StatsType.DeviceStatsType.CPU,
        mockRange,
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].value).toBe('42');
    });

    it('should sort results by date', async () => {
      vi.mocked(mockDriver.rangeQuery).mockResolvedValue({
        resultType: ResponseType.SCALAR,
        result: [
          {
            values: [
              { time: '2024-01-02T00:00:00Z', value: '43' },
              { time: '2024-01-01T00:00:00Z', value: '42' },
            ],
          },
        ],
      });

      const result = await service.queryAveragedStatsByType(
        StatsType.DeviceStatsType.CPU,
        mockRange,
      );

      expect(result.success).toBe(true);
      expect(result.data?.[0].date).toBe('2024-01-01-00:00:00');
      expect(result.data?.[1].date).toBe('2024-01-02-00:00:00');
    });
  });

  describe('Private methods', () => {
    describe('calculateTimeParameters', () => {
      it('should calculate correct time parameters', () => {
        const range = {
          from: new Date('2024-01-01'),
          to: new Date('2024-01-02'),
        };

        const timeParams = (service as any).calculateTimeParameters(range);
        expect(timeParams.rangeDuration).toBe('1d');
      });

      it('should throw error for invalid date range', () => {
        const range = {
          from: new Date('2024-01-02'),
          to: new Date('2024-01-01'),
        };

        expect(() => {
          (service as any).calculateTimeParameters(range);
        }).toThrow("'to' date must be greater than 'from' date");
      });
    });

    describe('formatMetricDate', () => {
      it('should format date correctly', () => {
        const date = new Date('2024-01-01T15:30:45Z');
        const formatted = (service as any).formatMetricDate(date);
        expect(formatted).toBe('2024-01-01-15:00:00');
      });
    });

    describe('handleError', () => {
      it('should format Error instances correctly', () => {
        const error = new Error('Test error');
        const result = (service as any).handleError('Error message:', error);
        expect(result.error).toBe('Test error');
      });

      it('should handle non-Error objects', () => {
        const result = (service as any).handleError('Error message:', 'string error');
        expect(result.error).toBe('Unknown error');
      });
    });
  });
});
