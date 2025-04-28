import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnsibleVaultsModule, DEFAULT_VAULT_ID } from '../ansible-vaults';
import { DevicesModule } from '../devices/devices.module';
import { LogsModule } from '../logs/logs.module';
import { ShellModule } from '../shell/shell.module';
import { UsersModule } from '../users/users.module';
import { AnsibleCommandBuilderService } from './application/services/ansible-command-builder.service';
import { AnsibleCommandService } from './application/services/ansible-command.service';
import { AnsibleGalaxyCommandService } from './application/services/ansible-galaxy-command.service';
import { AnsibleHooksService } from './application/services/ansible-hooks.service';
import { ExtraVarsTransformerService } from './application/services/extra-vars-transformer.service';
import { ExtraVarsService } from './application/services/extra-vars.service';
import { GalaxyService } from './application/services/galaxy.service';
import { InventoryTransformerService } from './application/services/inventory-transformer.service';
import { TaskLogsService } from './application/services/task-logs.service';
import { TASK_LOGS_SERVICE } from './domain/interfaces/task-logs-service.interface';
import { ANSIBLE_TASK_STATUS_REPOSITORY } from './domain/repositories/ansible-task-status.repository.interface';
import { ANSIBLE_TASK_REPOSITORY } from './domain/repositories/ansible-task.repository.interface';
import { AnsibleTaskStatusRepository } from './infrastructure/repositories/ansible-task-status.repository';
import { AnsibleTaskRepository } from './infrastructure/repositories/ansible-task.repository';
import {
  AnsibleTaskStatus,
  AnsibleTaskStatusSchema,
} from './infrastructure/schemas/ansible-task-status.schema';
import { AnsibleTask, AnsibleTaskSchema } from './infrastructure/schemas/ansible-task.schema';
import { GalaxyController } from './presentation/controllers/ansible-galaxy.controller';
import { AnsibleHooksController } from './presentation/controllers/ansible-hooks.controller';
import { TaskLogsController } from './presentation/controllers/ansible-task-logs.controller';
import { AnsibleInventoryController } from './presentation/controllers/ansible-inventory.controller';
import { ANSIBLE_COMMAND_SERVICE } from './domain/interfaces/ansible-command-service.interface';
import { INVENTORY_TRANSFORMER_SERVICE } from './domain/interfaces/inventory-transformer-service.interface';
import { EXTRA_VARS_SERVICE } from './domain/interfaces/extra-vars-service.interface';

/**
 * AnsibleModule provides services for executing Ansible commands and playbooks
 */
@Module({
  imports: [
    HttpModule,
    ShellModule,
    LogsModule,
    AnsibleVaultsModule,
    UsersModule,
    forwardRef(() => DevicesModule),
    MongooseModule.forFeature([
      { name: AnsibleTask.name, schema: AnsibleTaskSchema },
      { name: AnsibleTaskStatus.name, schema: AnsibleTaskStatusSchema },
    ]),
  ],
  controllers: [
    TaskLogsController,
    GalaxyController,
    AnsibleHooksController,
    AnsibleInventoryController,
  ],
  providers: [
    {
      provide: ANSIBLE_COMMAND_SERVICE,
      useClass: AnsibleCommandService,
    },
    AnsibleCommandBuilderService,
    AnsibleGalaxyCommandService,
    {
      provide: INVENTORY_TRANSFORMER_SERVICE,
      useClass: InventoryTransformerService,
    },
    {
      provide: EXTRA_VARS_SERVICE,
      useClass: ExtraVarsService,
    },
    ExtraVarsTransformerService,
    {
      provide: TASK_LOGS_SERVICE,
      useClass: TaskLogsService,
    },
    GalaxyService,
    {
      provide: DEFAULT_VAULT_ID,
      useValue: DEFAULT_VAULT_ID,
    },
    AnsibleHooksService,
    AnsibleTaskRepository,
    AnsibleTaskStatusRepository,
    {
      provide: ANSIBLE_TASK_REPOSITORY,
      useClass: AnsibleTaskRepository,
    },
    {
      provide: ANSIBLE_TASK_STATUS_REPOSITORY,
      useExisting: AnsibleTaskStatusRepository,
    },
  ],
  exports: [
    ANSIBLE_COMMAND_SERVICE,
    AnsibleCommandBuilderService,
    AnsibleGalaxyCommandService,
    INVENTORY_TRANSFORMER_SERVICE,
    EXTRA_VARS_SERVICE,
    ExtraVarsTransformerService,
    TASK_LOGS_SERVICE,
    GalaxyService,
    AnsibleHooksService,
  ],
})
export class AnsibleModule {}
