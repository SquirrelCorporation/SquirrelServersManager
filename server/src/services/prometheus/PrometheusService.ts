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

interface DeviceFilter {
  type: 'device';
  deviceId: string;
}

interface ContainerFilter {
  type: 'container';
  containerId: string;
}

interface DevicesFilter {
  type: 'devices';
  deviceIds: string[];
}

interface ContainersFilter {
  type: 'containers';
  containerIds: string[];
}

type MetricsIdFilter = DeviceFilter | ContainerFilter;
type MetricsIdsFilter = DevicesFilter | ContainersFilter;

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

  private getMetricTypeFromStatsType(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
  ): MetricType {
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
      case StatsType.ContainerStatsType.CPU:
        return MetricType.CONTAINER_CPU_USAGE;
      case StatsType.ContainerStatsType.MEM:
        return MetricType.CONTAINER_MEMORY_USAGE;
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

  public async queryMetrics(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdsFilter,
    range: TimeRange,
  ): Promise<QueryResult<Array<{ date: string; value: string; name: string }>>> {
    try {
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const idsFilter = this.buildDeviceFilter(
        filter.type === 'devices' ? filter.deviceIds : filter.containerIds,
      );
      const queryFilter =
        filter.type === 'containers' ? `container_id=~"${idsFilter}"` : `device_id=~"${idsFilter}"`;

      const query = `avg_over_time(${metricName}{${queryFilter}}[${DEFAULT_AGGREGATION_WINDOW}])`;

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
          name:
            filter.type === 'devices'
              ? metric.metric.labels.device_id
              : metric.metric.labels.container_id,
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
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdsFilter,
    range: TimeRange,
  ): Promise<QueryResult<Array<{ value: number; name: string }>>> {
    try {
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const idsFilter = this.buildDeviceFilter(
        filter.type === 'devices' ? filter.deviceIds : filter.containerIds,
      );
      const labelName = filter.type === 'containers' ? 'container_id' : 'device_id';
      const { rangeDuration, offsetDuration } = this.calculateTimeParameters(range);

      const query = `avg by (${labelName})(avg_over_time(${metricName}{${labelName}=~"${idsFilter}"}[${rangeDuration}] ${offsetDuration}))`;

      const result = await this.driver.instantQuery(query);

      if (!result?.result) {
        return { success: false, data: null };
      }

      const data = result.result.map((metric) => ({
        value: metric.value.value as number,
        name: metric.metric.labels[labelName],
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
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdFilter,
  ): Promise<QueryResult<{ value: number; date?: string }>> {
    try {
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const queryFilter =
        filter.type === 'container'
          ? `container_id="${filter.containerId}"`
          : `device_id="${filter.deviceId}"`;

      const query = `${metricName}{${queryFilter}}`;

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
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
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

  public async queryAveragedStatsByType(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    range: TimeRange,
  ): Promise<QueryResult<Array<{ date: string; value: string }>>> {
    try {
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const query = `avg(avg_over_time(${metricName}[1h]))`;

      const result = await this.driver.rangeQuery(
        query,
        range.from,
        range.to,
        DEFAULT_AGGREGATION_WINDOW,
      );
      logger.error(result);
      if (!result?.result) {
        return { success: false, data: null };
      }
      logger.error(result.result);
      const data = result.result.flatMap((metric) =>
        metric.values.map((value) => ({
          date: DateTime.fromJSDate(new Date(value.time)).toFormat('yyyy-MM-dd-HH:00:00'),
          value: value.value,
        })),
      );
      return {
        success: true,
        data: data.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      logger.error(error, 'Error querying averaged stats by type:');
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default PrometheusService.getInstance();
