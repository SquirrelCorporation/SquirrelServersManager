import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitterService } from '../../core/events/event-emitter.service';
import { DiagnosticController } from './controllers/diagnostic.controller';
import { DiagnosticService } from './services/diagnostic.service';

@Module({
  imports: [
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
  providers: [DiagnosticService, EventEmitterService],
  exports: [DiagnosticService],
})
export class DiagnosticModule {}
