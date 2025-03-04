import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ShellModule } from '../shell/shell.module';
import { AnsibleCommandService } from './services/ansible-command.service';
import { AnsibleCommandBuilderService } from './services/ansible-command-builder.service';
import { AnsibleGalaxyCommandService } from './services/ansible-galaxy-command.service';
import { InventoryTransformerService } from './services/inventory-transformer.service';
import { ExtraVarsService } from './services/extra-vars.service';
import { ExtraVarsTransformerService } from './services/extra-vars-transformer.service';
import { TaskLogsService } from './services/task-logs.service';
import { TaskLogsController } from './controllers/task-logs.controller';
import { GalaxyController } from './controllers/galaxy.controller';
import { GalaxyService } from './services/galaxy.service';
import { AnsibleLogsRepository } from './repositories/ansible-logs.repository';
import { AnsibleTaskRepository } from './repositories/ansible-task.repository';
import { AnsibleLog, AnsibleLogSchema } from './schemas/ansible-log.schema';
import { AnsibleTask, AnsibleTaskSchema } from './schemas/ansible-task.schema';

/**
 * AnsibleModule provides services for executing Ansible commands and playbooks
 */
@Module({
  imports: [
    HttpModule,
    ShellModule,
    MongooseModule.forFeature([
      { name: AnsibleLog.name, schema: AnsibleLogSchema },
      { name: AnsibleTask.name, schema: AnsibleTaskSchema },
    ]),
  ],
  controllers: [TaskLogsController, GalaxyController],
  providers: [
    AnsibleCommandService,
    AnsibleCommandBuilderService,
    AnsibleGalaxyCommandService,
    InventoryTransformerService,
    ExtraVarsService,
    ExtraVarsTransformerService,
    TaskLogsService,
    GalaxyService,
    AnsibleLogsRepository,
    AnsibleTaskRepository,
  ],
  exports: [
    AnsibleCommandService,
    AnsibleCommandBuilderService,
    AnsibleGalaxyCommandService,
    InventoryTransformerService,
    ExtraVarsService,
    ExtraVarsTransformerService,
    TaskLogsService,
    GalaxyService,
    AnsibleLogsRepository,
    AnsibleTaskRepository,
  ],
})
export class AnsibleModule {}
