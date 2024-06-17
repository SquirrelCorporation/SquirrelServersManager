import { DateTime } from 'luxon';
import { API } from 'ssm-shared-lib';
import { StatsType } from 'ssm-shared-lib';
import Container from '../data/database/model/Container';
import ContainerStatsRepo from '../data/database/repository/ContainerStatsRepo';
import logger from '../logger';

async function getStatByDeviceAndType(
  container: Container,
  type?: string,
): Promise<[{ _id: string; value: number; createdAt: string }] | null> {
  logger.info(
    `[USECASE][CONTAINERSTATS] - getStatByDeviceAndType - type: ${type}, device: ${container.id}`,
  );
  switch (type) {
    case StatsType.ContainerStatsType.CPU:
      return await ContainerStatsRepo.findStatByDeviceAndType(container, '$cpuUsedPercentage');
    case StatsType.ContainerStatsType.MEM:
      return await ContainerStatsRepo.findStatByDeviceAndType(container, '$memUsedPercentage');
    default:
      throw new Error('Unknown Type');
  }
}

async function getStatsByDeviceAndType(
  container: Container,
  from: number,
  type?: string,
): Promise<API.ContainerStats[] | null> {
  logger.info(
    `[USECASE][CONTAINERSTATS] - getStatsByDeviceAndType - type: ${type}, from: ${from}, container: ${container.id}`,
  );
  switch (type) {
    case StatsType.ContainerStatsType.CPU:
      return await ContainerStatsRepo.findStatsByDeviceAndType(
        container,
        '$cpuUsedPercentage',
        from,
      );
    case StatsType.ContainerStatsType.MEM:
      return await ContainerStatsRepo.findStatsByDeviceAndType(
        container,
        '$memUsedPercentage',
        from,
      );
    default:
      throw new Error('Unknown Type');
  }
}

async function getCpUAndMemAveragedStats() {
  const cpuStats = await ContainerStatsRepo.findAllAveragedStatsByType(
    '$cpuUsedPercentage',
    DateTime.now().minus({ day: 7 }).toJSDate(),
    DateTime.now().toJSDate(),
  );
  const memStats = await ContainerStatsRepo.findAllAveragedStatsByType(
    '$memUsedPercentage',
    DateTime.now().minus({ day: 7 }).toJSDate(),
    DateTime.now().toJSDate(),
  );
  return {
    cpuStats: cpuStats,
    memStats: memStats,
  };
}

export default {
  getStatByDeviceAndType,
  getStatsByDeviceAndType,
  getCpUAndMemAveragedStats,
};
