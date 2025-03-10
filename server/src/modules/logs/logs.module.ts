import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerLogsService } from './application/services/server-logs.service';
import { ServerLog, ServerLogSchema } from './infrastructure/schemas/server-log.schema';
import { AnsibleLog, AnsibleLogSchema } from './infrastructure/schemas/ansible-log.schema';
import { AnsibleTask, AnsibleTaskSchema } from './infrastructure/schemas/ansible-task.schema';
import { ServerLogsRepository } from './infrastructure/repositories/server-logs.repository';
import { AnsibleLogsRepository } from './infrastructure/repositories/ansible-logs.repository';
import { AnsibleTaskRepository } from './infrastructure/repositories/ansible-task.repository';
import { LogsController } from './presentation/controllers/logs.controller';
import { ServerLogMapper } from './infrastructure/mappers/server-log.mapper';
import { AnsibleLogMapper } from './infrastructure/mappers/ansible-log.mapper';
import { AnsibleTaskMapper } from './infrastructure/mappers/ansible-task.mapper';
import { ServerLogPresentationMapper } from './presentation/mappers/server-log.mapper';
import { SERVER_LOGS_SERVICE } from './application/interfaces/server-logs-service.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServerLog.name, schema: ServerLogSchema },
      { name: AnsibleLog.name, schema: AnsibleLogSchema },
      { name: AnsibleTask.name, schema: AnsibleTaskSchema },
    ]),
  ],
  controllers: [LogsController],
  providers: [
    // Services
    {
      provide: SERVER_LOGS_SERVICE,
      useClass: ServerLogsService,
    },

    // Repositories
    ServerLogsRepository,
    AnsibleLogsRepository,
    AnsibleTaskRepository,
    {
      provide: 'IAnsibleLogsRepository',
      useExisting: AnsibleLogsRepository,
    },
    {
      provide: 'IServerLogsRepository',
      useExisting: ServerLogsRepository,
    },

    // Mappers
    ServerLogMapper,
    AnsibleLogMapper,
    AnsibleTaskMapper,
    ServerLogPresentationMapper,
  ],
  exports: [
    SERVER_LOGS_SERVICE,
    ServerLogsRepository,
    AnsibleLogsRepository,
    AnsibleTaskRepository,
    'IAnsibleLogsRepository',
    'IServerLogsRepository',
  ],
})
export class LogsModule {}
