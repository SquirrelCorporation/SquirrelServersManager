import { Module } from '@nestjs/common';
import { PrometheusProvider } from '../../infrastructure/prometheus/prometheus.provider';
import { DashboardController } from './controllers/dashboard.controller';
import { DeviceStatsController } from './controllers/device-stats.controller';
import { DashboardService } from './services/dashboard.service';
import { DeviceDownTimeService } from './services/device-downtime.service';
import { DeviceStatsService } from './services/device-stats.service';

@Module({
  controllers: [DashboardController, DeviceStatsController],
  providers: [PrometheusProvider, DashboardService, DeviceStatsService, DeviceDownTimeService],
  exports: [DashboardService, DeviceStatsService, DeviceDownTimeService],
})
export class StatisticsModule {}
