import { SETTINGS_SERVICE } from '@modules/settings/domain/interfaces/settings-service.interface';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { PrometheusProvider } from '../../infrastructure/prometheus/prometheus.provider';
import { LogsModule } from '../logs/logs.module';
import { Playbook, PlaybookSchema } from '../playbooks/infrastructure/schemas/playbook.schema';
import { PlaybooksModule } from '../playbooks/playbooks.module';
import { AdvancedOperationsService } from './application/services/advanced-operations.service';
import { InformationService } from './application/services/information.service';
import { SettingsService } from './application/services/settings.service';
import { SETTING_REPOSITORY } from './domain/repositories/setting-repository.interface';
import { SettingsMigrationService } from './infrastructure/migration/settings-migration.service';
import { SettingRepository } from './infrastructure/repositories/setting.repository';
import { SettingsController } from './presentation/controllers/settings.controller';

@Module({
  imports: [
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
      provide: SETTINGS_SERVICE,
      useExisting: SettingsService,
    },
  ],
  exports: [SettingsService, SETTINGS_SERVICE, AdvancedOperationsService, InformationService],
})
export class SettingsModule {}
