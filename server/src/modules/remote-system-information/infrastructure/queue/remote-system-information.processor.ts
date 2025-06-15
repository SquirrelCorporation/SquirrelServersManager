import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import { Process, Processor } from '@nestjs/bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Systeminformation } from 'ssm-shared-lib';
import { MetricsService } from '../../../statistics/application/services/metrics.service';
import {
  METRICS_SERVICE,
  MetricType,
} from '../../../statistics/doma../../domain/interfaces/metrics-service.interface';
import { QueueJobData, UpdateStatsType, UpdateType } from '../../domain/types/update.types';
import { REMOTE_SYSTEM_INFO_QUEUE } from './constants';

/**
 * Processor for remote system information queue jobs
 */
@Injectable()
@Processor(REMOTE_SYSTEM_INFO_QUEUE)
export class RemoteSystemInformationProcessor {
  private readonly logger = new Logger(RemoteSystemInformationProcessor.name);

  constructor(
    @Inject(DEVICES_SERVICE)
    private readonly devicesService: IDevicesService,
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
      const device = await this.devicesService.findOneByUuid(deviceUuid);
      if (!device) {
        throw new Error(`Device not found (${deviceUuid})`);
      }

      if (!device.systemInformation) {
        device.systemInformation = {};
      }

      // Handle different update types
      switch (updateType) {
        case UpdateType.CPU:
          device.systemInformation.cpu = data as Systeminformation.CpuData;
          if (device.systemInformation.cpu) {
            device.systemInformation.cpu.lastUpdatedAt = new Date().toISOString();
          }
          break;
        case UpdateType.Memory:
          device.systemInformation.mem = data as Systeminformation.MemData;
          if (device.systemInformation.mem) {
            (device.systemInformation.mem as any).lastUpdatedAt = new Date().toISOString();
          }
          break;
        case UpdateType.FileSystems:
          device.systemInformation.fileSystems = data as Systeminformation.DiskLayoutData[];
          if (Array.isArray(device.systemInformation.fileSystems)) {
            device.systemInformation.fileSystems.forEach((fs) => {
              fs.lastUpdatedAt = new Date().toISOString();
            });
          }
          break;
        case UpdateType.Network:
          device.systemInformation.networkInterfaces =
            data as Systeminformation.NetworkInterfacesData[];
          if (Array.isArray(device.systemInformation.networkInterfaces)) {
            device.systemInformation.networkInterfaces.forEach((ni) => {
              ni.lastUpdatedAt = new Date().toISOString();
            });
          }
          break;
        case UpdateType.Graphics:
          device.systemInformation.graphics = data as Systeminformation.GraphicsData;
          if (device.systemInformation.graphics) {
            device.systemInformation.graphics.lastUpdatedAt = new Date().toISOString();
          }
          break;
        case UpdateType.WiFi:
          device.systemInformation.wifi = data as Systeminformation.WifiInterfaceData[];
          if (Array.isArray(device.systemInformation.wifi)) {
            device.systemInformation.wifi.forEach((w) => {
              w.lastUpdatedAt = new Date().toISOString();
            });
          }
          break;
        case UpdateType.USB:
          device.systemInformation.usb = data as Systeminformation.UsbData[];
          if (Array.isArray(device.systemInformation.usb)) {
            device.systemInformation.usb.forEach((u) => {
              u.lastUpdatedAt = new Date().toISOString();
            });
          }
          break;
        case UpdateType.OS:
          device.systemInformation.os = data as Systeminformation.OsData;
          if (device.systemInformation.os) {
            device.systemInformation.os.lastUpdatedAt = new Date().toISOString();
          }
          device.fqdn = (data as Systeminformation.OsData)?.fqdn;
          device.hostname = (data as Systeminformation.OsData)?.hostname;
          break;
        case UpdateType.System:
          device.systemInformation.system = data as Systeminformation.SystemData;
          if (device.systemInformation.system) {
            device.systemInformation.system.lastUpdatedAt = new Date().toISOString();
          }
          break;
        case UpdateType.Versions:
          device.systemInformation.versions = data as Systeminformation.VersionData;
          if (device.systemInformation.versions) {
            device.systemInformation.versions.lastUpdatedAt = new Date().toISOString();
          }
          break;
        case UpdateType.MemoryLayout:
          device.systemInformation.memLayout = data as Systeminformation.MemLayoutData[];
          if (Array.isArray(device.systemInformation.memLayout)) {
            device.systemInformation.memLayout.forEach((m) => {
              m.lastUpdatedAt = new Date().toISOString();
            });
          }
          break;
        case UpdateType.Bluetooth:
          device.systemInformation.bluetooth = data as Systeminformation.BluetoothDeviceData[];
          if (Array.isArray(device.systemInformation.bluetooth)) {
            device.systemInformation.bluetooth.forEach((b) => {
              b.lastUpdatedAt = new Date().toISOString();
            });
          }
          break;
        case UpdateStatsType.CPU_STATS:
          await this.processCpuStatistics(data, deviceUuid);
          if (!device.systemInformation.cpuStats) {
            device.systemInformation.cpuStats = {
              lastUpdatedAt: new Date().toISOString(),
            };
          }
          break;
        case UpdateStatsType.MEM_STATS:
          await this.processMemoryStatistics(data, deviceUuid);
          if (!device.systemInformation.memStats) {
            device.systemInformation.memStats = {
              lastUpdatedAt: new Date().toISOString(),
            };
          }
          break;
        case UpdateStatsType.FILE_SYSTEM_STATS:
          await this.processFileStorageStatistics(data as any[], deviceUuid);
          if (!device.systemInformation.fileSystemsStats) {
            device.systemInformation.fileSystemsStats = {
              lastUpdatedAt: new Date().toISOString(),
            };
          }
          break;
        default:
          throw new Error(`Unknown update type: ${updateType}`);
      }

      if (!Object.values(UpdateStatsType).includes(updateType as UpdateStatsType)) {
        // Save the updated device back to the database for non-stats updates
        await this.devicesService.update(device);
      }

      this.logger.log(`Successfully updated ${updateType} for device ${deviceUuid} (${device.ip})`);
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
