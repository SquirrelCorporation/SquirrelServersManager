import Dockerode from 'dockerode';
import { DateTime } from 'luxon';
import { StatsType } from 'ssm-shared-lib';
import Container from '../data/database/model/Container';
import { DeviceMetricsService, MetricType } from '../data/statistics/DeviceMetricsService';
import PinoLogger from '../logger';
import prometheusService, { QueryResult } from './prometheus/PrometheusService';

const logger = PinoLogger.child(
  { module: 'ContainerStatsUseCases' },
  { msgPrefix: '[CONTAINER_STATS] - ' },
);

async function createStats(container: Container, stats: Dockerode.ContainerStats) {
  const { cpu_stats, precpu_stats, memory_stats } = stats;
  const cpuDelta = cpu_stats.cpu_usage.total_usage - precpu_stats.cpu_usage.total_usage;

  const cpuSystemDelta = cpu_stats.system_cpu_usage - precpu_stats.system_cpu_usage;

  const memUsed: undefined | number = memory_stats.usage - (memory_stats.stats.cache || 0);
  const memAvailable = memory_stats.limit;
  const memUsedPercentage = Math.round((memUsed / memAvailable) * 100.0) || undefined;
  const cpuUsedPercentage = Math.round((cpuDelta / cpuSystemDelta) * 100) || undefined;
  if (memUsedPercentage) {
    await DeviceMetricsService.getInstance().setContainerMetric(
      MetricType.CONTAINER_MEMORY_USAGE,
      memUsedPercentage,
      container.id,
    );
  }
  if (cpuUsedPercentage) {
    await DeviceMetricsService.getInstance().setContainerMetric(
      MetricType.CONTAINER_CPU_USAGE,
      cpuUsedPercentage,
      container.id,
    );
  }
}

async function getStatByDeviceAndType(
  container: Container,
  type?: string,
): Promise<[{ _id?: string; value: number; date?: string }] | null> {
  logger.info(`getStatByDeviceAndType - type: ${type}, container: ${container.id}`);

  if (!type) {
    throw new Error('Type is required');
  }
  let result: QueryResult<{ value: number; date?: string }> | undefined;
  switch (type) {
    case StatsType.ContainerStatsType.CPU:
    case StatsType.ContainerStatsType.MEM:
      result = await prometheusService.queryLatestMetric(type, {
        type: 'container',
        containerId: container.id,
      });
      break;
    default:
      throw new Error('Unknown Type');
  }

  if (!result.success) {
    logger.error(`Failed to get latest stat: ${result.error}`);
    return null;
  }

  return result.data ? [result.data] : null;
}

async function getStatsByDeviceAndType(
  container: Container,
  from: number,
  type?: string,
): Promise<{ date: string; value: number; name?: string }[] | null> {
  logger.info(`getStatsByDeviceAndType - type: ${type}, from: ${from}, container: ${container.id}`);

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

    let result: QueryResult<{ date: string; value: string; name: string }[]>;
    switch (type) {
      case StatsType.ContainerStatsType.CPU:
      case StatsType.ContainerStatsType.MEM:
        result = await prometheusService.queryMetrics(
          type as StatsType.ContainerStatsType,
          { type: 'containers', containerIds: [container.id] },
          { from: fromDate, to: toDate },
        );
        break;
      default:
        throw new Error('Unknown Type');
    }

    if (!result.success) {
      logger.error(`Failed to get stats: ${result.error}`);
      return null;
    }

    if (!result.data) {
      return null;
    }

    // Transform the data into DeviceStat format
    return result.data
      .map((item) => ({
        date: item.date,
        value: parseFloat(item.value),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    logger.error(`Error getting stats for container ${container.id}:`, error);
    return null;
  }
}

async function getAveragedStats(type: StatsType.ContainerStatsType) {
  try {
    const result = await prometheusService.queryAveragedStatsByType(type, {
      from: DateTime.now().minus({ day: 7 }).toJSDate(),
      to: DateTime.now().toJSDate(),
    });

    if (!result.success) {
      logger.error(`Failed to get averaged stat: ${result.error}`);
      return null;
    }

    return result.data ? result.data : null;
  } catch (error) {
    logger.error(`Error getting averaged stat for type ${type}:`, error);
    return null;
  }
}

async function getCpUAndMemAveragedStats() {
  const cpuStats = await getAveragedStats(StatsType.ContainerStatsType.CPU);
  const memStats = await getAveragedStats(StatsType.ContainerStatsType.MEM);
  return {
    cpuStats: cpuStats,
    memStats: memStats,
  };
}

export default {
  createStats,
  getStatByDeviceAndType,
  getStatsByDeviceAndType,
  getCpUAndMemAveragedStats,
};
