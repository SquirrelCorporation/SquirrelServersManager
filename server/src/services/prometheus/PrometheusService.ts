import axios from 'axios';
import { PrometheusDriver } from 'prometheus-query';
import { DateTime } from 'luxon';
import { StatsType } from 'ssm-shared-lib';
import PinoLogger from '../../logger';
import { prometheusConf } from '../../config';
import deviceMetricsService, { MetricType } from '../../data/statistics/DeviceMetricsService';

const logger = PinoLogger.child({ module: 'PrometheusService' }, { msgPrefix: '[PROMETHEUS] - ' });

// Types
export interface PrometheusConfig {
  endpoint: string;
  baseURL: string;
  username: string;
  password: string;
}

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface QueryResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

// Constants
const DEFAULT_AGGREGATION_WINDOW = '1h';

export class PrometheusService {
  private driver: PrometheusDriver;
  private static instance: PrometheusService;

  private constructor(config: PrometheusConfig) {
    this.driver = new PrometheusDriver({
      endpoint: config.endpoint,
      baseURL: config.baseURL,
      auth: {
        username: config.username,
        password: config.password,
      },
    });
  }

  async updatePrometheusRetention(retentionTime: string): Promise<void> {
    try {
      const response = await axios.post(
        `${prometheusConf.host}/-/reload`,
        {},
        {
          params: {
            'storage.tsdb.retention.time': retentionTime,
          },
          auth: {
            username: prometheusConf.user,
            password: prometheusConf.password,
          },
        },
      );

      if (response.status === 200) {
        logger.info(`Successfully updated retention time to ${retentionTime}`);
      }
    } catch (error) {
      logger.error(error, 'Failed to update Prometheus retention');
    }
  }

  public static getInstance(): PrometheusService {
    if (!PrometheusService.instance) {
      PrometheusService.instance = new PrometheusService({
        endpoint: prometheusConf.host,
        baseURL: prometheusConf.baseURL,
        username: prometheusConf.user,
        password: prometheusConf.password,
      });
    }
    return PrometheusService.instance;
  }

  private getMetricTypeFromStatsType(type: StatsType.DeviceStatsType): MetricType {
    switch (type) {
      case StatsType.DeviceStatsType.CPU:
        return MetricType.CPU_USAGE;
      case StatsType.DeviceStatsType.MEM_USED:
        return MetricType.MEMORY_USAGE;
      case StatsType.DeviceStatsType.MEM_FREE:
        return MetricType.MEMORY_FREE;
      case StatsType.DeviceStatsType.DISK_USED:
        return MetricType.STORAGE_USAGE;
      case StatsType.DeviceStatsType.DISK_FREE:
        return MetricType.STORAGE_FREE;
      default:
        throw new Error(`Unsupported metric type: ${type}`);
    }
  }

  private buildDeviceFilter(deviceIds: string[]): string {
    return deviceIds.join('|');
  }

  private calculateTimeParameters(range: TimeRange): {
    rangeDuration: string;
    offsetDuration: string;
  } {
    const now = new Date();
    const rangeInSeconds = Math.floor((range.to.getTime() - range.from.getTime()) / 1000);
    const offsetInSeconds = Math.floor((now.getTime() - range.to.getTime()) / 1000);

    if (rangeInSeconds <= 0) {
      throw new Error("'to' date must be greater than 'from' date");
    }

    return {
      rangeDuration: `${Math.floor(rangeInSeconds / (60 * 60 * 24))}d`,
      offsetDuration:
        offsetInSeconds > 0 ? `offset ${Math.floor(offsetInSeconds / (60 * 60 * 24))}d` : '',
    };
  }

  public async queryDeviceMetrics(
    type: StatsType.DeviceStatsType,
    deviceIds: string[],
    range: TimeRange,
  ): Promise<QueryResult<Array<{ date: string; value: string; name: string }>>> {
    try {
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const deviceFilter = this.buildDeviceFilter(deviceIds);
      const query = `avg_over_time(${metricName}{device_id=~"${deviceFilter}"}[${DEFAULT_AGGREGATION_WINDOW}])`;

      const result = await this.driver.rangeQuery(
        query,
        range.from,
        range.to,
        DEFAULT_AGGREGATION_WINDOW,
      );

      if (!result?.result) {
        return { success: false, data: null };
      }

      const data = result.result.flatMap((metric) =>
        metric.values.map((value) => ({
          date: DateTime.fromJSDate(new Date(value.time)).toFormat('yyyy-MM-dd-HH:00:00'),
          value: value.value,
          name: metric.metric.labels.device_id,
        })),
      );

      return {
        success: true,
        data: data.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      logger.error('Error querying device metrics:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public async queryAggregatedMetrics(
    type: StatsType.DeviceStatsType,
    deviceIds: string[],
    range: TimeRange,
  ): Promise<QueryResult<Array<{ value: number; name: string }>>> {
    try {
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const deviceFilter = this.buildDeviceFilter(deviceIds);
      const { rangeDuration, offsetDuration } = this.calculateTimeParameters(range);

      const query = `avg by (device_id)(avg_over_time(${metricName}{device_id=~"${deviceFilter}"}[${rangeDuration}] ${offsetDuration}))`;

      const result = await this.driver.instantQuery(query);

      if (!result?.result) {
        return { success: false, data: null };
      }

      const data = result.result.map((metric) => ({
        value: metric.value.value as number,
        name: metric.metric.labels.device_id,
      }));

      return { success: true, data };
    } catch (error) {
      logger.error(error, 'Error querying aggregated metrics:');
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public async queryLatestMetric(
    type: StatsType.DeviceStatsType,
    deviceId: string,
  ): Promise<QueryResult<{ value: number; date?: string }>> {
    try {
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const query = `${metricName}{device_id="${deviceId}"}`;

      const result = await this.driver.instantQuery(query, DateTime.now().toJSDate());

      if (!result?.result?.[0]) {
        return { success: false, data: null };
      }

      return {
        success: true,
        data: {
          date: result.result[0].value.time as string,
          value: result.result[0].value.value as number,
        },
      };
    } catch (error) {
      logger.error(error, 'Error querying latest metric:');
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public async queryAveragedStatByType(
    type: StatsType.DeviceStatsType,
    range: { days: number; offset: number },
  ): Promise<QueryResult<{ value: number }>> {
    try {
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const offsetStr = range.offset > 0 ? `offset ${range.offset}d` : '';
      const query = `avg(avg_over_time(${metricName}[${range.days}d] ${offsetStr}))`;

      const result = await this.driver.instantQuery(query);

      if (!result?.result?.[0]) {
        return { success: false, data: null };
      }

      return {
        success: true,
        data: {
          value: result.result[0].value.value as number,
        },
      };
    } catch (error) {
      logger.error(error, 'Error querying averaged stat by type:');
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default PrometheusService.getInstance();
