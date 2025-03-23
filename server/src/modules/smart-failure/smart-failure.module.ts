import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { SmartFailureService } from './application/services/smart-failure.service';
import { SmartFailureRepository } from './infrastructure/repositories/smart-failure.repository';
import { SmartFailureController } from './presentation/controllers/smart-failure.controller';
import { SMART_FAILURE_REPOSITORY } from './domain/repositories/smart-failure.repository.interface';
import { SMART_FAILURE_SERVICE } from './application/interfaces/smart-failure.service.interface';

/**
 * Module for smart failure analysis of Ansible logs
 */
@Module({
  imports: [LogsModule],
  controllers: [SmartFailureController],
  providers: [
    {
      provide: SMART_FAILURE_SERVICE,
      useClass: SmartFailureService,
    },
    {
      provide: SMART_FAILURE_REPOSITORY,
      useClass: SmartFailureRepository,
    },
  ],
  exports: [SMART_FAILURE_SERVICE],
})
export class SmartFailureModule {}
