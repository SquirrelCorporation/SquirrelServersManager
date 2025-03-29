import { Inject, Injectable } from '@nestjs/common';
import { SettingsKeys, StatsType } from 'ssm-shared-lib';
import { IDevice } from '@modules/devices';
import { ICacheService } from '../../../../infrastructure/cache';
import {
  IPrometheusService,
  PROMETHEUS_SERVICE,
} from '../../../../infrastructure/prometheus/prometheus.interface';
import PinoLogger from '../../../../logger';
import { DeviceDownTimeService } from './device-downtime.service';
import { DeviceStatsService } from './device-stats.service';

@Injectable()
export class DashboardService {
  private readonly logger = PinoLogger.child(
    { module: 'DashboardService' },
    { msgPrefix: '[DASHBOARD] - ' },
  );

  constructor(
    private readonly deviceStatsService: DeviceStatsService,
    private readonly deviceDownTimeService: DeviceDownTimeService,
    @Inject(PROMETHEUS_SERVICE)
    private readonly prometheusService: IPrometheusService,
    @Inject('ICacheService') private readonly cacheService: ICacheService,
  ) {}

  async getSystemPerformance() {
    this.logger.info('getSystemPerformance');

    const currentMemResult = await this.prometheusService.queryAveragedStatByType(
      StatsType.DeviceStatsType.MEM_FREE,
      {
        days: 7,
        offset: 0,
      },
    );
    const previousMemResult = await this.prometheusService.queryAveragedStatByType(
      StatsType.DeviceStatsType.MEM_FREE,
      {
        days: 14,
        offset: 7,
      },
    );
    const currentCpuResult = await this.prometheusService.queryAveragedStatByType(
      StatsType.DeviceStatsType.CPU,
      {
        days: 7,
        offset: 0,
      },
    );
    const previousCpuResult = await this.prometheusService.queryAveragedStatByType(
      StatsType.DeviceStatsType.CPU,
      {
        days: 14,
        offset: 7,
      },
    );

    const minMem = (await this.cacheService.get(
      SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
    )) as string;
    const maxCpu = (await this.cacheService.get(
      SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
    )) as string;

    const values = {
      currentMem:
        currentMemResult.success && currentMemResult.data ? currentMemResult.data.value : NaN,
      previousMem:
        previousMemResult.success && previousMemResult.data ? previousMemResult.data.value : NaN,
      currentCpu:
        currentCpuResult.success && currentCpuResult.data ? currentCpuResult.data.value : NaN,
      previousCpu:
        previousCpuResult.success && previousCpuResult.data ? previousCpuResult.data.value : NaN,
    };

    const status = {
      message:
        values.currentMem > parseInt(minMem) && values.currentCpu < parseInt(maxCpu)
          ? 'HEALTHY'
          : 'POOR',
      danger: !(values.currentMem > parseInt(minMem) && values.currentCpu < parseInt(maxCpu)),
    };

    return { ...values, ...status };
  }

  async getDevicesAvailability() {
    const result =
      await this.deviceDownTimeService.getDevicesAvailabilitySumUpCurrentMonthLastMonth();
    return result;
  }

  async getSingleAveragedStatsByDevicesAndType(
    devices: string[],
    from: Date,
    to: Date,
    type: string,
  ) {
    const stats = await this.deviceStatsService.getSingleAveragedStatsByDevicesAndType(
      devices,
      from,
      to,
      type,
    );
    return stats?.sort((a, b) => b.value - a.value);
  }

  async getAveragedStatsByType(from: Date, to: Date, type: string) {
    const stats = await this.deviceStatsService.getAveragedStatsByType(from, to, type);
    return stats;
  }

  async getStatsByDevicesAndType(devices: IDevice[], from: Date, to: Date, type: string) {
    const stats = await this.deviceStatsService.getStatsByDevicesAndType(devices, from, to, type);
    return stats;
  }
}
