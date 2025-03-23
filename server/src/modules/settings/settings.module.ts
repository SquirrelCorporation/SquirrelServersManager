import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsModule } from '../logs/logs.module';
import { PlaybooksModule } from '../playbooks/playbooks.module';
import { Playbook, PlaybookSchema } from '../playbooks/infrastructure/schemas/playbook.schema';
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
  ],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    AdvancedOperationsService,
    InformationService,
    SettingsMigrationService,
    {
      provide: SETTING_REPOSITORY,
      useClass: SettingRepository,
    },
    {
      provide: 'ISettingsService',
      useExisting: SettingsService,
    },
    {
      provide: 'SERVER_LOGS_REPOSITORY',
      useExisting: 'IServerLogsRepository',
    },
    {
      provide: 'ANSIBLE_LOGS_REPOSITORY',
      useExisting: 'IAnsibleLogsRepository',
    },
  ],
  exports: [SettingsService, 'ISettingsService', AdvancedOperationsService, InformationService],
})
export class SettingsModule {}
