import { DateTime } from 'luxon';
import DeviceStatRepo from '../database/repository/DeviceStatRepo';
import Device from '../database/model/Device';
import logger from '../logger';
import DeviceStat from '../database/model/DeviceStat';
import API from '../typings';
import { getConfFromCache, getIntConfFromCache } from '../redis';
import Keys from '../redis/defaults/keys';

async function createDeviceStatFromJson(deviceInfo: API.DeviceInfo, device: Device) {
  logger.info(`[USECASE][DEVICESTATS] - createDeviceStatFromJson - DeviceUuid: ${device?.uuid}`);
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

async function createStatIfMinInterval(deviceInfo: API.DeviceInfo, device: Device): Promise<void> {
  logger.info(`[USECASE][DEVICESTATS] - createStatIfMinInterval - DeviceUuid: ${device?.uuid}`);
  const deviceStat = await DeviceStatRepo.findLatestStat(device);
  const minInternal = await getIntConfFromCache(
    Keys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS,
  );
  if (
    !deviceStat ||
    !deviceStat.createdAt ||
    deviceStat.createdAt < DateTime.now().minus({ second: minInternal }).toJSDate()
  ) {
    logger.info(
      `[USECASE][DEVICESTATS] - createStatIfMinInterval- Creating new device stat record... (latest: ${deviceStat?.createdAt}`,
    );
    await createDeviceStatFromJson(deviceInfo, device);
  } else {
    logger.info(
      '[USECASE][DEVICESTATS] - createStatIfMinInterval - DeviceStat already exist, not creating',
    );
  }
}

async function getStatsByDeviceAndType(
  device: Device,
  from: number,
  type?: string,
): Promise<DeviceStat[] | null> {
  logger.info(
    `[USECASE][DEVICESTATS] - getStatsByDeviceAndType - type: ${type}, from: ${from}, device: ${device.uuid}`,
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

async function getStatsByDevicesAndType(
  devices: Device[],
  from: Date,
  to: Date,
  type?: string,
): Promise<[{ date: string; value: string; name: string }] | null> {
  logger.info(
    `[USECASE][DEVICESTATS] - findStatsByDevicesAndType - type: ${type}, from: ${from}, nb devices: ${devices.length}`,
  );
  switch (type) {
    case 'cpu':
      return await DeviceStatRepo.findStatsByDevicesAndType(devices, '$cpuUsage', from, to);
    case 'memUsed':
      return await DeviceStatRepo.findStatsByDevicesAndType(
        devices,
        '$memUsedPercentage',
        from,
        to,
      );
    case 'memFree':
      return await DeviceStatRepo.findStatsByDevicesAndType(
        devices,
        '$memFreePercentage',
        from,
        to,
      );
    default:
      throw new Error('Unknown Type');
  }
}

async function getSingleAveragedStatsByDevicesAndType(
  devices: Device[],
  from: Date,
  to: Date,
  type?: string,
): Promise<[{ value: string; name: string }] | null> {
  logger.info(
    `[USECASE][DEVICESTATS] - findSingleAveragedStatByDevicesAndType - type: ${type}, from: ${from}, to: ${to}, nb devices: ${devices.length}`,
  );
  switch (type) {
    case 'cpu':
      return await DeviceStatRepo.findSingleAveragedStatByDevicesAndType(
        devices,
        '$cpuUsage',
        from,
        to,
      );
    case 'memUsed':
      return await DeviceStatRepo.findSingleAveragedStatByDevicesAndType(
        devices,
        '$memUsedPercentage',
        from,
        to,
      );
    case 'memFree':
      return await DeviceStatRepo.findSingleAveragedStatByDevicesAndType(
        devices,
        '$memFreePercentage',
        from,
        to,
      );
    default:
      throw new Error('Unknown Type');
  }
}

async function getStatByDeviceAndType(
  device: Device,
  type?: string,
): Promise<[{ _id: string; value: number; createdAt: string }] | null> {
  logger.info(
    `[USECASE][DEVICESTATS] - getStatByDeviceAndType - type: ${type}, device: ${device.uuid}`,
  );
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

async function getSingleAveragedStatByType(
  from: number,
  to: number,
  type?: string,
): Promise<[{ value: number }] | null> {
  logger.info(`[USECASE][DEVICESTATS] - getStatByType - type: ${type}`);
  switch (type) {
    case 'cpu':
      return await DeviceStatRepo.findSingleAveragedStatAndType('$cpuUsage', from, to);
    case 'memUsed':
      return await DeviceStatRepo.findSingleAveragedStatAndType('$memUsedPercentage', from, to);
    case 'memFree':
      return await DeviceStatRepo.findSingleAveragedStatAndType('$memFreePercentage', from, to);
    default:
      throw new Error('Unknown Type');
  }
}

export default {
  createStatIfMinInterval,
  getStatsByDeviceAndType,
  getStatByDeviceAndType,
  getStatsByDevicesAndType,
  getSingleAveragedStatsByDevicesAndType,
  getSingleAveragedStatByType,
};
