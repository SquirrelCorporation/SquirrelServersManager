import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsController } from './controllers/logs.controller';
import { ServerLogsRepository } from './repositories/server-logs.repository';
import { ServerLog, ServerLogSchema } from './schemas/server-log.schema';
import { ServerLogsService } from './services/server-logs.service';
import { AnsibleLogsRepository } from './repositories/ansible-logs.repository';
import { AnsibleLog, AnsibleLogSchema } from './schemas/ansible-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServerLog.name, schema: ServerLogSchema },
      { name: AnsibleLog.name, schema: AnsibleLogSchema },
    ]),
  ],
  controllers: [LogsController],
  providers: [
    ServerLogsService,
    ServerLogsRepository,
    AnsibleLogsRepository,
  ],
  exports: [
    ServerLogsService,
    ServerLogsRepository,
    AnsibleLogsRepository,
  ],
})
export class LogsModule {}
