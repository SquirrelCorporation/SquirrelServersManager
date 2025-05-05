import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventEmitterService } from './event-emitter.service';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Global event emitter options
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class EventsModule {}
