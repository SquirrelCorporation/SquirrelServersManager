import { BullModule } from '@nestjs/bull';
import { Module, forwardRef } from '@nestjs/common';
import { AnsibleVaultsModule } from '../ansible-vaults/ansible-vaults.module';
import { DevicesModule } from '../devices/devices.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { WsAuthModule } from '../../infrastructure/websocket-auth/ws-auth.module';
import { RemoteSystemInformationEngineService } from './application/services/engine/remote-system-information-engine.service';
import { RemoteSystemInformationService } from './application/services/remote-system-information.service';
import { REMOTE_SYSTEM_INFORMATION_SERVICE } from './domain/interfaces/remote-system-information-service.interface';
import { JOB_CONCURRENCY, REMOTE_SYSTEM_INFO_QUEUE } from './infrastructure/queue/constants';
import { RemoteSystemInformationProcessor } from './infrastructure/queue/remote-system-information.processor';
import { RemoteSystemInformationDebugGateway } from './infrastructure/websockets/remote-system-information-debug.gateway';
import { RemoteSystemInformationDiagnosticController } from './presentation/controllers/diagnostic';

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
    // Import WsAuth module for WebSocket authentication
    WsAuthModule,
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
  controllers: [RemoteSystemInformationDiagnosticController],
  providers: [
    // Register queue processor
    RemoteSystemInformationProcessor,
    // Register services
    RemoteSystemInformationEngineService,
    RemoteSystemInformationService,
    // Register WebSocket gateway
    RemoteSystemInformationDebugGateway,
    // Add provider for IRemoteSystemInformationService
    {
      provide: REMOTE_SYSTEM_INFORMATION_SERVICE,
      useClass: RemoteSystemInformationService,
    },
  ],
  exports: [
    // Export services
    RemoteSystemInformationService,
  ],
})
export class RemoteSystemInformationModule {}
