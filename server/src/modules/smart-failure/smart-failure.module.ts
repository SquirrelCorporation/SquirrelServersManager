import { Module } from '@nestjs/common';
import { SmartFailureController } from './controllers/smart-failure.controller';
import { SmartFailureService } from './services/smart-failure.service';

/**
 * Module for smart failure analysis of Ansible logs
 */
@Module({
  controllers: [SmartFailureController],
  providers: [SmartFailureService],
  exports: [SmartFailureService],
})
export class SmartFailureModule {}
