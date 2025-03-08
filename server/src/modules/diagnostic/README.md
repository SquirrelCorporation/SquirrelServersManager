# Diagnostic Module

This module provides diagnostic capabilities for devices in the system. It follows a clean architecture pattern with the following layers:

## Domain Layer

The core business logic and entities:

- `entities/diagnostic.entity.ts`: Contains the core domain entities and types
- `repositories/diagnostic-repository.interface.ts`: Defines the repository interface for data access

## Application Layer

The application services that orchestrate the use cases:

- `interfaces/diagnostic-service.interface.ts`: Defines the service interface
- `services/diagnostic.service.ts`: Implements the diagnostic service logic

## Infrastructure Layer

The implementation of interfaces defined in the domain layer:

- `repositories/diagnostic.repository.ts`: Implements the repository interface

## Presentation Layer

The controllers, DTOs, and mappers for the API:

- `controllers/diagnostic.controller.ts`: Handles HTTP requests
- `dtos/diagnostic.dto.ts`: Data Transfer Objects for API requests and responses
- `mappers/diagnostic.mapper.ts`: Maps between domain entities and DTOs

## Module Structure

The module is organized as follows:

```
diagnostic/
├── application/
│   ├── interfaces/
│   │   └── diagnostic-service.interface.ts
│   └── services/
│       └── diagnostic.service.ts
├── domain/
│   ├── entities/
│   │   └── diagnostic.entity.ts
│   └── repositories/
│       └── diagnostic-repository.interface.ts
├── infrastructure/
│   └── repositories/
│       └── diagnostic.repository.ts
├── presentation/
│   ├── controllers/
│   │   └── diagnostic.controller.ts
│   ├── dtos/
│   │   └── diagnostic.dto.ts
│   └── mappers/
│       └── diagnostic.mapper.ts
├── __tests__/
│   ├── application/
│   │   └── services/
│   │       └── diagnostic.service.spec.ts
│   ├── infrastructure/
│   │   └── repositories/
│   │       └── diagnostic.repository.spec.ts
│   └── presentation/
│       ├── controllers/
│       │   └── diagnostic.controller.spec.ts
│       └── mappers/
│           └── diagnostic.mapper.spec.ts
├── diagnostic.module.ts
├── index.ts
└── README.md
```

## Usage

The diagnostic module provides functionality to run diagnostic checks on devices. It performs the following checks:

1. SSH connectivity
2. SSH Docker connectivity
3. Docker socket availability
4. Disk space
5. CPU and memory information

The diagnostic results are returned as a report containing the status of each check.

## Recent Changes

### Clean Architecture Migration

The module has been migrated to follow the clean architecture pattern:

- **Domain Layer**: Contains the core business entities and repository interfaces
- **Application Layer**: Contains the service interfaces and implementations
- **Infrastructure Layer**: Contains the repository implementations
- **Presentation Layer**: Contains the controllers, DTOs, and mappers

### Test Reorganization

The test structure has been reorganized to mirror the module architecture:

- `__tests__/application/services/diagnostic.service.spec.ts`: Tests for the diagnostic service
- `__tests__/infrastructure/repositories/diagnostic.repository.spec.ts`: Tests for the repository implementation
- `__tests__/presentation/controllers/diagnostic.controller.spec.ts`: Tests for the controller
- `__tests__/presentation/mappers/diagnostic.mapper.spec.ts`: Tests for the mapper

### Device Model Integration

The module now properly integrates with the devices module:

- Uses the `IDevice` and `IDeviceAuth` interfaces from the devices module
- Injects the device repositories from the devices module
- Follows proper dependency injection patterns

## Overview
The Diagnostic Module provides functionality to perform diagnostic checks on connected devices within the Squirrel Servers Manager (SSM) application. It allows administrators to verify connectivity, resource availability, and system health for managed servers.

## Architecture
The Diagnostic Module follows the NestJS component-based design pattern and has been refactored to improve modularity and testability. It consists of:

- **DiagnosticModule**: The main NestJS module that provides the DiagnosticService.
- **DiagnosticService**: The core service that performs diagnostic checks.
- **DiagnosticController**: REST API endpoints for triggering diagnostic operations.
- **EventEmitterService**: Service for emitting diagnostic check events.

## Components

### DiagnosticService
The DiagnosticService is responsible for:
- Executing a sequence of diagnostic checks on target devices
- Verifying SSH connectivity for both Ansible and Docker operations
- Checking Docker socket connectivity
- Monitoring disk space availability
- Retrieving CPU and memory information
- Emitting events for each diagnostic check result

### Diagnostic Checks
The module performs the following diagnostic checks in sequence:
1. **SSH_CONNECT**: Verifies SSH connectivity for Ansible operations
2. **SSH_DOCKER_CONNECT**: Verifies SSH connectivity for Docker operations
3. **DOCKER_SOCKET**: Checks Docker socket connectivity
4. **DISK_SPACE**: Monitors available disk space
5. **CPU_MEMORY_INFO**: Retrieves CPU and memory usage information

### Integration with Event System
The module uses the NestJS event emitter system to publish diagnostic check results:
```typescript
this.eventEmitterService.emit(Events.DIAGNOSTIC_CHECK, {
  success: true,
  severity: 'success',
  module: 'DeviceDiagnostic',
  data: { check },
  message: `✅ Ssh connect check passed on ${sshOptionsAnsible.host}:${sshOptionsAnsible.port}`,
});
```

## Usage
The Diagnostic Module can be used through the REST API:

```typescript
// Trigger diagnostic checks for a device
POST /devices/:uuid/auth/diagnostic
```

## Testing
The Diagnostic Module includes comprehensive unit tests that verify:
- SSH connectivity check functionality
- Docker socket connectivity verification
- Disk space and system resource monitoring
- Event emission for diagnostic results

Tests use Vitest for mocking dependencies such as SSH connections and Docker socket communication.

## Dependencies
- ssh2: For SSH connection handling
- docker-modem: For Docker socket connectivity
- @nestjs/event-emitter: For event management
- ssm-shared-lib: For shared diagnostic enums
