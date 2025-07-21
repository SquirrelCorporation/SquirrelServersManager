import { StatsType } from 'ssm-shared-lib';
import { AggregatedMetric, LatestMetric, QueryResult, TimeRange } from './types/prometheus.types';
import { MetricsIdFilter, MetricsIdsFilter } from './types/filters.types';

export const PROMETHEUS_SERVICE = 'PROMETHEUS_SERVICE';

export interface IPrometheusService {
  getMetricName(type: any): string;

  queryMetrics(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdsFilter,
    range: TimeRange,
  ): Promise<QueryResult<{ name: string; value: number; date: string }[]>>;

  queryAggregatedMetrics(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdsFilter,
    range: TimeRange,
  ): Promise<QueryResult<AggregatedMetric[]>>;

  queryLatestMetric(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    filter: MetricsIdFilter,
  ): Promise<QueryResult<LatestMetric>>;

  queryAveragedStatByType(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    range: { days: number; offset: number },
  ): Promise<QueryResult<{ value: number }>>;

  queryAveragedStatsByType(
    type: StatsType.DeviceStatsType | StatsType.ContainerStatsType,
    range: TimeRange,
  ): Promise<QueryResult<Array<{ date: string; value: string }>>>;

  prometheusServerStats(): Promise<any>;
}
