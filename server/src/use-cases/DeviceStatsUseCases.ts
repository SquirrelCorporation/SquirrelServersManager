import { DateTime } from 'luxon';
import DeviceStatRepo from '../database/repository/DeviceStatRepo';
import Device from '../database/model/Device';
import logger from '../logger';
import DeviceStat from '../database/model/DeviceStat';
import API from '../typings';

async function createDeviceStatFromJson(body: any, device: Device) {
  const deviceInfo: API.DeviceInfo = body;
  await DeviceStatRepo.create({
    device: device,
    storageTotalGb: deviceInfo.storage?.storageTotalGb,
    storageUsedGb: deviceInfo.storage?.storageUsedGb,
    storageFreeGb: deviceInfo.storage?.storageFreeGb,
    storageUsedPercentage: deviceInfo.storage?.storageUsedPercentage,
    storageFreePercentage: deviceInfo.storage?.storageFreePercentage,
    cpuUsage: deviceInfo.cpu?.usage,
    memTotalMb: deviceInfo.mem?.memTotalMb,
    memTotalUsedMb: deviceInfo.mem?.memTotalUsedMb,
    memTotalFreeMb: deviceInfo.mem?.memTotalFreeMb,
    memUsedPercentage: deviceInfo.mem?.memUsedPercentage,
    memFreePercentage: deviceInfo.mem?.memFreePercentage,
  });
}

async function createStatIfMinInterval(body: any, device: Device): Promise<void> {
  const deviceStat = await DeviceStatRepo.findLatestStat(device);
  if (
    !deviceStat ||
    !deviceStat.createdAt ||
    deviceStat.createdAt < DateTime.now().minus({ minute: 1 }).toJSDate()
  ) {
    logger.info(`[USECASE] - Creating new device stat record... (latest: ${deviceStat?.createdAt}`);
    await createDeviceStatFromJson(body, device);
  } else {
    logger.info('[USECASE] - DeviceStat already exist, not creating');
  }
}

async function getStatsByDeviceAndType(
  device: Device,
  from: number,
  type?: string,
): Promise<DeviceStat[] | null> {
  logger.info(
    `[USECASE] - getStatsByDeviceAndType - type: ${type}, from: ${from}, device: ${device.uuid}`,
  );
  switch (type) {
    case 'cpu':
      return await DeviceStatRepo.findStatsByDeviceAndType(device, '$cpuUsage', from);
    case 'memUsed':
      return await DeviceStatRepo.findStatsByDeviceAndType(device, '$memUsedPercentage', from);
    case 'memFree':
      return await DeviceStatRepo.findStatsByDeviceAndType(device, '$memFreePercentage', from);
    default:
      throw new Error('Unknown Type');
  }
}

async function getStatByDeviceAndType(
  device: Device,
  type?: string,
): Promise<[{ _id: string; value: number; createdAt: string }] | null> {
  logger.info(`[USECASE] - getStatByDeviceAndType - type: ${type}, device: ${device.uuid}`);
  switch (type) {
    case 'cpu':
      return await DeviceStatRepo.findStatByDeviceAndType(device, '$cpuUsage');
    case 'memUsed':
      return await DeviceStatRepo.findStatByDeviceAndType(device, '$memUsedPercentage');
    case 'memFree':
      return await DeviceStatRepo.findStatByDeviceAndType(device, '$memFreePercentage');
    default:
      throw new Error('Unknown Type');
  }
}

export default {
  createStatIfMinInterval,
  getStatsByDeviceAndType,
  getStatByDeviceAndType,
};
