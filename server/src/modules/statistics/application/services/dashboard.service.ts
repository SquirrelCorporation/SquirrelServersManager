import { Inject, Injectable } from '@nestjs/common';
import { SettingsKeys, StatsType } from 'ssm-shared-lib';
import { getConfFromCache } from '../../../../data/cache';
import { PROMETHEUS_SERVICE } from '../../../../infrastructure/prometheus/prometheus.provider';
import { PrometheusService } from '../../../../infrastructure/prometheus/prometheus.service';
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
    private readonly prometheusService: PrometheusService,
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

    const minMem = await getConfFromCache(
      SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
    );
    const maxCpu = await getConfFromCache(
      SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
    );

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

  async getAveragedStatsByDevices(devices: string[], from: Date, to: Date, type: string) {
    const stats = await this.deviceStatsService.getSingleAveragedStatsByDevicesAndType(
      devices,
      from,
      to,
      type,
    );
    return stats;
  }

  async getDashboardStat(from: Date, to: Date, type: string) {
    const stats = await this.deviceStatsService.getAveragedStatsByType(from, to, type);
    return stats;
  }
}
