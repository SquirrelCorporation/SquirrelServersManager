import { Inject, Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { StatsType } from 'ssm-shared-lib';
import { IContainerEntity } from '../../domain/entities/container.entity';
import { MetricType } from '../../../statistics/application/interfaces/metrics-service.interface';
import {
  IPrometheusService,
  PROMETHEUS_SERVICE,
} from '../../../../infrastructure/prometheus/prometheus.interface';
import { QueryResult } from '../../../../infrastructure/prometheus/types/prometheus.types';
import { IContainerStatsService } from '../interfaces/container-stats-service.interface';
import { METRICS_SERVICE } from '../../../statistics/application/interfaces/metrics-service.interface';
import { MetricsServiceInterface } from '../../../statistics/application/interfaces/metrics-service.interface';

/**
 * Service for managing container statistics
 */
@Injectable()
export class ContainerStatsService implements IContainerStatsService {
  private readonly logger = new Logger(ContainerStatsService.name);

  constructor(
    @Inject(METRICS_SERVICE)
    private readonly metricsService: MetricsServiceInterface,
    @Inject(PROMETHEUS_SERVICE)
    private readonly prometheusService: IPrometheusService,
  ) {}

  /**
   * Create stats for a container
   * @param container The container entity
   * @param stats The container stats from Dockerode
   */
  async createStats(container: IContainerEntity, stats: any) {
    const { cpu_stats, precpu_stats, memory_stats } = stats;

    try {
      const memUsed: undefined | number = memory_stats.usage - (memory_stats?.stats?.cache || 0);
      const memAvailable = memory_stats.limit;
      const memUsedPercentage = Math.round((memUsed / memAvailable) * 100.0) || undefined;
      if (memUsedPercentage) {
        await this.metricsService.setContainerMetric(
          MetricType.CONTAINER_MEMORY_USAGE,
          memUsedPercentage,
          container.id,
        );
      }
    } catch (error: any) {
      this.logger.warn(
        `Failed to set memory usage for container ${container.id}: ${error?.message}`,
      );
    }

    try {
      const cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;
      const cpuSystemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;
      const cpuUsedPercentage = Math.round((cpuDelta / cpuSystemDelta) * 100) || undefined;
      if (cpuUsedPercentage) {
        await this.metricsService.setContainerMetric(
          MetricType.CONTAINER_CPU_USAGE,
          cpuUsedPercentage,
          container.id,
        );
      }
    } catch (error: any) {
      this.logger.warn(`Failed to set cpu usage for container ${container.id}: ${error?.message}`);
    }
  }

  /**
   * Get stat by container and type
   * @param container The container entity
   * @param type The stat type
   * @returns The container stat
   */
  async getStatByDeviceAndType(
    container: IContainerEntity,
    type?: string,
  ): Promise<[{ _id?: string; value: number; date?: string }] | null> {
    this.logger.log(`getStatByDeviceAndType - type: ${type}, container: ${container.id}`);

    if (!type) {
      throw new Error('Type is required');
    }

    let result: QueryResult<{ value: number; date?: string }> | undefined;
    switch (type) {
      case StatsType.ContainerStatsType.CPU:
      case StatsType.ContainerStatsType.MEM:
        result = await this.prometheusService.queryLatestMetric(type, {
          type: 'container',
          containerId: container.id,
        });
        break;
      default:
        throw new Error('Unknown Type');
    }

    if (!result.success) {
      this.logger.error(`Failed to get latest stat: ${result.error}`);
      return null;
    }

    return result.data ? [result.data] : null;
  }

  /**
   * Get stats by container and type
   * @param container The container entity
   * @param from The number of hours to look back
   * @param type The stat type
   * @returns The container stats
   */
  async getStatsByDeviceAndType(
    container: IContainerEntity,
    from: number,
    type?: string,
  ): Promise<{ date: string; value: number; name?: string }[] | null> {
    this.logger.log(
      `getStatsByDeviceAndType - type: ${type}, from: ${from}, container: ${container.id}`,
    );

    if (!type) {
      throw new Error('Type is required');
    }

    if (!container?.id) {
      throw new Error('Container ID is required');
    }

    try {
      // Calculate time range
      const toDate = DateTime.now().toJSDate();
      const fromDate = DateTime.now().minus({ hours: from }).toJSDate();

      let result: QueryResult<{ date: string; value: number; name: string }[]>;
      switch (type) {
        case StatsType.ContainerStatsType.CPU:
        case StatsType.ContainerStatsType.MEM:
          result = await this.prometheusService.queryMetrics(
            type as StatsType.ContainerStatsType,
            { type: 'containers', containerIds: [container.id] },
            { from: fromDate, to: toDate },
          );
          break;
        default:
          throw new Error('Unknown Type');
      }

      if (!result.success) {
        this.logger.error(`Failed to get stats: ${result.error}`);
        return null;
      }

      if (!result.data) {
        return null;
      }

      // Transform the data into DeviceStat format
      return result.data
        .map((item) => ({
          date: item.date,
          value: parseFloat(`${item.value}`),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      this.logger.error(`Error getting stats for container ${container.id}:`, error);
      return null;
    }
  }

  /**
   * Get averaged stats for a specific type
   * @param type The stat type
   * @returns The averaged stats
   */
  async getAveragedStats(type: StatsType.ContainerStatsType) {
    try {
      const result = await this.prometheusService.queryAveragedStatsByType(type, {
        from: DateTime.now().minus({ day: 7 }).toJSDate(),
        to: DateTime.now().toJSDate(),
      });

      if (!result.success) {
        this.logger.error(`Failed to get averaged stat: ${result.error}`);
        return null;
      }

      return result.data ? result.data : null;
    } catch (error) {
      this.logger.error(`Error getting averaged stat for type ${type}:`, error);
      return null;
    }
  }

  /**
   * Get CPU and memory averaged stats
   * @returns The CPU and memory averaged stats
   */
  async getCpuAndMemAveragedStats() {
    const cpuStats = await this.getAveragedStats(StatsType.ContainerStatsType.CPU);
    const memStats = await this.getAveragedStats(StatsType.ContainerStatsType.MEM);
    return {
      cpuStats: cpuStats,
      memStats: memStats,
    };
  }
}
