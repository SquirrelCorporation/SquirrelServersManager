import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrometheusDriver } from 'prometheus-query';
import { StatsType } from 'ssm-shared-lib';
import { Gauge } from 'prom-client';
import { prometheusConf } from '../../config';
import PinoLogger from '../../logger';
import { MetricsIdFilter, MetricsIdsFilter, isDevicesFilter } from './types/filters.types';
import {
  AggregatedMetric,
  LatestMetric,
  PrometheusConfig,
  QueryResult,
  TimeRange,
} from './types/prometheus.types';

const DEFAULT_AGGREGATION_WINDOW = '1h' as const;
const DAY_IN_SECONDS = 60 * 60 * 24;

/**
 * Types of metrics that can be collected
 */
export enum MetricType {
  CPU_USAGE = 'cpu_usage',
  MEMORY_USAGE = 'memory_usage',
  MEMORY_FREE = 'memory_free',
  STORAGE_USAGE = 'storage_usage',
  STORAGE_FREE = 'storage_free',
  CONTAINER_CPU_USAGE = 'container_cpu_usage',
  CONTAINER_MEMORY_USAGE = 'container_memory_usage',
}

/**
 * Definition of a metric with its properties
 */
export interface MetricDefinition {
  name: string;
  help: string;
  type: MetricType;
  gauge: Gauge<string>;
}

/**
 * Types of metrics that can be collected
 */
export const METRICS_DEFINITIONS: MetricDefinition[] = [
  {
    type: MetricType.CPU_USAGE,
    name: 'device_cpu_usage_percent',
    help: 'CPU usage percent of devices',
    gauge: new Gauge({
      name: 'device_cpu_usage_percent',
      help: 'CPU usage percent of devices',
      labelNames: ['device_id'],
    }),
  },
  {
    type: MetricType.MEMORY_USAGE,
    name: 'device_memory_usage_percent',
    help: 'Memory usage in percent for devices',
    gauge: new Gauge({
      name: 'device_memory_usage_percent',
      help: 'Memory usage in percent for devices',
      labelNames: ['device_id'],
    }),
  },
  {
    type: MetricType.MEMORY_FREE,
    name: 'device_memory_free_percent',
    help: 'Memory free in percent for devices',
    gauge: new Gauge({
      name: 'device_memory_free_percent',
      help: 'Memory free in percent for devices',
      labelNames: ['device_id'],
    }),
  },
  {
    type: MetricType.STORAGE_USAGE,
    name: 'device_storage_usage_percent',
    help: 'File storage usage in percent for devices',
    gauge: new Gauge({
      name: 'device_storage_usage_percent',
      help: 'File storage usage in percent for devices',
      labelNames: ['device_id'],
    }),
  },
  {
    type: MetricType.STORAGE_FREE,
    name: 'device_storage_free_percent',
    help: 'File storage free in percent for devices',
    gauge: new Gauge({
      name: 'device_storage_free_percent',
      help: 'File storage free in percent for devices',
      labelNames: ['device_id'],
    }),
  },
  {
    type: MetricType.CONTAINER_CPU_USAGE,
    name: 'container_cpu_usage_percent',
    help: 'CPU usage in percent for containers',
    gauge: new Gauge({
      name: 'container_cpu_usage_percent',
      help: 'CPU usage in percent for containers',
      labelNames: ['container_id'],
    }),
  },
  {
    type: MetricType.CONTAINER_MEMORY_USAGE,
    name: 'container_memory_usage_percent',
    help: 'Memory usage in percent for containers',
    gauge: new Gauge({
      name: 'container_memory_usage_percent',
      help: 'Memory usage in percent for containers',
      labelNames: ['container_id'],
    }),
  },
];

@Injectable()
export class PrometheusService {
  private readonly driver: PrometheusDriver;
  private readonly logger = PinoLogger.child(
    { module: 'PrometheusService' },
    { msgPrefix: '[PROMETHEUS] - ' },
  );

  constructor(config?: PrometheusConfig) {
    const configuration = config || {
      endpoint: prometheusConf.host,
      baseURL: prometheusConf.baseURL,
      username: prometheusConf.user,
      password: prometheusConf.password,
    };

    this.driver = new PrometheusDriver({
      endpoint: configuration.endpoint,
      baseURL: configuration.baseURL,
      auth: {
        username: configuration.username,
        password: configuration.password,
      },
    });
  }

  /**
   * Get the name of a metric by type
   * @param type The type of metric
   * @returns The name of the metric
   */
  public getMetricName(type: any): string {
    const metric = METRICS_DEFINITIONS.find((metric) => metric.type === type);
    if (!metric) {
      throw new Error(`Metric type ${type} not found`);
    }
    return metric.name;
  }

