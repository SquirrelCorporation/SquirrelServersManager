import { AnsibleCommandBuilderService } from './application/services/ansible-command-builder.service';
import { AnsibleCommandService } from './application/services/ansible-command.service';
import { AnsibleGalaxyCommandService } from './application/services/ansible-galaxy-command.service';
import { ExtraVarsTransformerService } from './application/services/extra-vars-transformer.service';
import { ExtraVarsService } from './application/services/extra-vars.service';
import { InventoryTransformerService } from './application/services/inventory-transformer.service';
import { TaskLogsService } from './application/services/task-logs.service';
import { IAnsibleTaskStatus } from './domain/entities/ansible-task-status.interface';
import { IAnsibleTask } from './domain/entities/ansible-task.interface';
import {
  ITaskLogsService,
  TASK_LOGS_SERVICE,
} from './domain/interfaces/task-logs-service.interface';
import {
  ANSIBLE_TASK_STATUS_REPOSITORY,
  IAnsibleTaskStatusRepository,
} from './domain/repositories/ansible-task-status.repository.interface';
import { IAnsibleTaskRepository } from './domain/repositories/ansible-task.repository.interface';
import { AnsibleTaskStatusRepository } from './infrastructure/repositories/ansible-task-status.repository';
import { AnsibleTaskRepository } from './infrastructure/repositories/ansible-task.repository';
import {
  AnsibleTaskStatus,
  AnsibleTaskStatusSchema,
} from './infrastructure/schemas/ansible-task-status.schema';
import { AnsibleTask, AnsibleTaskSchema } from './infrastructure/schemas/ansible-task.schema';

// Export all NestJS services
export {
  AnsibleCommandService,
  AnsibleCommandBuilderService,
  AnsibleGalaxyCommandService,
  InventoryTransformerService,
  ExtraVarsService,
  ExtraVarsTransformerService,
  IAnsibleTaskStatusRepository,
  ANSIBLE_TASK_STATUS_REPOSITORY,
  IAnsibleTaskStatus,
  IAnsibleTaskRepository,
  IAnsibleTask,
  AnsibleTaskStatusRepository,
  AnsibleTaskRepository,
  AnsibleTaskStatus,
  AnsibleTaskStatusSchema,
  AnsibleTask,
  AnsibleTaskSchema,
  TaskLogsService,
  ITaskLogsService,
  TASK_LOGS_SERVICE,
};

// Domain exports
export * from './domain/repositories/ansible-task.repository.interface';
export * from './domain/interfaces/task-logs-service.interface';
export * from './domain/interfaces/ansible-command-service.interface';
export * from './domain/interfaces/inventory-transformer-service.interface';
export * from './domain/interfaces/extra-vars-service.interface';
export * from './domain/entities/ansible-task.entity';
export * from './domain/entities/ansible-task-status.entity';

// Module export
export * from './ansible.module';

export * from './application/services/ansible-command.service';
export * from './application/services/ansible-command-builder.service';
export * from './application/services/ansible-galaxy-command.service';
export * from './application/services/extra-vars.service';
export * from './application/services/extra-vars-transformer.service';
export * from './application/services/galaxy.service';
export * from './application/services/inventory-transformer.service';
export * from './application/services/task-logs.service';
export * from './ansible.module';
