import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitterService } from '../../core/events/event-emitter.service';
import { DevicesModule } from '../devices';
import { DiagnosticService } from './application/services/diagnostic.service';
import { DiagnosticRepository } from './infrastructure/repositories/diagnostic.repository';
import { DiagnosticController } from './presentation/controllers/diagnostic.controller';
import { DiagnosticMapper } from './presentation/mappers/diagnostic.mapper';

@Module({
  imports: [
    DevicesModule,
    EventEmitterModule.forRoot({
      // Global configuration for EventEmitter
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  controllers: [DiagnosticController],
  providers: [
    DiagnosticService,
    EventEmitterService,
    DiagnosticMapper,
    {
      provide: 'IDiagnosticRepository',
      useClass: DiagnosticRepository,
    },
    {
      provide: 'IDeviceRepository',
      useExisting: 'DeviceRepository',
    },
    {
      provide: 'IDeviceAuthRepository',
      useExisting: 'DeviceAuthRepository',
    },
  ],
  exports: [DiagnosticService],
})
export class DiagnosticModule {}
