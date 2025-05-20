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
# Playbooks Module

## Overview

The Playbooks Module provides comprehensive functionality for managing Ansible playbooks and playbook repositories within the Squirrel Servers Manager application. It follows Clean Architecture principles to ensure separation of concerns and maintainability.

## Features

- Playbook management and execution
- Git-based playbook repository management
- Local playbook repository management
- Repository tree structure management
- Extra variables management
- Repository synchronization
- Default repository management
- Diagnostic capabilities

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core business entities and interfaces:

- **Entities**
  - `playbook.entity.ts`: Core domain entity for playbooks
  - `playbooks-register.entity.ts`: Entity for playbook repositories
- **Repository Interfaces**
  - `playbook-repository.interface.ts`: Playbook data access contract
  - `playbooks-register-repository.interface.ts`: Repository data access contract
- **Service Interfaces**
  - `playbooks-service.interface.ts`: Playbook service contract
  - `playbooks-register-service.interface.ts`: Repository service contract
  - `tree-node-service.interface.ts`: Tree structure contract

### Application Layer

Contains the business logic and services:

- **Core Services**
  - `playbook.service.ts`: Core playbook management
  - `playbooks-register.service.ts`: Repository management
  - `tree-node.service.ts`: Tree structure management
  - `register-tree.service.ts`: Repository tree management
  - `default-playbooks-register.service.ts`: Default repository handling
- **Components**
  - `component-factory.service.ts`: Factory for repository components
  - `abstract-playbooks-register.component.ts`: Base repository component
  - `git-playbooks-register.component.ts`: Git repository handling
  - `local-playbooks-repository.component.ts`: Local repository handling
- **Engine**
  - `playbooks-register-engine.service.ts`: Repository engine management

### Infrastructure Layer

Contains implementations of repositories and schemas:

- **Repositories**
  - `playbook.repository.ts`: MongoDB repository for playbooks
  - `playbooks-register.repository.ts`: MongoDB repository for repositories
- **Schemas**
  - `playbook.schema.ts`: Mongoose schema for playbooks
  - `playbooks-register.schema.ts`: Mongoose schema for repositories

### Presentation Layer

Contains controllers for API endpoints:

- **Controllers**
  - `playbook.controller.ts`: Playbook management endpoints
  - `playbooks-repository.controller.ts`: Repository management endpoints
  - `git-playbooks-register.controller.ts`: Git repository endpoints
  - `local-playbooks-register.controller.ts`: Local repository endpoints
  - `playbook-diagnostic.controller.ts`: Diagnostic endpoints

## Module Structure

```
playbooks/
├── domain/
│   ├── entities/
│   │   ├── playbook.entity.ts
│   │   └── playbooks-register.entity.ts
│   ├── repositories/
│   │   ├── playbook-repository.interface.ts
│   │   └── playbooks-register-repository.interface.ts
│   ├── services/
│   │   ├── playbooks-service.interface.ts
│   │   ├── playbooks-register-service.interface.ts
│   │   └── tree-node-service.interface.ts
│   └── interfaces/
├── application/
│   └── services/
│       ├── playbook.service.ts
│       ├── playbooks-register.service.ts
│       ├── tree-node.service.ts
│       ├── register-tree.service.ts
│       ├── default-playbooks-register.service.ts
│       ├── components/
│       │   ├── component-factory.service.ts
│       │   ├── abstract-playbooks-register.component.ts
│       │   ├── git-playbooks-register.component.ts
│       │   └── local-playbooks-repository.component.ts
│       └── engine/
│           └── playbooks-register-engine.service.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── playbook.repository.ts
│   │   └── playbooks-register.repository.ts
│   └── schemas/
│       ├── playbook.schema.ts
│       └── playbooks-register.schema.ts
├── presentation/
│   └── controllers/
│       ├── playbook.controller.ts
│       ├── playbooks-repository.controller.ts
│       ├── git-playbooks-register.controller.ts
│       ├── local-playbooks-register.controller.ts
│       └── playbook-diagnostic.controller.ts
├── __tests__/
├── constants.ts
├── playbooks.module.ts
├── index.ts
└── README.md
```

## Integration

The module is integrated through dependency injection:

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Playbook.name, schema: PlaybookSchema },
      { name: PlaybooksRegister.name, schema: PlaybooksRegisterSchema },
    ]),
    ShellModule,
    AnsibleModule,
    AnsibleVaultsModule,
    DevicesModule,
  ],
  controllers: [
    GitPlaybooksRepositoryController,
    LocalPlaybooksRepositoryController,
    PlaybookDiagnosticController,
    PlaybooksRepositoryController,
    PlaybookController,
  ],
  providers: [
    // Application services
    PlaybookService,
    PlaybooksRegisterService,
    TreeNodeService,
    RegisterTreeService,
    DefaultPlaybooksRegisterService,
    
    // Infrastructure services
    PlaybooksRegisterEngineService,
    
    // Factory service
    PlaybooksRegisterComponentFactory,
    
    // Infrastructure repositories
    PlaybooksRegisterRepository,
    PlaybookRepository,
  ],
  exports: [
    // Application services
    PlaybookService,
    PlaybooksRegisterService,
    TreeNodeService,
    
    // Engine service for external use
    PlaybooksRegisterEngineService,
  ],
})
```

## API Endpoints

### Playbook Management

- `GET /playbooks`: List all playbooks
- `GET /playbooks/:uuid`: Get playbook by UUID
- `POST /playbooks`: Create new playbook
- `PATCH /playbooks/:uuid`: Update playbook
- `DELETE /playbooks/:uuid`: Delete playbook

### Repository Management

- `GET /playbooks/repositories`: List repositories
- `POST /playbooks/repositories`: Create repository
- `GET /playbooks/repositories/:uuid`: Get repository
- `PATCH /playbooks/repositories/:uuid`: Update repository
- `DELETE /playbooks/repositories/:uuid`: Delete repository
- `POST /playbooks/repositories/:uuid/sync`: Sync repository
- `GET /playbooks/repositories/:uuid/tree`: Get repository tree

### Git Repository Operations

- `POST /playbooks/repositories/git`: Create Git repository
- `PATCH /playbooks/repositories/git/:uuid`: Update Git repository
- `POST /playbooks/repositories/git/:uuid/sync`: Sync Git repository

### Local Repository Operations

- `POST /playbooks/repositories/local`: Create local repository
- `PATCH /playbooks/repositories/local/:uuid`: Update local repository
- `POST /playbooks/repositories/local/:uuid/sync`: Sync local repository

### Diagnostics

- `GET /playbooks/diagnostic/:uuid`: Get playbook diagnostics
- `POST /playbooks/diagnostic/:uuid/check`: Run diagnostic check

## Testing

The module includes comprehensive tests in the `__tests__` directory that verify:

- Service functionality
- Repository operations
- Controller endpoints
- Component behavior
- Integration with other modules

Run the tests using:

```bash
npm test -- modules/playbooks
```

## Recent Changes

- Enhanced repository component system
- Improved Git repository handling
- Added local repository support
- Enhanced tree structure management
- Improved diagnostic capabilities
- Added comprehensive test coverage
