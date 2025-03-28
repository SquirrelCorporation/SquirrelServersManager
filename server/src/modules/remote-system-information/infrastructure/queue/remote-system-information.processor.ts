import { Inject, Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Systeminformation } from 'ssm-shared-lib';
import { DeviceRepository } from '../../../devices/infrastructure/repositories/device.repository';
import { QueueJobData, UpdateStatsType, UpdateType } from '../../domain/types/update.types';
import { MetricsService } from '../../../statistics/application/services/metrics.service';
import { DEVICE_REPOSITORY } from '../../../devices/domain/repositories/device-repository.interface';
import {
  METRICS_SERVICE,
  MetricType,
} from '../../../statistics/application/interfaces/metrics-service.interface';
import { REMOTE_SYSTEM_INFO_QUEUE } from './constants';

/**
 * Processor for remote system information queue jobs
 */
@Injectable()
@Processor(REMOTE_SYSTEM_INFO_QUEUE)
export class RemoteSystemInformationProcessor {
  private readonly logger = new Logger(RemoteSystemInformationProcessor.name);

  constructor(
    @Inject(DEVICE_REPOSITORY)
    private readonly deviceRepository: DeviceRepository,
    @Inject(METRICS_SERVICE)
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Process update jobs
   * @param job The Bull job to process
   */
  @Process()
  async processUpdateJob(job: Job<QueueJobData>): Promise<void> {
    const { deviceUuid, updateType, data } = job.data;
    this.logger.log(`Processing ${updateType} update for device ${deviceUuid}`);

    try {
      const device = await this.deviceRepository.findOneByUuid(deviceUuid);
      if (!device) {
        throw new Error('Device not found');
      }

      if (!device.systemInformation) {
        device.systemInformation = {};
      }

      // Handle different update types
      switch (updateType) {
        case UpdateType.CPU:
          device.systemInformation.cpu = data as Systeminformation.CpuData;
          break;
        case UpdateType.Memory:
          device.systemInformation.mem = data as Systeminformation.MemData;
          break;
        case UpdateType.FileSystems:
          device.systemInformation.fileSystems = data as Systeminformation.DiskLayoutData[];
          break;
        case UpdateType.Network:
          device.systemInformation.networkInterfaces =
            data as Systeminformation.NetworkInterfacesData[];
          break;
        case UpdateType.Graphics:
          device.systemInformation.graphics = data as Systeminformation.GraphicsData;
          break;
        case UpdateType.WiFi:
          device.systemInformation.wifi = data as Systeminformation.WifiInterfaceData[];
          break;
        case UpdateType.USB:
          device.systemInformation.usb = data as Systeminformation.UsbData;
          break;
        case UpdateType.OS:
          device.systemInformation.os = data as Systeminformation.OsData;
          device.fqdn = (data as Systeminformation.OsData)?.fqdn;
          device.hostname = (data as Systeminformation.OsData)?.hostname;
          break;
        case UpdateType.System:
          device.systemInformation.system = data as Systeminformation.SystemData;
          break;
        case UpdateType.Versions:
          device.systemInformation.versions = data as Systeminformation.VersionData;
          break;
        case UpdateType.MemoryLayout:
          device.systemInformation.memLayout = data as Systeminformation.MemLayoutData[];
          break;
        case UpdateType.Bluetooth:
          device.systemInformation.bluetooth = data as Systeminformation.BluetoothDeviceData[];
          break;
        case UpdateStatsType.CPU_STATS:
          await this.processCpuStatistics(data, deviceUuid);
          break;
        case UpdateStatsType.MEM_STATS:
          await this.processMemoryStatistics(data, deviceUuid);
          break;
        case UpdateStatsType.FILE_SYSTEM_STATS:
          await this.processFileStorageStatistics(data as any[], deviceUuid);
          break;
        default:
          throw new Error(`Unknown update type: ${updateType}`);
      }

      if (!Object.values(UpdateStatsType).includes(updateType as UpdateStatsType)) {
        // Save the updated device back to the database for non-stats updates
        await this.deviceRepository.update(device);
      }

      this.logger.debug(`Successfully updated ${updateType} for device ${deviceUuid}`);
    } catch (error: any) {
      this.logger.error(
        error.stack,
        `Failed to process ${updateType} update for device ${deviceUuid}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Process CPU statistics
   * @param cpuUsage CPU usage data
   * @param deviceUuid Device UUID
   */
  private async processCpuStatistics(cpuUsage: any, deviceUuid: string): Promise<void> {
    if (cpuUsage.currentLoad === undefined) {
      return;
    }
    this.logger.debug(`CPU usage: ${cpuUsage.currentLoad}`);

    // Store CPU usage metric
    await this.metricsService.setMetric(MetricType.CPU_USAGE, cpuUsage.currentLoad, deviceUuid);
  }

  /**
   * Process memory statistics
   * @param memoryUsage Memory usage data
   * @param deviceUuid Device UUID
   */
  private async processMemoryStatistics(memoryUsage: any, deviceUuid: string): Promise<void> {
    if (memoryUsage.used === undefined || memoryUsage.total === undefined) {
      return;
    }

    this.logger.debug(`Memory usage: ${memoryUsage.available} - total: ${memoryUsage.total}`);

    if (memoryUsage.used !== 0) {
      // Calculate memory usage as percentage
      const usagePercent = (1 - memoryUsage.available / memoryUsage.total) * 100;
      const freePercent = (memoryUsage.free / memoryUsage.total) * 100;

      // Store memory metrics
      await this.metricsService.setMetric(MetricType.MEMORY_USAGE, usagePercent, deviceUuid);
      await this.metricsService.setMetric(MetricType.MEMORY_FREE, freePercent, deviceUuid);
    } else {
      await this.metricsService.setMetric(MetricType.MEMORY_USAGE, 0, deviceUuid);
      await this.metricsService.setMetric(MetricType.MEMORY_FREE, 100, deviceUuid);
    }
  }

  /**
   * Process file storage statistics
   * @param fileStorageUsage File storage usage data
   * @param deviceUuid Device UUID
   */
  private async processFileStorageStatistics(
    fileStorageUsage: any[],
    deviceUuid: string,
  ): Promise<void> {
    if (!fileStorageUsage || fileStorageUsage.length === 0) {
      return;
    }

    const totalUsed = fileStorageUsage.reduce((acc, cur) => acc + cur.used, 0);
    const totalSize = fileStorageUsage.reduce((acc, cur) => acc + cur.size, 0);

    this.logger.debug(`File storage usage: ${totalUsed} used on ${totalSize} total`);

    if (totalUsed !== 0) {
      // Calculate storage usage as percentage
      const usagePercent = (totalUsed / totalSize) * 100;
      const freePercent = (1 - totalUsed / totalSize) * 100;

      // Store storage metrics
      await this.metricsService.setMetric(MetricType.STORAGE_USAGE, usagePercent, deviceUuid);
      await this.metricsService.setMetric(MetricType.STORAGE_FREE, freePercent, deviceUuid);
    } else {
      await this.metricsService.setMetric(MetricType.STORAGE_USAGE, 0, deviceUuid);
      await this.metricsService.setMetric(MetricType.STORAGE_FREE, 100, deviceUuid);
    }
  }
}
