import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerLogsService } from './application/services/server-logs.service';
import { ServerLog, ServerLogSchema } from './infrastructure/schemas/server-log.schema';
import { AnsibleLog, AnsibleLogSchema } from './infrastructure/schemas/ansible-log.schema';
import { ServerLogsRepository } from './infrastructure/repositories/server-logs.repository';
import { AnsibleLogsRepository } from './infrastructure/repositories/ansible-logs.repository';
import { LogsController } from './presentation/controllers/logs.controller';
import { ServerLogMapper } from './infrastructure/mappers/server-log.mapper';
import { AnsibleLogMapper } from './infrastructure/mappers/ansible-log.mapper';
import { ServerLogPresentationMapper } from './presentation/mappers/server-log.mapper';
import { SERVER_LOGS_SERVICE } from './application/interfaces/server-logs-service.interface';
import { SERVER_LOGS_REPOSITORY } from './domain/repositories/server-logs-repository.interface';
import { ANSIBLE_LOGS_REPOSITORY } from './domain/repositories/ansible-logs-repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServerLog.name, schema: ServerLogSchema },
      { name: AnsibleLog.name, schema: AnsibleLogSchema },
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
    {
      provide: SERVER_LOGS_REPOSITORY,
      useExisting: ServerLogsRepository,
    },
    {
      provide: ANSIBLE_LOGS_REPOSITORY,
      useExisting: AnsibleLogsRepository,
    },

    // Mappers
    ServerLogMapper,
    AnsibleLogMapper,
    ServerLogPresentationMapper,
  ],
  exports: [
    SERVER_LOGS_SERVICE,
    ServerLogsRepository,
    AnsibleLogsRepository,
    ANSIBLE_LOGS_REPOSITORY,
    SERVER_LOGS_REPOSITORY,
  ],
})
export class LogsModule {}
