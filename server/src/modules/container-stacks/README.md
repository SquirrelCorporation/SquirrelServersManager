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
# Container Stacks Module

## Overview
The Container Stacks Module provides comprehensive management of container stack repositories and their deployments within the Squirrel Servers Manager application. It enables Git-based container stack management, supporting multiple repository providers and implementing robust version control and deployment strategies.

## Features
- Git-based container stack repository management
- Multi-provider repository support (GitHub, GitLab, etc.)
- Repository synchronization and version control
- Stack deployment and lifecycle management
- Error tracking and recovery mechanisms
- Component-based architecture
- Repository health monitoring
- Secure credential management
- Integration with Ansible Vaults
- Automated repository updates
- Custom stack support
- Repository component management

## Clean Architecture Implementation

### Domain Layer (`/domain`)
- **Entities**
  - Container stack entities
  - Repository configuration entities
  - Component configuration entities
- **Interfaces**
  - Repository interfaces
  - Service interfaces
  - Component interfaces
- **Types**
  - Custom types and enums
  - Shared constants

### Application Layer (`/application`)
- **Services**
  - `ContainerStacksService`: Core stack operations
    - Stack lifecycle management
    - Repository operations
    - Deployment handling
  - `ContainerStacksRepositoryEngineService`: Repository engine
    - Repository synchronization
    - Version control
    - Error management
  - `ContainerRepositoryComponentService`: Component management
    - Component lifecycle
    - Configuration handling
    - Deployment orchestration

### Infrastructure Layer (`/infrastructure`)
- **Repositories**
  - `ContainerCustomStackRepository`: Stack persistence
  - `ContainerCustomStacksRepositoryRepository`: Repository management
- **Schemas**
  - Custom stack schema
  - Repository schema
- **Mappers**
  - `ContainerCustomStackMapper`: Stack entity mapping
  - `ContainerCustomStackRepositoryMapper`: Repository entity mapping

### Presentation Layer (`/presentation`)
- **Controllers**
  - `ContainerStacksController`: Stack management endpoints
  - `ContainerStackRepositoriesController`: Repository management endpoints
- **DTOs**
  - Request/Response objects
  - Validation schemas

## Module Structure
```
container-stacks/
├── __tests__/                    # Test files
├── application/
│   └── services/
│       ├── container-stacks.service.ts
│       ├── container-stacks-repository-engine-service.ts
│       └── container-repository-component.service.ts
├── domain/
│   ├── interfaces/              # Service and repository interfaces
│   └── repositories/           # Repository interfaces
├── infrastructure/
│   ├── mappers/               # Entity mappers
│   ├── repositories/          # Repository implementations
│   └── schemas/              # MongoDB schemas
├── presentation/
│   └── controllers/          # REST controllers
├── container-stacks.module.ts # Module definition
├── index.ts                  # Public exports
└── README.md
```

## API Endpoints
### Stack Management
- `GET /container-stacks`: List all stacks
- `GET /container-stacks/:uuid`: Get stack details
- `POST /container-stacks`: Create stack
- `PUT /container-stacks/:uuid`: Update stack
- `DELETE /container-stacks/:uuid`: Remove stack
- `POST /container-stacks/:uuid/deploy`: Deploy stack

### Repository Management
- `GET /container-stacks-repository`: List repositories
- `GET /container-stacks-repository/:uuid`: Get repository
- `POST /container-stacks-repository`: Add repository
- `PUT /container-stacks-repository/:uuid`: Update repository
- `DELETE /container-stacks-repository/:uuid`: Remove repository
- `PUT /container-stacks-repository/:uuid/sync`: Sync repository
- `PUT /container-stacks-repository/:uuid/reset-error`: Reset error state

## Recent Changes
- Added multi-provider repository support
- Enhanced error handling and recovery
- Improved repository synchronization
- Added component-based architecture
- Enhanced deployment orchestration
- Implemented secure credential management
- Added repository health monitoring
- Improved stack lifecycle management
- Enhanced version control support
- Added automated repository updates