```
  ,;;:;,
   ;;;;;
  ,:;;:;    ,'=.
  ;:;:;' .=" ,'_\
  ':;:;,/  ,__:=@
   ';;:;  =./)_
     `"=\_  )_"`
          ``'"`
```
Squirrel Servers Manager 🐿️
---
# Ansible Module

The Ansible Module provides functionality for executing Ansible commands and playbooks, as well as managing Ansible tasks and logs.

## Features

- Execute Ansible commands and playbooks
- Transform inventory files
- Manage extra variables
- Track Ansible task execution
- Store and retrieve Ansible logs

## Architecture

The module follows the NestJS Clean Architecture pattern with a well-defined layered approach:

- **Domain**: Contains entities, interfaces, and domain logic
- **Application**: Contains services that implement business logic
- **Infrastructure**: Contains implementations of repositories and external services
- **Presentation**: Contains controllers that handle HTTP requests

### Module Structure

```
ansible/
├── domain/            # Domain layer (entities, interfaces)
├── application/       # Application layer (services)
├── infrastructure/    # Infrastructure layer (repositories)
├── presentation/      # Presentation layer (controllers)
├── __tests__/         # Tests
├── utils/             # Utility functions
├── extravars/         # Extra variables management
├── index.ts           # Barrel file for exports
├── ansible.module.ts  # Module definition
└── README.md          # This file
```

### Dependency Injection

The module uses NestJS dependency injection patterns:

1. **Service-to-Service Injection**: Direct class-based injection
   ```typescript
   constructor(
     private readonly shellWrapperService: ShellWrapperService,
     private readonly sshKeyService: SshKeyService
   ) {}
   ```

2. **Repository Injection**: Token-based injection
   ```typescript
   constructor(
     @Inject('DEVICE_REPOSITORY') private readonly deviceRepository: any,
     @Inject('ANSIBLE_TASK_REPOSITORY') private readonly ansibleTaskRepository: any
   ) {}
   ```

3. **Module Exports**: Each module exports its entities and services through barrel files (index.ts)
   ```typescript
   // From a module's index.ts
   export { IDevice, IDeviceAuth }; // Entities
   export { DeviceService };        // Services
   ```

### Domain Entities

The module uses interfaces for domain entities that are imported from their respective modules:

- `IUser` from the users module
- `IDeviceAuth` from the devices module
- `IAnsibleVault` from the ansible-vault module

### Services

- **AnsibleCommandService**: Service for executing Ansible commands
- **AnsibleCommandBuilderService**: Service for building Ansible commands
- **AnsibleGalaxyCommandService**: Service for executing Ansible Galaxy commands
- **InventoryTransformerService**: Service for transforming inventory files
- **ExtraVarsService**: Service for managing extra variables
- **ExtraVarsTransformerService**: Service for transforming extra variables
- **GalaxyService**: Service for managing Ansible Galaxy collections
- **TaskLogsService**: Service for managing Ansible task logs

### Controllers

- `TaskLogsController`: Controller for Ansible task logs operations
- `GalaxyController`: Controller for Ansible Galaxy operations

## Recent Architectural Improvements

### Migration to NestJS Clean Architecture

- Implemented proper layered architecture (domain, application, infrastructure, presentation)
- Used barrel files (index.ts) to export entities and services from each module
- Improved dependency injection with proper NestJS patterns
- Removed direct database access in services in favor of repository injection
- Updated imports to use module-level exports rather than direct file paths

### Type Safety Improvements

- Replaced concrete model classes with interfaces from their respective modules
- Improved error handling and type checking
- Enhanced service method signatures for better IDE support

## API Endpoints

- `GET /ansible/logs/tasks`: Get all Ansible task logs
- `GET /ansible/logs/tasks/:id/events`: Get events for a specific Ansible task
- `GET /ansible/galaxy/collections`: Get Ansible Galaxy collections
- `POST /ansible/galaxy/collections`: Install an Ansible Galaxy collection

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
import { AnsibleCommandService } from './modules/ansible';

@Injectable()
export class MyService {
  constructor(private readonly ansibleCommandService: AnsibleCommandService) {}

  async executePlaybook(playbookPath: string, user: IUser, target?: string[]) {
    return this.ansibleCommandService.executePlaybookFull(playbookPath, user, target);
  }
}
```

### Managing Ansible Task Logs

```typescript
import { TaskLogsService } from './modules/ansible';

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
