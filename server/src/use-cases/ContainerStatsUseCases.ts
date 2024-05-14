import Container from '../data/database/model/Container';
import Device from '../data/database/model/Device';
import DeviceStat from '../data/database/model/DeviceStat';
import ContainerStatsRepo from '../data/database/repository/ContainerStatsRepo';
import DeviceStatRepo from '../data/database/repository/DeviceStatRepo';
import logger from '../logger';

async function getStatByDeviceAndType(
  container: Container,
  type?: string,
): Promise<[{ _id: string; value: number; createdAt: string }] | null> {
  logger.info(
    `[USECASE][CONTAINERSTATS] - getStatByDeviceAndType - type: ${type}, device: ${container.id}`,
  );
  switch (type) {
    case 'cpu':
      return await ContainerStatsRepo.findStatByDeviceAndType(container, '$cpuUsedPercentage');
    case 'mem':
      return await ContainerStatsRepo.findStatByDeviceAndType(container, '$memUsedPercentage');
    default:
      throw new Error('Unknown Type');
  }
}

async function getStatsByDeviceAndType(
  container: Container,
  from: number,
  type?: string,
): Promise<ContainerStat[] | null> {
  logger.info(
    `[USECASE][CONTAINERSTATS] - getStatsByDeviceAndType - type: ${type}, from: ${from}, container: ${container.id}`,
  );
  switch (type) {
    case 'cpu':
      return await ContainerStatsRepo.findStatsByDeviceAndType(
        container,
        '$cpuUsedPercentage',
        from,
      );
    case 'mem':
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
