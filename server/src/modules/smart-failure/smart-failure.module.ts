import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { SmartFailureService } from './application/services/smart-failure.service';
import { AnsibleLogsRepository } from './infrastructure/repositories/ansible-logs.repository';
import { SmartFailureController } from './presentation/controllers/smart-failure.controller';

/**
 * Module for smart failure analysis of Ansible logs
 */
@Module({
  imports: [LogsModule],
  controllers: [SmartFailureController],
  providers: [
    {
      provide: 'ISmartFailureService',
      useClass: SmartFailureService,
    },
    {
      provide: 'IAnsibleLogsRepository',
      useClass: AnsibleLogsRepository,
    },
  ],
  exports: ['ISmartFailureService'],
})
export class SmartFailureModule {}
