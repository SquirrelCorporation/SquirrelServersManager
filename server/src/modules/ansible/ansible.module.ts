import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ShellModule } from '../shell/shell.module';
import { LogsModule } from '../logs/logs.module';
import { DevicesModule } from '../devices/devices.module';
import { UsersModule } from '../users/users.module';
import { CacheModule } from '../../infrastructure/cache';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { AnsibleVaultModule, DEFAULT_VAULT_ID } from '../ansible-vault';
import { AnsibleCommandService } from './application/services/ansible-command.service';
import { AnsibleCommandBuilderService } from './application/services/ansible-command-builder.service';
import { AnsibleGalaxyCommandService } from './application/services/ansible-galaxy-command.service';
import { InventoryTransformerService } from './application/services/inventory-transformer.service';
import { ExtraVarsService } from './application/services/extra-vars.service';
import { ExtraVarsTransformerService } from './application/services/extra-vars-transformer.service';
import { TaskLogsService } from './application/services/task-logs.service';
import { PlaybookHooksService } from './application/services/playbook-hooks.service';
import { TaskLogsController } from './presentation/controllers/task-logs.controller';
import { GalaxyController } from './presentation/controllers/galaxy.controller';
import { PlaybookHooksController } from './presentation/controllers/playbook-hooks.controller';
import { GalaxyService } from './application/services/galaxy.service';
import { AnsibleTaskRepository } from './infrastructure/repositories/ansible-task.repository';
import { AnsibleTaskStatusRepository } from './infrastructure/repositories/ansible-task-status.repository';
import { AnsibleTask, AnsibleTaskSchema } from './infrastructure/schemas/ansible-task.schema';
import { AnsibleTaskStatus, AnsibleTaskStatusSchema } from './infrastructure/schemas/ansible-task-status.schema';

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
  controllers: [TaskLogsController, GalaxyController, PlaybookHooksController],
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
    PlaybookHooksService,
    AnsibleTaskRepository,
    AnsibleTaskStatusRepository,
    {
      provide: 'ICacheService',
      useExisting: CacheService,
    },
    {
      provide: 'IAnsibleTaskRepository',
      useExisting: AnsibleTaskRepository,
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
    PlaybookHooksService,
    AnsibleTaskRepository,
    AnsibleTaskStatusRepository,
    'ICacheService',
    'IAnsibleTaskRepository',
    'IAnsibleTaskStatusRepository',
    'ANSIBLE_TASK_REPOSITORY',
  ],
})
export class AnsibleModule {}
