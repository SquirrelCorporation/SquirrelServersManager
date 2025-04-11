import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { OnEvent } from '@nestjs/event-emitter';
import { DEVICES_SERVICE, IDevicesService } from '@modules/devices';
import { IDeviceDowntimeService } from '@modules/statistics/doma../../domain/interfaces/device-downtime-service.interface';
import PinoLogger from '../../../../logger';
import {
  DEVICE_DOWNTIME_EVENT_REPOSITORY,
  IDeviceDownTimeEventRepository,
} from '../../domain/repositories/device-downtime-event-repository.interface';

@Injectable()
export class DeviceDownTimeService implements IDeviceDowntimeService {
  private readonly logger = PinoLogger.child(
    { module: 'DeviceDownTimeService' },
    { msgPrefix: '[DEVICE_DOWNTIME] - ' },
  );

  constructor(
    @Inject(DEVICE_DOWNTIME_EVENT_REPOSITORY)
    private readonly downtimeRepository: IDeviceDownTimeEventRepository,
    @Inject(DEVICES_SERVICE)
    private readonly devicesService: IDevicesService,
  ) {}

  @OnEvent('device.went.offline')
  async handleDeviceWentOffline(deviceId: string) {
    this.logger.info(`Received device.went.offline event for device: ${deviceId}`);
    await this.createDowntimeEvent(deviceId);
  }

  @OnEvent('device.came.online')
  async handleDeviceCameOnline(deviceId: string) {
    this.logger.info(`Received device.came.online event for device: ${deviceId}`);
    await this.closeDowntimeEvent(deviceId);
  }

  private async createDowntimeEvent(deviceId: string): Promise<void> {
    this.logger.info(`Creating downtime event for device: ${deviceId}`);
    await this.downtimeRepository.create(deviceId);
  }

  private async closeDowntimeEvent(deviceId: string): Promise<void> {
    this.logger.info(`Closing downtime event for device: ${deviceId}`);
    await this.downtimeRepository.closeDownTimeEvent(deviceId);
  }

  private async getDevicesAvailability(from: Date, to: Date) {
    this.logger.info(`Getting devices availability from ${from} to ${to}`);

    const devices = await this.devicesService.findAll();
    if (!devices) {
      return [];
    }

    const devicesDownTimeDuration = await this.downtimeRepository.sumTotalDownTimePerDeviceOnPeriod(
      from,
      to,
    );
    const period = to.getTime() - from.getTime();

    return devices.map((device) => {
      const deviceEntry = devicesDownTimeDuration.find(
        (downTime) => downTime.deviceId === device.uuid,
      );

      const downtime = deviceEntry ? deviceEntry.duration : 0;
      const uptime = period - downtime;

      this.logger.debug(
        `Device ${device.uuid}: Period: ${period}ms, Uptime: ${uptime}ms, Downtime: ${downtime}ms`,
      );

      return {
        uuid: device.uuid,
        uptime: uptime < 0 ? 0 : uptime,
        downtime: downtime > period ? period : downtime,
        availability: (uptime / (uptime + downtime) || 0).toFixed(6),
      };
    });
  }

  async getDevicesAvailabilitySumUpCurrentMonthLastMonth() {
    try {
      this.logger.info('Getting devices availability for current and last month');

      const now = new Date();
      const currentMonthStart = DateTime.now().startOf('month').toJSDate();
      const availabilities = await this.getDevicesAvailability(currentMonthStart, now);

      const totalUptime = availabilities.reduce((acc, curr) => acc + curr.uptime, 0);
      const totalDowntime = availabilities.reduce((acc, curr) => acc + curr.downtime, 0);

      const lastMonthStart = DateTime.now().minus({ month: 1 }).startOf('month').toJSDate();
      const lastMonthEnd = DateTime.now().minus({ month: 1 }).endOf('month').toJSDate();
      const lastMonthAvailabilities = await this.getDevicesAvailability(
        lastMonthStart,
        lastMonthEnd,
      );

      const lastMonthTotalUptime = lastMonthAvailabilities.reduce(
        (acc, curr) => acc + curr.uptime,
        0,
      );
      const lastMonthTotalDowntime = lastMonthAvailabilities.reduce(
        (acc, curr) => acc + curr.downtime,
        0,
      );

      return {
        availability: totalUptime / (totalUptime + totalDowntime) || 0,
        lastMonth: lastMonthTotalUptime / (lastMonthTotalUptime + lastMonthTotalDowntime) || 0,
        byDevice: availabilities,
      };
    } catch (error) {
      this.logger.error('Error calculating device availability:', error);
      return {
        availability: 0,
        lastMonth: 0,
        byDevice: [],
      };
    }
  }
}
