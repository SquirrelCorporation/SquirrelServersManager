import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { redisConf } from 'src/config';
import { DevicesModule } from '../devices/devices.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { AnsibleVaultsModule } from '../ansible-vaults/ansible-vaults.module';
import { JOB_CONCURRENCY, REMOTE_SYSTEM_INFO_QUEUE } from './infrastructure/queue/constants';
import { RemoteSystemInformationProcessor } from './infrastructure/queue/remote-system-information.processor';
import { RemoteSystemInformationService } from './application/services/remote-system-information.service';
import { RemoteSystemInformationEngineService } from './application/services/engine/remote-system-information-engine.service';

/**
 * Module for remote system information collection and management
 */
@Module({
  imports: [
    // Import devices module to access device repository
    forwardRef(() => DevicesModule),
    // Import statistics module to access metrics service
    StatisticsModule,
    // Import AnsibleVaults module for vault decryption
    AnsibleVaultsModule,
    // Register Bull queue for processing system information updates
    BullModule.registerQueue({
      name: REMOTE_SYSTEM_INFO_QUEUE,
      limiter: {
        max: JOB_CONCURRENCY, // Max number of jobs processed concurrently
        duration: 1000, // Per second
      },
      defaultJobOptions: {
        attempts: 3, // Retry failed jobs up to 3 times
        backoff: {
          type: 'exponential',
          delay: 1000, // Initial delay of 1 second
        },
        removeOnComplete: true, // Remove jobs from the queue when completed
        removeOnFail: 100, // Keep last 100 failed jobs for inspection
      },
    }),
  ],
  providers: [
    // Register queue processor
    RemoteSystemInformationProcessor,
    // Register services
    RemoteSystemInformationEngineService,
    RemoteSystemInformationService,
  ],
  exports: [
    // Export services
    RemoteSystemInformationService,
  ],
})
export class RemoteSystemInformationModule {}
