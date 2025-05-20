import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnsibleLogsService } from './application/services/ansible-logs.service';
import { ServerLogsService } from './application/services/server-logs.service';
import { ANSIBLE_LOGS_SERVICE } from './domain/interfaces/ansible-logs-service.interface';
import { SERVER_LOGS_SERVICE } from './domain/interfaces/server-logs-service.interface';
import { ANSIBLE_LOGS_REPOSITORY } from './domain/repositories/ansible-logs-repository.interface';
import { SERVER_LOGS_REPOSITORY } from './domain/repositories/server-logs-repository.interface';
import { AnsibleLogMapper } from './infrastructure/mappers/ansible-log.mapper';
import { ServerLogMapper } from './infrastructure/mappers/server-log.mapper';
import { AnsibleLogsRepository } from './infrastructure/repositories/ansible-logs.repository';
import { ServerLogsRepository } from './infrastructure/repositories/server-logs.repository';
import { AnsibleLog, AnsibleLogSchema } from './infrastructure/schemas/ansible-log.schema';
import { ServerLog, ServerLogSchema } from './infrastructure/schemas/server-log.schema';
import { LogsController } from './presentation/controllers/logs.controller';
import { ServerLogPresentationMapper } from './presentation/mappers/server-log.mapper';

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
    {
      provide: ANSIBLE_LOGS_SERVICE,
      useClass: AnsibleLogsService,
    },
    AnsibleLogsService,
    ServerLogsService,

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
    // Only export services, not repositories
    SERVER_LOGS_SERVICE,
    ANSIBLE_LOGS_SERVICE,
    ANSIBLE_LOGS_REPOSITORY,
    ServerLogsService,
    AnsibleLogsService,
  ],
})
export class LogsModule {}
