import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsController } from './controllers/logs.controller';
import { AnsibleLogsRepository } from './repositories/ansible-logs.repository';
import { AnsibleTaskRepository } from './repositories/ansible-task.repository';
import { ServerLogsRepository } from './repositories/server-logs.repository';
import { AnsibleLog, AnsibleLogSchema } from './schemas/ansible-log.schema';
import { AnsibleTask, AnsibleTaskSchema } from './schemas/ansible-task.schema';
import { ServerLog, ServerLogSchema } from './schemas/server-log.schema';
import { ServerLogsService } from './services/server-logs.service';
import { TaskLogsService } from './services/task-logs.service';

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
    ServerLogsService,
    TaskLogsService,
    ServerLogsRepository,
    AnsibleLogsRepository,
    AnsibleTaskRepository,
  ],
  exports: [
    ServerLogsService,
    TaskLogsService,
    ServerLogsRepository,
    AnsibleLogsRepository,
    AnsibleTaskRepository,
  ],
})
export class LogsModule {}
