import { DateTime } from 'luxon';
import { StatsType, Systeminformation } from 'ssm-shared-lib';
import { PrometheusDriver } from 'prometheus-query';
import Device from '../data/database/model/Device';
import DeviceStat from '../data/database/model/DeviceStat';
import ContainerRepo from '../data/database/repository/ContainerRepo';
import DeviceStatRepo from '../data/database/repository/DeviceStatRepo';
import { updateQueue } from '../helpers/queue/queueManager';
import PinoLogger from '../logger';
import { UpdateStatsType } from '../modules/remote-system-information/helpers/queueProcessor';

const prom = new PrometheusDriver({
  endpoint: 'http://prometheus:9090',
  baseURL: '/api/v1',
});

const logger = PinoLogger.child(
  { module: 'DeviceStatsUseCases' },
  { msgPrefix: '[DEVICE_STATS] - ' },
);

async function createDeviceStatFromJson(deviceInfo: any, device: Device) {
  logger.info(`createDeviceStatFromJson - DeviceUuid: ${device?.uuid}`);
  await updateQueue.add({
    deviceUuid: device.uuid,
    updateType: UpdateStatsType.MEM_STATS,
    data: {
      total: deviceInfo.mem?.memTotalMb * 1024 * 1024,
      used: deviceInfo.mem?.memUsedPercentage,
    } as Systeminformation.MemData,
  });
  await updateQueue.add({
    deviceUuid: device.uuid,
    updateType: UpdateStatsType.CPU_STATS,
    data: { currentLoad: deviceInfo.cpu?.usage } as Systeminformation.CurrentLoadData,
  });
  await updateQueue.add({
    deviceUuid: device.uuid,
    updateType: UpdateStatsType.FILE_SYSTEM_STATS,
    data: [
      { size: deviceInfo.storage?.storageTotalGb, used: deviceInfo.storage?.storageUsedGb },
    ] as Systeminformation.FsSizeData[],
  });
}

async function createStatIfMinInterval(deviceInfo: any, device: Device): Promise<void> {
  logger.info(`createStatIfMinInterval - DeviceUuid: ${device?.uuid}`);
  await createDeviceStatFromJson(deviceInfo, device);
}

async function getStatsByDeviceAndType(
  device: Device,
  from: number,
  type?: string,
): Promise<DeviceStat[] | null> {
  logger.info(`getStatsByDeviceAndType - type: ${type}, from: ${from}, device: ${device.uuid}`);
  let q = '';
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      q = `device_cpu_usage_percent{device_id="${device.uuid}"}`;
      break;
    case StatsType.DeviceStatsType.MEM_USED:
      q = `device_memory_usage_percent{device_id="${device.uuid}"}`;
      break;
    case StatsType.DeviceStatsType.MEM_FREE:
      q = `device_memory_free_percent{device_id="${device.uuid}"}`;
      break;
    default:
      throw new Error('Unknown Type');
  }
  const step = 5 * 60; // 1 point every 5 min
  try {
    const res = await prom.rangeQuery(
      q,
      DateTime.now().minus({ hour: from }).toJSDate(),
      DateTime.now().toJSDate(),
      step,
    );
    if (res) {
      return res.result?.[0]?.values?.map((e) => {
        return {
          date: e.time,
          value: e.value,
        };
      });
    }
  } catch (error: any) {
    logger.error(error);
  }
  return null;
}

