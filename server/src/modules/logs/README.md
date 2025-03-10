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
# Logs Module - Clean Architecture

## Overview

The Logs module provides a comprehensive system for managing server logs and Ansible task execution logs within the Squirrel Servers Manager application. It allows users to view, search, and manage logs for both server activities and Ansible automation tasks.

## Clean Architecture Structure

The module follows the Clean Architecture pattern with the following layers:

### 1. Domain Layer

The core business logic and entities, independent of any framework or external concerns.

- **Entities**: Pure domain entities without any framework dependencies
  - `server-log.entity.ts`
  - `ansible-log.entity.ts`
  - `ansible-task.entity.ts`

- **Repository Interfaces**: Abstractions for data access
  - `server-logs-repository.interface.ts`
  - `ansible-logs-repository.interface.ts`
  - `ansible-task-repository.interface.ts`

### 2. Application Layer

Contains the application-specific business rules and orchestrates the flow of data to and from entities.

- **Services**: Implement use cases that orchestrate the flow of data
  - `server-logs.service.ts`

- **Interfaces**: Service interfaces for dependency inversion
  - `server-logs-service.interface.ts`

### 3. Infrastructure Layer

Implements interfaces defined in the domain layer, providing concrete implementations for external concerns.

- **Repositories**: Database-specific implementations of repository interfaces
  - `server-logs.repository.ts`
  - `ansible-logs.repository.ts`
  - `ansible-task.repository.ts`

- **Schemas**: Database schemas for MongoDB
  - `server-log.schema.ts`
  - `ansible-log.schema.ts`
  - `ansible-task.schema.ts`

- **Mappers**: Map between domain entities and database schemas
  - `server-log.mapper.ts`
  - `ansible-log.mapper.ts`
  - `ansible-task.mapper.ts`

### 4. Presentation Layer

Handles HTTP requests and responses, converting between the application's internal data format and the format exposed to external clients.

- **Controllers**: Handle HTTP requests and responses
  - `logs.controller.ts`

- **DTOs**: Data Transfer Objects for API requests/responses
  - `server-log-response.dto.ts`
  - `server-logs-query.dto.ts`

- **Mappers**: Map between domain entities and DTOs
  - `server-log.mapper.ts`

## Testing Structure

The test files mirror the module structure:

```
__tests__/
├── application/
│   └── services/
│       └── server-logs.service.spec.ts
├── infrastructure/
│   └── repositories/
│       ├── server-logs.repository.spec.ts
│       ├── ansible-logs.repository.spec.ts
│       └── ansible-task.repository.spec.ts
└── presentation/
    └── controllers/
        └── logs.controller.spec.ts
```

## Dependency Rule

The fundamental rule of Clean Architecture is that dependencies can only point inward. This means:

- Presentation depends on Application
- Application depends on Domain
- Infrastructure implements interfaces defined in Domain

No inner layer should depend on an outer layer.

## Benefits of Clean Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Business logic can be tested independently of external concerns
3. **Flexibility**: External frameworks and tools can be replaced with minimal impact
4. **Maintainability**: Changes in one layer have minimal impact on other layers

## API Endpoints

- `GET /logs/server`: Get server logs with filtering and pagination
  - Query parameters:
    - `current`: Current page number (default: 1)
    - `pageSize`: Number of items per page (default: 10)
    - `search`: Search term to filter logs
    - `sortField`: Field to sort by
    - `sortOrder`: Sort order ('ascend' or 'descend')
