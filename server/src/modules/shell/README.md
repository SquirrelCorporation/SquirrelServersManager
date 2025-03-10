# Shell Module

## Overview
The Shell Module provides a reliable interface for executing shell commands and managing file system operations within the application. It serves as a foundation for various operations including Docker Compose management, file system manipulations, and SSH key management.

## Architecture
The Shell Module follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Contains the core business entities and interfaces.
- **Application Layer**: Contains the application services and interfaces.
- **Infrastructure Layer**: Contains the implementation details and external dependencies.
- **Presentation Layer**: Contains the controllers and DTOs (when applicable).

## Directory Structure
```
shell/
├── __tests__/                  # Test files mirroring the module structure
│   ├── application/            # Application layer tests
│   │   └── services/           # Service tests
│   └── infrastructure/         # Infrastructure layer tests
├── domain/                     # Domain layer (entities, interfaces)
│   └── entities/               # Domain entities
├── application/                # Application layer (use cases)
│   ├── interfaces/             # Service interfaces
│   └── services/               # Business logic services
├── infrastructure/             # Infrastructure layer (implementations)
│   └── shell-wrapper.ts        # Shell command wrapper
├── shell.module.ts             # NestJS module definition
├── index.ts                    # Public API exports
└── README.md                   # Module documentation
```

## Components

### Domain Layer
- **Entities**: Core business entities like `IShellCommand` that represent shell commands in the domain.

### Application Layer
- **Interfaces**: Defines the contracts for services.
  - `IFileSystemService`: Interface for file system operations.
  - `IShellWrapperService`: Interface for shell command operations.
  - `IDockerComposeService`: Interface for Docker Compose operations.
  - `IPlaybookFileService`: Interface for playbook file operations.
  - `ISshKeyService`: Interface for SSH key operations.

- **Services**: Implements the application logic.
  - `FileSystemService`: Handles file and directory operations.
  - `ShellWrapperService`: Provides shell command execution capabilities.
  - `DockerComposeService`: Manages Docker Compose operations.
  - `PlaybookFileService`: Handles operations related to playbook files.
  - `SshKeyService`: Manages SSH key operations.

### Infrastructure Layer
- `ShellWrapper`: Provides direct access to shelljs functions, encapsulating the external library.

## Usage

### NestJS Style Usage
```typescript
// Import the service
import { FileSystemService } from './modules/shell';

// Inject in constructor
constructor(private readonly fileSystemService: FileSystemService) {}

// Use the service
this.fileSystemService.createDirectory('/path/to/dir');
```

## Testing
The Shell Module includes comprehensive unit tests that verify:
- File system operations
- Docker Compose operations
- SSH key management
- Error handling

The test structure mirrors the module structure, following clean architecture principles:
- `__tests__/application/services/`: Tests for application services
- `__tests__/infrastructure/`: Tests for infrastructure components

## Dependencies
- shelljs: Core library for shell operations
- fs-extra: Extended file system operations
- @nestjs/common: NestJS framework

## Migration Notes
This module was migrated from a traditional singleton-based implementation to a clean architecture implementation with proper separation of concerns. The key changes include:

1. **Separation of Concerns**: Clear separation between domain, application, and infrastructure layers.
2. **Interface-based Design**: Services implement interfaces defined in the application layer.
3. **Dependency Injection**: Services are properly injected through NestJS's DI system.
4. **Testability**: Improved test structure that mirrors the module structure.
5. **Removal of Bridge Classes**: Eliminated unnecessary abstraction layers.