  private buildQueryFilter(filter: MetricsIdsFilter): string {
    const ids = isDevicesFilter(filter) ? filter.deviceIds : filter.containerIds;
    const filterType = isDevicesFilter(filter) ? 'device_id' : 'container_id';
    return `${filterType}=~"${ids.join('|')}"`;
  }

  private calculateTimeParameters(range: TimeRange) {
    const now = new Date();
    const rangeInSeconds = Math.floor((range.to.getTime() - range.from.getTime()) / 1000);
    const offsetInSeconds = Math.floor((now.getTime() - range.to.getTime()) / 1000);

    if (rangeInSeconds <= 0) {
      throw new Error("'to' date must be greater than 'from' date");
    }

    return {
      rangeDuration: `${Math.floor(rangeInSeconds / DAY_IN_SECONDS)}d`,
      offsetDuration:
        offsetInSeconds > 0 ? `offset ${Math.floor(offsetInSeconds / DAY_IN_SECONDS)}d` : '',
    };
  }

  private handleError(message: string, error: unknown): QueryResult<never> {
    this.logger.error(error, message);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  private formatMetricDate(date: Date): string {
    return DateTime.fromJSDate(date, { zone: 'UTC' }).toFormat('yyyy-MM-dd-HH:00:00');
  }

  public async queryMetrics(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdsFilter,
    range: TimeRange,
  ): Promise<QueryResult<{ name: string; value: number; date: string }[]>> {
    try {
      const metricName = this.getMetricName(type);
      const queryFilter = this.buildQueryFilter(filter);
      const query = `avg_over_time(${metricName}{${queryFilter}}[${DEFAULT_AGGREGATION_WINDOW}])`;
      this.logger.info(`queryMetrics - query: ${query}`);
      const result = await this.driver.rangeQuery(
        query,
        range.from,
        range.to,
        DEFAULT_AGGREGATION_WINDOW,
      );

      if (!result?.result) {
        return { success: false, data: null };
      }

      const labelKey = isDevicesFilter(filter) ? 'device_id' : 'container_id';
      const data: { date: string; name: string; value: number }[] = result.result.flatMap(
        (metric) =>
          metric.values.map((value) => ({
            date: this.formatMetricDate(new Date(value.time)),
            value: value.value,
            name: metric.metric.labels[labelKey],
          })),
      );

      return {
        success: true,
        data: data.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      return this.handleError('Error querying device metrics:', error);
    }
  }

  public async queryAggregatedMetrics(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdsFilter,
    range: TimeRange,
  ): Promise<QueryResult<AggregatedMetric[]>> {
    try {
      const metricName = this.getMetricName(type);
      const queryFilter = this.buildQueryFilter(filter);
      const labelName = isDevicesFilter(filter) ? 'device_id' : 'container_id';
      const { rangeDuration, offsetDuration } = this.calculateTimeParameters(range);

      const query = `avg by (${labelName})(avg_over_time(${metricName}{${queryFilter}}[${rangeDuration}] ${offsetDuration}))`;
      this.logger.info(`queryAggregatedMetrics - query: ${query}`);
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
      return this.handleError('Error querying aggregated metrics:', error);
    }
  }

  public async queryLatestMetric(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdFilter,
  ): Promise<QueryResult<LatestMetric>> {
    try {
      const metricName = this.getMetricName(type);
      const idKey = filter.type === 'container' ? 'container_id' : 'device_id';
      const idValue = filter.type === 'container' ? filter.containerId : filter.deviceId;
      const query = `${metricName}{${idKey}="${idValue}"}`;
      this.logger.info(`queryLatestMetric - query: ${query}`);
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
      return this.handleError('Error querying latest metric:', error);
    }
  }

  public async queryAveragedStatByType(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    range: { days: number; offset: number },
  ): Promise<QueryResult<{ value: number }>> {
    try {
      const metricName = this.getMetricName(type);
      const offsetStr = range.offset > 0 ? `offset ${range.offset}d` : '';
      const query = `avg(avg_over_time(${metricName}[${range.days}d] ${offsetStr}))`;
      this.logger.info(`queryAveragedStatByType - query: ${query}`);
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
      return this.handleError('Error querying averaged stat by type:', error);
    }
  }

  public async queryAveragedStatsByType(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    range: TimeRange,
  ): Promise<QueryResult<Array<{ date: string; value: string }>>> {
    try {
      const metricName = this.getMetricName(type);
      const query = `avg(avg_over_time(${metricName}[1h]))`;

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
          date: this.formatMetricDate(new Date(value.time)),
          value: value.value,
        })),
      );

      return {
        success: true,
        data: data.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      return this.handleError('Error querying averaged stats by type:', error);
    }
  }
}
