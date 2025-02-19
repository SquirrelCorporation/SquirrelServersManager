// services/PrometheusService.ts
import { DateTime } from 'luxon';
import { PrometheusDriver } from 'prometheus-query';
import { StatsType } from 'ssm-shared-lib';
import { prometheusConf } from '../../config';
import deviceMetricsService, { MetricType } from '../../data/statistics/DeviceMetricsService';
import PinoLogger from '../../logger';
import { MetricsIdFilter, MetricsIdsFilter, isDevicesFilter } from './types/filters';
import {
  AggregatedMetric,
  LatestMetric,
  PrometheusConfig,
  QueryResult,
  TimeRange,
} from './types/prometheus';

const DEFAULT_AGGREGATION_WINDOW = '1h' as const;
const DAY_IN_SECONDS = 60 * 60 * 24;

export class PrometheusService {
  private static instance: PrometheusService;
  private readonly driver: PrometheusDriver;
  private readonly logger = PinoLogger.child(
    { module: 'PrometheusService' },
    { msgPrefix: '[PROMETHEUS] - ' },
  );

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

  private readonly metricTypeMap = {
    [StatsType.DeviceStatsType.CPU]: MetricType.CPU_USAGE,
    [StatsType.DeviceStatsType.MEM_USED]: MetricType.MEMORY_USAGE,
    [StatsType.DeviceStatsType.MEM_FREE]: MetricType.MEMORY_FREE,
    [StatsType.DeviceStatsType.DISK_USED]: MetricType.STORAGE_USAGE,
    [StatsType.DeviceStatsType.DISK_FREE]: MetricType.STORAGE_FREE,
    [StatsType.ContainerStatsType.CPU]: MetricType.CONTAINER_CPU_USAGE,
    [StatsType.ContainerStatsType.MEM]: MetricType.CONTAINER_MEMORY_USAGE,
  } as const;

  private getMetricTypeFromStatsType(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
  ): MetricType {
    const metricType = this.metricTypeMap[type];
    if (!metricType) {
      throw new Error(`Unsupported metric type: ${type}`);
    }
    return metricType;
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
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const queryFilter = this.buildQueryFilter(filter);
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

  // services/PrometheusService.ts
  // ... (previous code remains the same until queryMetrics method)

  public async queryAggregatedMetrics(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdsFilter,
    range: TimeRange,
  ): Promise<QueryResult<AggregatedMetric[]>> {
    try {
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const queryFilter = this.buildQueryFilter(filter);
      const labelName = isDevicesFilter(filter) ? 'device_id' : 'container_id';
      const { rangeDuration, offsetDuration } = this.calculateTimeParameters(range);

      const query = `avg by (${labelName})(avg_over_time(${metricName}{${queryFilter}}[${rangeDuration}] ${offsetDuration}))`;

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
      const metricType = this.getMetricTypeFromStatsType(type);
      const metricName = deviceMetricsService.getMetricName(metricType);
      const idKey = filter.type === 'container' ? 'container_id' : 'device_id';
      const idValue = filter.type === 'container' ? filter.containerId : filter.deviceId;
      const query = `${metricName}{${idKey}="${idValue}"}`;

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
      return this.handleError('Error querying averaged stat by type:', error);
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

// Export singleton instance
export default PrometheusService.getInstance();
