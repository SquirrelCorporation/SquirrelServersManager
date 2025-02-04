import { Systeminformation } from 'ssm-shared-lib';
import logger from '../../logger';
import Statistics from './index';

async function processMemoryStatistics(memoryUsage: Systeminformation.MemData, deviceUuid: string) {
  if (memoryUsage.used === undefined || memoryUsage.total === undefined) {
    return;
  }
  logger.debug(`Memory usage: ${memoryUsage.used} - total: ${memoryUsage.total}`);
  if (memoryUsage.used !== 0) {
    await Statistics.setMemoryUsage(memoryUsage.total / memoryUsage.used, deviceUuid);
    await Statistics.setMemoryFree(1 - memoryUsage.total / memoryUsage.used, deviceUuid);
  } else {
    await Statistics.setMemoryUsage(0, deviceUuid);
  }
}

async function processCpuStatistics(
  cpuUsage: Systeminformation.CurrentLoadData,
  deviceUuid: string,
) {
  if (cpuUsage.currentLoad === undefined) {
    return;
  }
  logger.debug(`CPU usage: ${cpuUsage.currentLoad}`);
  await Statistics.setCpuUsage(cpuUsage.currentLoad, deviceUuid);
}

async function processFileStorageStatistics(
  fileStorageUsage: Systeminformation.FsSizeData[],
  deviceUuid: string,
) {
  if (fileStorageUsage === undefined || fileStorageUsage.length === 0) {
    return;
  }
  const totalUsed = fileStorageUsage.reduce((acc, cur) => acc + cur.used, 0);
  const totalSize = fileStorageUsage.reduce((acc, cur) => acc + cur.size, 0);
  logger.debug(`File storage usage: ${totalUsed} used on ${totalSize} total`);
  if (totalUsed !== 0) {
    await Statistics.setFileStorageUsage(totalSize / totalUsed, deviceUuid);
    await Statistics.setFileStorageFree(1 - totalSize / totalUsed, deviceUuid);
  } else {
    await Statistics.setFileStorageUsage(0, deviceUuid);
    await Statistics.setFileStorageFree(1, deviceUuid);
  }
}

export default {
  processMemoryStatistics,
  processCpuStatistics,
  processFileStorageStatistics,
};
