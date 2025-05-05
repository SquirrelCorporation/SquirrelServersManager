```ascii
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

## Overview

The Ansible Module provides comprehensive functionality for executing Ansible commands, managing playbooks, and handling Galaxy collections within the Squirrel Servers Manager application. It follows Clean Architecture principles to ensure separation of concerns and maintainability.

## Features

- Ansible command execution and management
- Inventory transformation and management
- Extra variables handling
- Galaxy collection management
- Task logging and monitoring
- Ansible hooks integration
- Command building and validation
- Secure vault integration

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core business entities and interfaces:

- **Interfaces**
  - `task-logs-service.interface.ts`: Task logging contract
  - `ansible-task-repository.interface.ts`: Task data access contract
  - `ansible-task-status-repository.interface.ts`: Task status contract

### Application Layer

Contains the business logic and services:

- **Command Services**
  - `ansible-command.service.ts`: Core Ansible command execution
  - `ansible-command-builder.service.ts`: Command construction
  - `ansible-galaxy-command.service.ts`: Galaxy command handling
- **Transformation Services**
  - `inventory-transformer.service.ts`: Inventory processing
  - `extra-vars-transformer.service.ts`: Variables transformation
  - `extra-vars.service.ts`: Variables management
- **Task Management**
  - `task-logs.service.ts`: Task logging and monitoring
  - `ansible-hooks.service.ts`: Hooks management
- **Galaxy Management**
  - `galaxy.service.ts`: Galaxy collections handling

### Infrastructure Layer

Contains implementations of repositories and schemas:

- **Repositories**
  - `ansible-task.repository.ts`: Task data storage
  - `ansible-task-status.repository.ts`: Task status storage
- **Schemas**
  - `ansible-task.schema.ts`: Task MongoDB schema
  - `ansible-task-status.schema.ts`: Task status schema

### Presentation Layer

Contains controllers for API endpoints:

- **Controllers**
  - `ansible-task-logs.controller.ts`: Task log endpoints
  - `ansible-galaxy.controller.ts`: Galaxy management endpoints
  - `ansible-hooks.controller.ts`: Hooks management endpoints

## Module Structure

```
ansible/
├── domain/
│   ├── interfaces/
│   │   ├── task-logs-service.interface.ts
│   │   └── repositories/
│   │       ├── ansible-task-repository.interface.ts
│   │       └── ansible-task-status-repository.interface.ts
├── application/
│   └── services/
│       ├── ansible-command.service.ts
│       ├── ansible-command-builder.service.ts
│       ├── ansible-galaxy-command.service.ts
│       ├── inventory-transformer.service.ts
│       ├── extra-vars-transformer.service.ts
│       ├── extra-vars.service.ts
│       ├── galaxy.service.ts
│       ├── ansible-hooks.service.ts
│       └── task-logs.service.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── ansible-task.repository.ts
│   │   └── ansible-task-status.repository.ts
│   └── schemas/
│       ├── ansible-task.schema.ts
│       └── ansible-task-status.schema.ts
├── presentation/
│   └── controllers/
│       ├── ansible-task-logs.controller.ts
│       ├── ansible-galaxy.controller.ts
│       └── ansible-hooks.controller.ts
├── __tests__/
├── ansible.module.ts
├── index.ts
└── README.md
```

## Integration

The module is integrated through dependency injection:

```typescript
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
  ],
  providers: [
    // Command Services
    AnsibleCommandService,
    AnsibleCommandBuilderService,
    AnsibleGalaxyCommandService,
    
    // Transformation Services
    InventoryTransformerService,
    ExtraVarsService,
    ExtraVarsTransformerService,
    
    // Task Management
    TaskLogsService,
    {
      provide: TASK_LOGS_SERVICE,
      useClass: TaskLogsService,
    },
    
    // Galaxy Management
    GalaxyService,
    
    // Hooks
    AnsibleHooksService,
    
    // Repositories
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
    AnsibleCommandService,
    AnsibleCommandBuilderService,
    AnsibleGalaxyCommandService,
    InventoryTransformerService,
    ExtraVarsService,
    ExtraVarsTransformerService,
    TaskLogsService,
    TASK_LOGS_SERVICE,
    GalaxyService,
    AnsibleHooksService,
  ],
})
```

## API Endpoints

### Task Logs

- `GET /ansible/tasks/:taskId/logs`: Get task logs
- `GET /ansible/tasks/:taskId/status`: Get task status
- `POST /ansible/tasks/:taskId/cancel`: Cancel running task

### Galaxy Management

- `GET /ansible/galaxy/collections`: List installed collections
- `POST /ansible/galaxy/collections/install`: Install collection
- `DELETE /ansible/galaxy/collections/:name`: Remove collection

### Hooks Management

- `GET /ansible/hooks`: List available hooks
- `POST /ansible/hooks/:hookName`: Execute hook

## Recent Changes

- Enhanced command building and validation
- Improved task logging and monitoring
- Added Galaxy collection management
- Enhanced hooks system
- Improved error handling
- Added comprehensive test coverage 
