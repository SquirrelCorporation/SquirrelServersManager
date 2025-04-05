import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ContainersModule } from '@modules/containers';
import { PrometheusProvider } from '../../infrastructure/prometheus/prometheus.provider';
import { DevicesModule } from '../devices/devices.module';
import { DashboardController } from './presentation/controllers/dashboard.controller';
import { DeviceStatsController } from './presentation/controllers/device-stats.controller';
import { DashboardService } from './application/services/dashboard.service';
import { DeviceDownTimeService } from './application/services/device-downtime.service';
import { MetricsService } from './application/services/metrics.service';
import { DeviceStatsService } from './application/services/device-stats.service';
import {
  DEVICE_DOWNTIME_EVENT,
  DeviceDownTimeEventSchema,
} from './infrastructure/schemas/device-downtime-event.schema';
import { DeviceDownTimeEventRepositoryMapper } from './infrastructure/mappers/device-downtime-event-repository.mapper';
import { DeviceDownTimeEventRepository } from './infrastructure/repositories/device-downtime-event.repository';
import { DEVICE_DOWNTIME_EVENT_REPOSITORY } from './domain/repositories/device-downtime-event-repository.interface';
import { MetricsController } from './presentation/controllers/metrics.controller';
import { METRICS_SERVICE } from './doma../../domain/interfaces/metrics-service.interface';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: DEVICE_DOWNTIME_EVENT, schema: DeviceDownTimeEventSchema }]),
    DevicesModule,
    forwardRef(() => ContainersModule),
  ],
  controllers: [DashboardController, DeviceStatsController, MetricsController],
  providers: [
    PrometheusProvider,
    DashboardService,
    DeviceStatsService,
    DeviceDownTimeService,
    {
      provide: METRICS_SERVICE,
      useClass: MetricsService,
    },
    DeviceDownTimeEventRepositoryMapper,
    {
      provide: DEVICE_DOWNTIME_EVENT_REPOSITORY,
      useClass: DeviceDownTimeEventRepository,
    },
  ],
  exports: [
    DashboardService,
    DeviceStatsService,
    DeviceDownTimeService,
    {
      provide: METRICS_SERVICE,
      useClass: MetricsService,
    },
    PrometheusProvider,
  ],
})
export class StatisticsModule {}
