import { Inject, Injectable } from '@nestjs/common';
import { StatsType } from 'ssm-shared-lib';
import { DEVICES_SERVICE, IDevice, IDevicesService } from '@modules/devices';
import { CONTAINER_SERVICE, IContainerService } from '@modules/containers';
import { TimeseriesDataPointDto } from '@modules/mcp/application/dto/timeseries-stats.response.dto';
import {
  IPrometheusService,
  PROMETHEUS_SERVICE,
} from '../../../../infrastructure/prometheus/prometheus.interface';
import {
  DevicesFilter,
  MetricsIdFilter,
} from '../../../../infrastructure/prometheus/types/filters.types';
import { TimeRange } from '../../../../infrastructure/prometheus/types/prometheus.types';
import PinoLogger from '../../../../logger';
import { IDeviceStatsService } from '../../domain/interfaces/device-stats-service.interface';

@Injectable()
export class DeviceStatsService implements IDeviceStatsService {
  private readonly logger = PinoLogger.child(
    { module: 'DeviceStatsService' },
    { msgPrefix: '[DEVICE_STATS] - ' },
  );

  constructor(
    @Inject(PROMETHEUS_SERVICE)
    private readonly prometheusService: IPrometheusService,
    @Inject(DEVICES_SERVICE) private readonly devicesService: IDevicesService,
    @Inject(CONTAINER_SERVICE) private readonly containerService: IContainerService,
  ) {}

  async getStatsByDeviceAndType(device: IDevice, from: Date, to: Date, type?: string) {
    if (!device?.uuid) {
      this.logger.error('Invalid device: missing UUID');
      throw new Error('Invalid device: missing UUID');
    }

    this.logger.info(`getStatsByDeviceAndType - DeviceUuid: ${device.uuid}, Type: ${type}`);

    try {
      if (!type) {
        return null;
      }

      const statsType = type as StatsType.DeviceStatsType;
      const range: TimeRange = { from, to };
      const filter: DevicesFilter = { type: 'devices', deviceIds: [device.uuid] };

      const result = await this.prometheusService.queryMetrics(statsType, filter, range);

      if (!result.success || !result.data) {
        return null;
      }

      return result.data.map((item) => ({
        date: item.date,
        value: item.value,
      }));
    } catch (error) {
      this.logger.error(error, `Error getting stats for device ${device.uuid}`);
      return null;
    }
  }

  async getStatsByDevicesAndType(devices: IDevice[], from: Date, to: Date, type?: string) {
    if (!devices?.length) {
      this.logger.error('Invalid devices: empty array');
      throw new Error('Invalid devices: empty array');
    }

    this.logger.info(`getStatsByDevicesAndType - DeviceCount: ${devices.length}, Type: ${type}`);

    try {
      if (!type) {
        return null;
      }

      const statsType = type as StatsType.DeviceStatsType;
      const range: TimeRange = { from, to };
      const deviceIds = devices.map((device) => device.uuid);
      const filter: DevicesFilter = { type: 'devices', deviceIds };

      const result = await this.prometheusService.queryMetrics(statsType, filter, range);

      if (!result.success || !result.data) {
        return null;
      }

      return result.data;
    } catch (error) {
      this.logger.error(error, 'Error getting stats for multiple devices');
      return null;
    }
  }

  async getSingleAveragedStatsByDevicesAndType(
    deviceIds: string[],
    from: Date,
    to: Date,
    type?: string,
  ) {
    if (!deviceIds?.length) {
      this.logger.error('Invalid device IDs: empty array');
      throw new Error('Invalid device IDs: empty array');
    }

    this.logger.info(
      `getSingleAveragedStatsByDevicesAndType - DeviceCount: ${deviceIds.length}, Type: ${type}`,
    );

    try {
      if (!type) {
        return null;
      }

      const devices = await this.devicesService.findByUuids(deviceIds);
      if (!devices || devices.length !== deviceIds.length) {
        throw new Error('Some devices were not found');
      }

      const statsType = type as StatsType.DeviceStatsType;
      const range: TimeRange = { from, to };
      const filter: DevicesFilter = { type: 'devices', deviceIds };

      const result = await this.prometheusService.queryAggregatedMetrics(statsType, filter, range);

      if (!result.success || !result.data) {
        return null;
      }

      return result.data;
    } catch (error) {
      this.logger.error(error, 'Error getting averaged stats for multiple devices');
      return null;
    }
  }

  async getStatByDeviceAndType(device: IDevice, type?: string) {
    if (!device?.uuid) {
      this.logger.error('Invalid device: missing UUID');
      throw new Error('Invalid device: missing UUID');
    }

    this.logger.info(`getStatByDeviceAndType - DeviceUuid: ${device.uuid}, Type: ${type}`);

    try {
      if (!type) {
        return null;
      }
      if (type === StatsType.DeviceStatsType.CONTAINERS) {
        return { value: await this.containerService.countByDeviceUuid(device.uuid) };
      }

      const statsType = type as StatsType.DeviceStatsType;
      const filter: MetricsIdFilter = { type: 'device', deviceId: device.uuid };

      const result = await this.prometheusService.queryLatestMetric(statsType, filter);

      if (!result.success || !result.data) {
        return null;
      }

      return { value: result.data.value, date: result.data.date };
    } catch (error) {
      this.logger.error(error, `Error getting latest stat for device ${device.uuid}`);
      return null;
    }
  }

  async getSingleAveragedStatByType(days: number, offset: number, type?: string) {
    this.logger.info(
      `getSingleAveragedStatByType - Days: ${days}, Offset: ${offset}, Type: ${type}`,
    );

    try {
      if (!type) {
        return null;
      }

      const statsType = type as StatsType.DeviceStatsType;
      const result = await this.prometheusService.queryAveragedStatByType(statsType, {
        days,
        offset,
      });

      if (!result.success || !result.data) {
        return null;
      }

      return [{ value: result.data.value }];
    } catch (error) {
      this.logger.error(error, 'Error getting averaged stat by type');
      return null;
    }
  }

  async getAveragedStatsByType(
    from: Date,
    to: Date,
    type?: string,
  ): Promise<TimeseriesDataPointDto[] | null> {
    this.logger.info(`Service: Getting averaged stats by type: ${type}`);

    try {
      if (!type) {
        return null;
      }

      const statsType = type as StatsType.DeviceStatsType;
      const range: TimeRange = { from, to };

      const result = await this.prometheusService.queryAveragedStatsByType(statsType, range);

      if (!result.success || !result.data) {
        this.logger.warn(`Service: No averaged data found for type ${type}`);
        return []; // Return empty array if no data
      }

      // Map the result data to TimeseriesDataPointDto
      const formattedData = result.data
        .map((point) => {
          let timestamp: string;
          try {
            // Assume point.date is either Date, string, or number (timestamp)
            timestamp = new Date(point.date).toISOString();
          } catch {
            this.logger.warn(`Invalid date format encountered for type ${type}: ${point.date}`);
            return null; // Skip point on date error
          }

          const value = typeof point.value === 'string' ? parseFloat(point.value) : point.value;

          if (isNaN(value)) {
            this.logger.warn(`Invalid numeric value encountered for type ${type}: ${point.value}`);
            return null; // Skip point on value error
          }

          return {
            timestamp: timestamp,
            value: value,
          };
        })
        .filter((point) => point !== null) as TimeseriesDataPointDto[]; // Filter out null points

      return formattedData;
    } catch (error) {
      this.logger.error(`Service: Error getting averaged stats by type ${type}: ${error}`);
      return null;
    }
  }
}
