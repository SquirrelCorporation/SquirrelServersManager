import { DateTime } from 'luxon';
import { API, SettingsKeys, StatsType } from 'ssm-shared-lib';
import { getIntConfFromCache } from '../data/cache';
import Device from '../data/database/model/Device';
import DeviceStat from '../data/database/model/DeviceStat';
import ContainerRepo from '../data/database/repository/ContainerRepo';
import DeviceStatRepo from '../data/database/repository/DeviceStatRepo';
import PinoLogger from '../logger';

const logger = PinoLogger.child(
  { module: 'DeviceStatsUseCases' },
  { msgPrefix: '[DEVICE_STATS] - ' },
);

async function createDeviceStatFromJson(deviceInfo: API.DeviceInfo, device: Device) {
  logger.info(`createDeviceStatFromJson - DeviceUuid: ${device?.uuid}`);
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
  logger.info(`createStatIfMinInterval - DeviceUuid: ${device?.uuid}`);
  const deviceStat = await DeviceStatRepo.findLatestStat(device);
  const minInternal = await getIntConfFromCache(
    SettingsKeys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS,
  );
  if (
    !deviceStat ||
    !deviceStat.createdAt ||
    deviceStat.createdAt < DateTime.now().minus({ second: minInternal }).toJSDate()
  ) {
    logger.info(
      `createStatIfMinInterval- Creating new device stat record... (latest: ${deviceStat?.createdAt}`,
    );
    await createDeviceStatFromJson(deviceInfo, device);
  } else {
    logger.info('createStatIfMinInterval - DeviceStat already exist, not creating');
  }
}

async function getStatsByDeviceAndType(
  device: Device,
  from: number,
  type?: string,
): Promise<DeviceStat[] | null> {
  logger.info(`getStatsByDeviceAndType - type: ${type}, from: ${from}, device: ${device.uuid}`);
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      return await DeviceStatRepo.findStatsByDeviceAndType(device, '$cpuUsage', from);
    case StatsType.DeviceStatsType.MEM_USED:
      return await DeviceStatRepo.findStatsByDeviceAndType(device, '$memUsedPercentage', from);
    case StatsType.DeviceStatsType.MEM_FREE:
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
    `findStatsByDevicesAndType - type: ${type}, from: ${from}, nb devices: ${devices.length}`,
  );
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      return await DeviceStatRepo.findStatsByDevicesAndType(devices, '$cpuUsage', from, to);
    case StatsType.DeviceStatsType.MEM_USED:
      return await DeviceStatRepo.findStatsByDevicesAndType(
        devices,
        '$memUsedPercentage',
        from,
        to,
      );
    case StatsType.DeviceStatsType.MEM_FREE:
      return await DeviceStatRepo.findStatsByDevicesAndType(
        devices,
        '$memFreePercentage',
        from,
        to,
      );
    case StatsType.DeviceStatsType.DISK_USED:
      return await DeviceStatRepo.findStatsByDevicesAndType(
        devices,
        '$storageUsedPercentage',
        from,
        to,
      );
    case StatsType.DeviceStatsType.DISK_FREE:
      return await DeviceStatRepo.findStatsByDevicesAndType(
        devices,
        '$storageFreePercentage',
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
  type?: StatsType.DeviceStatsType,
): Promise<[{ value: string; name: string }] | null> {
  logger.info(
    `findSingleAveragedStatByDevicesAndType - type: ${type}, from: ${from}, to: ${to}, nb devices: ${devices.length}`,
  );
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      return await DeviceStatRepo.findSingleAveragedStatByDevicesAndType(
        devices,
        '$cpuUsage',
        from,
        to,
      );
    case StatsType.DeviceStatsType.MEM_USED:
      return await DeviceStatRepo.findSingleAveragedStatByDevicesAndType(
        devices,
        '$memUsedPercentage',
        from,
        to,
      );
    case StatsType.DeviceStatsType.MEM_FREE:
      return await DeviceStatRepo.findSingleAveragedStatByDevicesAndType(
        devices,
        '$memFreePercentage',
        from,
        to,
      );
    case StatsType.DeviceStatsType.DISK_USED:
      return await DeviceStatRepo.findSingleAveragedStatByDevicesAndType(
        devices,
        '$storageUsedPercentage',
        from,
        to,
      );
    case StatsType.DeviceStatsType.DISK_FREE:
      return await DeviceStatRepo.findSingleAveragedStatByDevicesAndType(
        devices,
        '$storageFreePercentage',
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
): Promise<[{ _id?: string; value: number; createdAt?: string }] | null> {
  logger.info(`getStatByDeviceAndType - type: ${type}, device: ${device.uuid}`);
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      return await DeviceStatRepo.findStatByDeviceAndType(device, '$cpuUsage');
    case StatsType.DeviceStatsType.MEM_USED:
      return await DeviceStatRepo.findStatByDeviceAndType(device, '$memUsedPercentage');
    case StatsType.DeviceStatsType.MEM_FREE:
      return await DeviceStatRepo.findStatByDeviceAndType(device, '$memFreePercentage');
    case StatsType.DeviceStatsType.CONTAINERS:
      return [{ value: await ContainerRepo.countByDeviceId(device._id) }];
    default:
      throw new Error('Unknown Type');
  }
}

async function getSingleAveragedStatByType(
  from: number,
  to: number,
  type?: string,
): Promise<[{ value: number }] | null> {
  logger.info(`getStatByType - type: ${type}`);
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      return await DeviceStatRepo.findSingleAveragedStatAndType('$cpuUsage', from, to);
    case StatsType.DeviceStatsType.MEM_USED:
      return await DeviceStatRepo.findSingleAveragedStatAndType('$memUsedPercentage', from, to);
    case StatsType.DeviceStatsType.MEM_FREE:
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
