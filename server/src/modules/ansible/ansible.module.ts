import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '../../infrastructure/cache';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { AnsibleVaultModule, DEFAULT_VAULT_ID } from '../ansible-vault';
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

/**
 * AnsibleModule provides services for executing Ansible commands and playbooks
 */
@Module({
  imports: [
    HttpModule,
    ShellModule,
    LogsModule,
    AnsibleVaultModule,
    UsersModule,
    forwardRef(() => DevicesModule),
    MongooseModule.forFeature([
      { name: AnsibleTask.name, schema: AnsibleTaskSchema },
      { name: AnsibleTaskStatus.name, schema: AnsibleTaskStatusSchema },
    ]),
    CacheModule,
  ],
  controllers: [TaskLogsController, GalaxyController, AnsibleHooksController],
  providers: [
    AnsibleCommandService,
    AnsibleCommandBuilderService,
    AnsibleGalaxyCommandService,
    InventoryTransformerService,
    ExtraVarsService,
    ExtraVarsTransformerService,
    TaskLogsService,
    GalaxyService,
    {
      provide: DEFAULT_VAULT_ID,
      useValue: DEFAULT_VAULT_ID,
    },
    AnsibleHooksService,
    AnsibleTaskRepository,
    AnsibleTaskStatusRepository,
    {
      provide: 'ICacheService',
      useExisting: CacheService,
    },
    {
      provide: 'IAnsibleTaskRepository',
      useClass: AnsibleTaskRepository,
    },
    {
      provide: 'IAnsibleTaskStatusRepository',
      useExisting: AnsibleTaskStatusRepository,
    },
    {
      provide: 'ANSIBLE_TASK_REPOSITORY',
      useExisting: AnsibleTaskRepository,
    },
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
    AnsibleHooksService,
    AnsibleTaskRepository,
    AnsibleTaskStatusRepository,
    'ICacheService',
    'IAnsibleTaskRepository',
    'IAnsibleTaskStatusRepository',
    'ANSIBLE_TASK_REPOSITORY',
  ],
})
export class AnsibleModule {}
