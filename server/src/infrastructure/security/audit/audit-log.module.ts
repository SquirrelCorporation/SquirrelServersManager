import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Empty placeholder module until we properly set up schemas and services
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [],
  exports: [],
})
export class AuditLogModule {}
