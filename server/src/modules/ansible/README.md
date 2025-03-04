# Ansible Module

The Ansible Module provides functionality for executing Ansible commands and playbooks, as well as managing Ansible tasks and logs.

## Features

- Execute Ansible commands and playbooks
- Transform inventory files
- Manage extra variables
- Track Ansible task execution
- Store and retrieve Ansible logs

## Architecture

The module follows a standard NestJS architecture with:

- **Controllers**: Handle HTTP requests and delegate to services
- **Services**: Implement business logic
- **Schemas**: Define data models
- **Repositories**: Handle database operations
- **DTOs**: Define data transfer objects
- **Bridge Classes**: Provide backward compatibility with the old codebase

### Controllers

- `TaskLogsController`: Controller for Ansible task logs operations

### Services

- `AnsibleCommandService`: Service for executing Ansible commands
- `AnsibleCommandBuilderService`: Service for building Ansible commands
- `AnsibleGalaxyCommandService`: Service for executing Ansible Galaxy commands
- `InventoryTransformerService`: Service for transforming inventory files
- `ExtraVarsService`: Service for managing extra variables
- `ExtraVarsTransformerService`: Service for transforming extra variables
- `TaskLogsService`: Service for managing Ansible task logs

### Schemas

- `AnsibleLog`: Schema for Ansible logs
- `AnsibleTask`: Schema for Ansible tasks

### Repositories

- `AnsibleLogsRepository`: Repository for Ansible logs
- `AnsibleTaskRepository`: Repository for Ansible tasks

### Bridge Classes

- `AnsibleCmd`: Bridge class for executing Ansible commands
- `AnsibleGalaxyCmd`: Bridge class for executing Ansible Galaxy commands
- `ExtraVars`: Bridge class for managing extra variables
- `InventoryTransformer`: Bridge class for transforming inventory files

## Recent Changes

### Migration of Ansible Logs and Tasks

- Moved Ansible logs and tasks from the Logs module to the Ansible module
- Created dedicated schemas, repositories, services, and controllers in the Ansible module
- Updated the module imports and exports
- Updated the API endpoints to use the new structure

### API Endpoints

- `GET /ansible/logs/tasks`: Get all Ansible task logs
- `GET /ansible/logs/tasks/:id/events`: Get events for a specific Ansible task

## Usage

The module is used by importing it into the application module:

```typescript
import { AnsibleModule } from './modules/ansible/ansible.module';

@Module({
  imports: [
    // ...
    AnsibleModule,
    // ...
  ],
})
export class AppModule {}
```

## Using the Services

### Executing Ansible Commands

```typescript
import { AnsibleCommandService } from './modules/ansible/services/ansible-command.service';

@Injectable()
export class MyService {
  constructor(private readonly ansibleCommandService: AnsibleCommandService) {}

  async executePlaybook(playbookPath: string, inventory: string) {
    return this.ansibleCommandService.executePlaybook(playbookPath, inventory);
  }
}
```

### Managing Ansible Task Logs

```typescript
import { TaskLogsService } from './modules/ansible/services/task-logs.service';

@Injectable()
export class MyService {
  constructor(private readonly taskLogsService: TaskLogsService) {}

  async getTaskLogs(params: TaskLogsQueryDto) {
    return this.taskLogsService.getTaskLogs(params);
  }

  async getTaskEvents(taskId: string) {
    return this.taskLogsService.getTaskEvents(taskId);
  }
}
``` 