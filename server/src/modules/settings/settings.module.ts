import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { LogsModule } from '../logs/logs.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';
import { Playbook, PlaybookSchema } from '../playbooks/infrastructure/schemas/playbook.schema';
import { PrometheusProvider } from '../../infrastructure/prometheus/prometheus.provider';
import { SettingsService } from './application/services/settings.service';
import { AdvancedOperationsService } from './application/services/advanced-operations.service';
import { InformationService } from './application/services/information.service';
import { SettingsController } from './presentation/controllers/settings.controller';
import { SETTING_REPOSITORY } from './domain/repositories/setting-repository.interface';
import { SettingRepository } from './infrastructure/repositories/setting.repository';
import { SettingsMigrationService } from './infrastructure/migration/settings-migration.service';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([{ name: Playbook.name, schema: PlaybookSchema }]),
    LogsModule,
    PlaybooksModule,
    HttpModule,
  ],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    AdvancedOperationsService,
    InformationService,
    SettingsMigrationService,
    PrometheusProvider,
    {
      provide: SETTING_REPOSITORY,
      useClass: SettingRepository,
    },
    {
      provide: 'ISettingsService',
      useExisting: SettingsService,
    },
  ],
  exports: [SettingsService, 'ISettingsService', AdvancedOperationsService, InformationService],
})
export class SettingsModule {}
