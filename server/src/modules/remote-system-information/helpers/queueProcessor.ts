import DeviceRepo from '../../../data/database/repository/DeviceRepo';
import { updateQueue } from '../../../helpers/queue/queueManager';
import pinoLogger from '../../../logger';
import StatisticsRepo from '../../../data/statistics/StatisticsRepo';

export enum UpdateType {
  CPU = 'CPU',
  Memory = 'Memory',
  MemoryLayout = 'MemoryLayout',
  FileSystems = 'FileSystems',
  Network = 'Network',
  Graphics = 'Graphics',
  WiFi = 'WiFi',
  USB = 'USB',
  OS = 'OS',
  System = 'System',
  Versions = 'Versions',
  Bluetooth = 'Bluetooth',
}

export enum UpdateStatsType {
  CPU_STATS = 'CPU_Stats',
  MEM_STATS = 'Memory_Stats',
  FILE_SYSTEM_STATS = 'FileSystems_Stats',
}

updateQueue.process(async (job) => {
  const { deviceUuid, updateType, data } = job.data;
  const logger = pinoLogger.child(
    { module: 'RemoteSystemInformationQueueProcessor', moduleId: deviceUuid },
    { msgPrefix: '[QUEUE_PROCESSOR] - ' },
  );
  try {
    const device = await DeviceRepo.findOneByUuid(deviceUuid);
    if (!device) {
      throw new Error('Device not found');
    }
    if (!device.systemInformation) {
      device.systemInformation = {};
    }
    // Handle different update types
    switch (updateType) {
      case UpdateType.CPU:
        device.systemInformation.cpu = data;
        break;
      case UpdateType.Memory:
        device.systemInformation.mem = data;
        break;
      case UpdateType.FileSystems:
        device.systemInformation.fileSystems = data;
        break;
      case UpdateType.Network:
        device.systemInformation.networkInterfaces = data;
        break;
      case UpdateType.Graphics:
        device.systemInformation.graphics = data;
        break;
      case UpdateType.WiFi:
        device.systemInformation.wifi = data;
        break;
      case UpdateType.USB:
        device.systemInformation.usb = data;
        break;
      case UpdateType.OS:
        device.systemInformation.os = data;
        device.fqdn = data?.fqdn;
        device.hostname = data?.hostname;
        break;
      case UpdateType.System:
        device.systemInformation.system = data;
        break;
      case UpdateType.Versions:
        device.systemInformation.versions = data;
        break;
      case UpdateType.MemoryLayout:
        device.systemInformation.memLayout = data;
        break;
      case UpdateType.Bluetooth:
        device.systemInformation.bluetooth = data;
        break;
      case UpdateStatsType.CPU_STATS:
        await StatisticsRepo.processCpuStatistics(data, deviceUuid);
        break;
      case UpdateStatsType.MEM_STATS:
        await StatisticsRepo.processMemoryStatistics(data, deviceUuid);
        break;
      case UpdateStatsType.FILE_SYSTEM_STATS:
        await StatisticsRepo.processFileStorageStatistics(data, deviceUuid);
        break;
      default:
        throw new Error(`Unknown update type: ${updateType}`);
    }
    if (!Object.values(UpdateStatsType).includes(updateType)) {
      // Save the updated device back to the database
      await DeviceRepo.update(device);
    }

    logger.info(`Successfully updated ${updateType} for device ${deviceUuid}`);
    logger.debug(JSON.stringify(data));
  } catch (err: any) {
    logger.error(err, `Failed to process job: ${err?.message}`);
    throw err; // Let Bull handle retries if the job fails
  }
});
