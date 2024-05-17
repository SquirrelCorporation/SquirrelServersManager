import { API } from 'ssm-shared-lib';
import { ContainerStatsType } from 'ssm-shared-lib/distribution/enums/stats';
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
    case ContainerStatsType.CPU:
      return await ContainerStatsRepo.findStatByDeviceAndType(container, '$cpuUsedPercentage');
    case ContainerStatsType.MEM:
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
    case ContainerStatsType.CPU:
      return await ContainerStatsRepo.findStatsByDeviceAndType(
        container,
        '$cpuUsedPercentage',
        from,
      );
    case ContainerStatsType.MEM:
      return await ContainerStatsRepo.findStatsByDeviceAndType(
        container,
        '$memUsedPercentage',
        from,
      );
    default:
      throw new Error('Unknown Type');
  }
}
export default {
  getStatByDeviceAndType,
  getStatsByDeviceAndType,
};
