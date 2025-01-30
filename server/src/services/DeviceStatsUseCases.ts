import { StatsType, Systeminformation } from 'ssm-shared-lib';
import { DateTime } from 'luxon';
import Device from '../data/database/model/Device';
import ContainerRepo from '../data/database/repository/ContainerRepo';
import { updateQueue } from '../helpers/queue/queueManager';
import PinoLogger from '../logger';
import { UpdateStatsType } from '../modules/remote-system-information/helpers/queueProcessor';
import deviceMetricsService, { MetricType } from '../data/statistics/DeviceMetricsService';
import prometheusService from './prometheus/PrometheusService';

const logger = PinoLogger.child(
  { module: 'DeviceStatsUseCases' },
  { msgPrefix: '[DEVICE_STATS] - ' },
);

// Types
interface DeviceSystemInfo {
  mem?: {
    memTotalMb: number;
    memUsedPercentage: number;
  };
  cpu?: {
    usage: number;
  };
  storage?: {
    storageTotalGb: number;
    storageUsedGb: number;
  };
}

interface DeviceStat {
  date: string;
  value: number;
}

// Constants
const BYTES_IN_MB = 1024 * 1024;

// Utility functions
const convertMbToBytes = (mb: number): number => mb * BYTES_IN_MB;

async function createDeviceStatFromJson(deviceInfo: DeviceSystemInfo, device: Device) {
  if (!device?.uuid) {
    logger.error('Invalid device: missing UUID');
    throw new Error('Invalid device: missing UUID');
  }

  logger.info(`createDeviceStatFromJson - DeviceUuid: ${device.uuid}`);

  try {
    const metrics: Array<{ type: MetricType; value: number }> = [];

    // Memory stats
    if (deviceInfo.mem) {
      metrics.push(
        { type: MetricType.MEMORY_USAGE, value: deviceInfo.mem.memUsedPercentage },
        { type: MetricType.MEMORY_FREE, value: 100 - deviceInfo.mem.memUsedPercentage },
      );

      await updateQueue.add({
        deviceUuid: device.uuid,
        updateType: UpdateStatsType.MEM_STATS,
        data: {
          total: convertMbToBytes(deviceInfo.mem.memTotalMb),
          used: deviceInfo.mem.memUsedPercentage,
        } as Systeminformation.MemData,
      });
    }

    // CPU stats
    if (deviceInfo.cpu) {
      metrics.push({ type: MetricType.CPU_USAGE, value: deviceInfo.cpu.usage });

      await updateQueue.add({
        deviceUuid: device.uuid,
        updateType: UpdateStatsType.CPU_STATS,
        data: { currentLoad: deviceInfo.cpu.usage } as Systeminformation.CurrentLoadData,
      });
    }

    // Storage stats
    if (deviceInfo.storage) {
      const storageUsedPercent =
        (deviceInfo.storage.storageUsedGb / deviceInfo.storage.storageTotalGb) * 100;
      metrics.push(
        { type: MetricType.STORAGE_USAGE, value: storageUsedPercent },
        { type: MetricType.STORAGE_FREE, value: 100 - storageUsedPercent },
      );

      await updateQueue.add({
        deviceUuid: device.uuid,
        updateType: UpdateStatsType.FILE_SYSTEM_STATS,
        data: [
          {
            size: deviceInfo.storage.storageTotalGb,
            used: deviceInfo.storage.storageUsedGb,
          },
        ] as Systeminformation.FsSizeData[],
      });
    }

    // Update all metrics in one batch
    if (metrics.length > 0) {
      await deviceMetricsService.setMetrics(metrics, device.uuid);
    }
  } catch (error) {
    logger.error(`Failed to update device stats for device ${device.uuid}: ${error}`);
    throw error;
  }
}

async function createStatIfMinInterval(
  deviceInfo: DeviceSystemInfo,
  device: Device,
): Promise<void> {
  logger.info(`createStatIfMinInterval - DeviceUuid: ${device?.uuid}`);
  await createDeviceStatFromJson(deviceInfo, device);
}

async function getStatsByDeviceAndType(
  device: Device,
  from: number,
  type?: string,
): Promise<DeviceStat[] | null> {
  logger.info(`getStatsByDeviceAndType - type: ${type}, from: ${from}, device: ${device.uuid}`);

  if (!type) {
    throw new Error('Type is required');
  }

  if (!device?.uuid) {
    throw new Error('Device UUID is required');
  }

  try {
    // Calculate time range
    const toDate = DateTime.now().toJSDate();
    const fromDate = DateTime.now().minus({ hours: from }).toJSDate();

    const result = await prometheusService.queryDeviceMetrics(
      type as StatsType.DeviceStatsType,
      [device.uuid],
      { from: fromDate, to: toDate },
    );

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
    logger.error(`Error getting stats for device ${device.uuid}:`, error);
    return null;
  }
}

async function getStatsByDevicesAndType(
  devices: Device[],
  from: Date,
  to: Date,
  type?: string,
): Promise<{ date: string; value: string; name: string }[] | null> {
  logger.info(
    `getStatsByDevicesAndType - type: ${type}, from: ${from}, to: ${to}, nb devices: ${devices.length}`,
  );

  if (!type) {
    throw new Error('Type is required');
  }

  const result = await prometheusService.queryDeviceMetrics(
    type as StatsType.DeviceStatsType,
    devices.map((d) => d.uuid),
    { from, to },
  );

  if (!result.success) {
    logger.error(`Failed to get stats: ${result.error}`);
    return null;
  }

  return (
    result.data?.map((item) => ({
      ...item,
      name: devices.find((d) => d.uuid === item.name)?.fqdn || item.name,
    })) || null
  );
}

async function getSingleAveragedStatsByDevicesAndType(
  devices: Device[],
  from: Date,
  to: Date,
  type?: StatsType.DeviceStatsType,
): Promise<{ value: number; name: string }[] | null> {
  logger.info(
    `findSingleAveragedStatByDevicesAndType - type: ${type}, from: ${from}, to: ${to}, nb devices: ${devices.length}`,
  );

  if (!type) {
    throw new Error('Type is required');
  }

  const result = await prometheusService.queryAggregatedMetrics(
    type,
    devices.map((d) => d.uuid),
    { from, to },
  );

  if (!result.success) {
    logger.error(`Failed to get aggregated stats: ${result.error}`);
    return null;
  }

  return (
    result.data?.map((item) => ({
      ...item,
      name: devices.find((d) => d.uuid === item.name)?.fqdn || item.name,
    })) || null
  );
}

async function getStatByDeviceAndType(
  device: Device,
  type?: string,
): Promise<[{ _id?: string; value: number; date?: string }] | null> {
  logger.info(`getStatByDeviceAndType - type: ${type}, device: ${device.uuid}`);

  if (!type) {
    throw new Error('Type is required');
  }

  if (type === StatsType.DeviceStatsType.CONTAINERS) {
    return [{ value: await ContainerRepo.countByDeviceId(device._id) }];
  }

  const result = await prometheusService.queryLatestMetric(
    type as StatsType.DeviceStatsType,
    device.uuid,
  );

  if (!result.success) {
    logger.error(`Failed to get latest stat: ${result.error}`);
    return null;
  }

  return result.data ? [result.data] : null;
}

export default {
  createStatIfMinInterval,
  getStatsByDeviceAndType,
  getStatByDeviceAndType,
  getStatsByDevicesAndType,
  getSingleAveragedStatsByDevicesAndType,
};
