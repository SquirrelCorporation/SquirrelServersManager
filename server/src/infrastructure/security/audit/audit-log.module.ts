import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { AUDIT_LOG_SCHEMA, AuditLogService } from './audit-log.service';
import { AuditLogSchema } from './schemas/audit-log.schema';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([{ name: AUDIT_LOG_SCHEMA, schema: AuditLogSchema }]),
  ],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