async function getStatsByDevicesAndType(
  devices: Device[],
  from: Date,
  to: Date,
  type?: string,
): Promise<{ date: string; value: string; name: string }[] | null> {
  logger.info(
    `findStatsByDevicesAndType - type: ${type}, from: ${from}, nb devices: ${devices.length}`,
  );
  let q = '';

  // Step 1: Convert dates to Prometheus-friendly formats
  // Calculate `from` and `to` in seconds since epoch
  const fromSeconds = Math.floor(from.getTime() / 1000);
  const toSeconds = Math.floor(to.getTime() / 1000);

  if (toSeconds <= fromSeconds) {
    throw new Error("'to' date must be greater than 'from' date");
  }

  // Step 2: Build PromQL query
  const deviceFilter = devices.map((e) => e.uuid).join('|'); // Join device IDs with '|'
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      q = `avg_over_time(device_cpu_usage_percent{device_id=~"${deviceFilter}"}[1h])`;
      break;
    case StatsType.DeviceStatsType.MEM_USED:
      q = `avg_over_time(device_memory_usage_percent{device_id=~"${deviceFilter}"}[1h])`;
      break;
    case StatsType.DeviceStatsType.MEM_FREE:
      q = `avg_over_time(device_memory_free_percent{device_id=~"${deviceFilter}"}[1h])`;
      break;
    case StatsType.DeviceStatsType.DISK_USED:
      q = `avg_over_time(device_storage_usage_percent{device_id=~"${deviceFilter}"}[1h])`;
      break;
    default:
      throw new Error('Unknown Type');
  }
  try {
    const res = await prom.rangeQuery(q, from, to, '1h');
    if (res && res.result && res.result) {
      const final: any[] = [];
      res.result.map((e) => {
        const device = devices.find((f) => f.uuid === e.metric.labels.device_id);
        e.values.map((e) => {
          final.push({
            date: DateTime.fromJSDate(new Date(e.time)).toFormat('yyyy-MM-dd-HH:00:00'),
            value: e.value,
            name: `${device?.fqdn} - ${device?.ip}`,
          });
        });
      });
      return final;
    } else {
      return null;
    }
  } catch (error: any) {
    logger.error(error);
  }
  return null;
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
  // Convert `from` and `to` (JS Date objects) into PromQL-compatible ranges
  const now = new Date(); // Current time
  const rangeInSeconds = Math.floor((to.getTime() - from.getTime()) / 1000); // Duration in seconds
  const offsetInSeconds = Math.floor((now.getTime() - to.getTime()) / 1000); // Offset from `to` to `now`
  // Convert durations to PromQL-compatible formats
  const rangeDuration = `${Math.floor(rangeInSeconds / (60 * 60 * 24))}d`; // Convert seconds to days
  const offsetDuration =
    offsetInSeconds > 0
      ? `offset ${Math.floor(offsetInSeconds / (60 * 60 * 24))}d` // Convert seconds to days
      : '';

  if (rangeInSeconds <= 0) {
    throw new Error("'to' date must be greater than 'from' date");
  }

  const deviceFilter = devices.map((e) => e.uuid).join('|'); // Join device IDs with '|'
  let q = '';
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      q = `avg by (device_id)(avg_over_time(device_cpu_usage_percent{device_id=~"${deviceFilter}"}[${rangeDuration}] ${offsetDuration}))`;
      break;
    case StatsType.DeviceStatsType.MEM_USED:
      q = `avg by (device_id)(avg_over_time(device_memory_usage_percent{device_id=~"${deviceFilter}"}[${rangeDuration}] ${offsetDuration}))`;
      break;
    case StatsType.DeviceStatsType.MEM_FREE:
      q = `avg by(device_id)(avg_over_time(device_memory_free_percent{device_id=~"${deviceFilter}"}[${rangeDuration}] ${offsetDuration}))`;
      break;
    case StatsType.DeviceStatsType.DISK_FREE:
      q = `avg by(device_id)(avg_over_time(device_storage_free_percent{device_id=~"${deviceFilter}"}[${rangeDuration}] ${offsetDuration}))`;
      break;
    case StatsType.DeviceStatsType.DISK_USED:
      q = `avg by(device_id)(avg_over_time(device_storage_usage_percent{device_id=~"${deviceFilter}"}[${rangeDuration}] ${offsetDuration}))`;
      break;
    default:
      throw new Error('Unknown Type');
  }
  try {
    const res = await prom.instantQuery(q);
    logger.error(res);
    if (res && res.result && res.result) {
      const final: { value: number; name: string }[] = [];
      res.result.map((e) => {
        const device = devices.find((f) => f.uuid === e.metric.labels.device_id);
        final.push({
          value: e.value?.value,
          name: `${device?.fqdn} - ${device?.ip}`,
        });
      });
      return final;
    } else {
      return null;
    }
  } catch (error: any) {
    logger.error(error);
  }
  return null;
}

async function getStatByDeviceAndType(
  device: Device,
  type?: string,
): Promise<[{ _id?: string; value: number; date?: string }] | null> {
  logger.info(`getStatByDeviceAndType - type: ${type}, device: ${device.uuid}`);
  let q = '';
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      q = `device_cpu_usage_percent{device_id="${device.uuid}"}`;
      break;
    case StatsType.DeviceStatsType.MEM_USED:
      q = `device_memory_usage_percent{device_id="${device.uuid}"}`;
      break;
    case StatsType.DeviceStatsType.MEM_FREE:
      q = `device_memory_free_percent{device_id="${device.uuid}"}`;
      break;
    case StatsType.DeviceStatsType.CONTAINERS:
      return [{ value: await ContainerRepo.countByDeviceId(device._id) }];
    default:
      throw new Error('Unknown Type');
  }
  try {
    const res = await prom.instantQuery(q, DateTime.now().toJSDate());
    if (res && res.result && res.result[0]) {
      return [
        {
          date: res.result[0].value.time as string,
          value: res.result[0].value.value as number,
        },
      ];
    } else {
      return null;
    }
  } catch (error: any) {
    logger.error(error);
  }
  return null;
}

async function getSingleAveragedStatByType(
  from: number,
  to: number,
  type?: string,
): Promise<[{ value: number }] | null> {
  logger.info(`getStatByType - type: ${type}, from: ${from}, to: ${to}`);
  let q = '';
  const offset = to > 0 ? `offset ${to}d` : '';
  switch (type) {
    case StatsType.DeviceStatsType.CPU:
      q = `avg(avg_over_time(device_cpu_usage_percent[${from - to}d] ${offset}))`;
      break;
    case StatsType.DeviceStatsType.MEM_USED:
      q = `avg(avg_over_time(device_memory_usage_percent[${from - to}d] ${offset}))`;
      break;
    case StatsType.DeviceStatsType.MEM_FREE:
      q = `avg(avg_over_time(device_memory_free_percent[${from - to}d] ${offset}))`;
      break;
    default:
      throw new Error('Unknown Type');
  }
  try {
    const res = await prom.instantQuery(q);
    if (res && res.result && res.result[0]) {
      return [
        {
          value: res.result[0].value.value as number,
        },
      ];
    } else {
      return null;
    }
  } catch (error: any) {
    logger.error(error);
  }
  return null;
}

export default {
  createStatIfMinInterval,
  getStatsByDeviceAndType,
  getStatByDeviceAndType,
  getStatsByDevicesAndType,
  getSingleAveragedStatsByDevicesAndType,
  getSingleAveragedStatByType,
};
