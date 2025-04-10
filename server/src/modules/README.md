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
# Squirrel Servers Manager Modules

## Overview

This directory contains the modular components of the Squirrel Servers Manager (SSM) application. Each module is designed to encapsulate a specific domain of functionality, following NestJS architectural patterns and best practices.

## Architecture

The SSM application follows a modular architecture based on NestJS principles:

### Core Principles

1. **Modularity**: Each module is self-contained with its own controllers, services, and components.
2. **Dependency Injection**: NestJS's DI system is used for managing dependencies between modules.
3. **Event-Driven Communication**: Modules communicate using the NestJS event emitter system.
4. **Repository Pattern**: Data access is abstracted through repositories.
5. **Testing**: Each module includes comprehensive unit and integration tests.
6. **Clean Architecture**: Many modules now follow clean architecture principles with proper separation of concerns.
7. **Consistent Dependency Injection for Singletons**: To ensure services intended as singletons (like engine services managing state) are instantiated only once across the module or application, **always provide and inject them consistently**. Prefer using injection tokens (`@Inject(TOKEN)`) over direct class injection (`service: ClassName`). Providing a service both by class and by token within the same module, and then injecting it differently in various consumers (e.g., injecting by token in controllers and by class in services), can lead to multiple instances being created by the DI container, causing unexpected behavior and state inconsistencies. This was observed with `PlaybooksRegisterEngineService` where inconsistent provision and injection resulted in multiple instances.

### Module Structure

Each module typically follows this structure:

```
module-name/
├── __tests__/                  # Test files mirroring the module structure
│   ├── application/            # Application layer tests
│   ├── infrastructure/         # Infrastructure layer tests
│   └── presentation/           # Presentation layer tests
├── domain/                     # Domain layer (entities, interfaces)
│   ├── entities/               # Domain entities
│   └── repositories/           # Repository interfaces
├── application/                # Application layer (use cases)
│   ├── interfaces/             # Service interfaces
│   └── services/               # Business logic services
├── infrastructure/             # Infrastructure layer (implementations)
│   ├── repositories/           # Repository implementations
│   ├── schemas/                # Database schemas
│   └── mappers/                # Mappers between entities and schemas
├── presentation/               # Presentation layer (controllers)
│   ├── controllers/            # HTTP controllers
│   ├── dtos/                   # Data Transfer Objects
│   └── mappers/                # Mappers between entities and DTOs
├── module-name.module.ts       # NestJS module definition
├── index.ts                    # Public API exports
└── README.md                   # Module documentation
```

### Modules Using Clean Architecture

The following modules have been refactored to follow the Clean Architecture pattern:

1. **Devices Module**: Manages device information and connectivity
2. **Logs Module**: Manages server logs and Ansible task execution logs
3. **Notifications Module**: Manages system notifications for various events
4. **Ansible Vault Module**: Manages encrypted Ansible vault files
5. **Shell Module**: Provides shell command execution and file system operations
6. **Smart Failure Module**: Analyzes Ansible logs for common failure patterns
7. **Users Module**: Manages user accounts, authentication, and authorization
8. **SFTP Module**: Provides secure file transfer functionality for remote devices
9. **SSH Module**: Provides secure shell connectivity to remote devices

## Modules Overview

### Recently Refactored Modules

#### SSH Module

The SSH Module provides secure shell connectivity to remote devices:
- Secure SSH connections to remote devices
- Interactive terminal sessions
- Session management for multiple clients
- Terminal resizing
- WebSocket-based real-time communication
- Clean Architecture implementation with proper separation of concerns

Key files:
- `ssh/domain/entities/ssh.entity.ts` - Core domain entities
- `ssh/domain/repositories/ssh-repository.interface.ts` - Repository interface
- `ssh/application/services/ssh-connection.service.ts` - SSH connection service
- `ssh/application/services/ssh-terminal.service.ts` - Terminal operations service
- `ssh/presentation/gateways/ssh.gateway.ts` - WebSocket gateway

#### SFTP Module

The SFTP Module provides secure file transfer functionality for remote devices:
- Secure SFTP connections to remote devices
- Directory browsing and navigation
- File upload and download
- File and directory management (create, rename, delete, chmod)
- WebSocket-based real-time communication
- Clean Architecture implementation with proper separation of concerns

Key files:
- `sftp/domain/entities/sftp.entity.ts` - Core domain entities
- `sftp/domain/repositories/sftp-repository.interface.ts` - Repository interface
- `sftp/application/services/sftp.service.ts` - Core SFTP operations
- `sftp/infrastructure/services/file-stream.service.ts` - File streaming service
- `sftp/presentation/gateways/sftp.gateway.ts` - WebSocket gateway

#### Shell Module

The Shell Module provides a reliable interface for executing shell commands and managing file system operations:
- File system operations (create, delete, read, write)
- Docker Compose command execution
- SSH key management
- Clean Architecture implementation with proper separation of concerns

Key files:
- `shell/application/services/file-system.service.ts` - File system operations
- `shell/application/services/shell-wrapper.service.ts` - Shell command execution
- `shell/application/interfaces/file-system.interface.ts` - File system service interface
- `shell/infrastructure/shell-wrapper.ts` - Shell command wrapper

#### Smart Failure Module

The Smart Failure Module analyzes Ansible logs to identify common failure patterns and provides helpful error messages and resolution steps:
- Analyzes Ansible logs for common failure patterns
- Provides detailed error messages and resolution steps
- Securely authenticates requests using JWT
- Clean Architecture implementation with proper separation of concerns

Key files:
- `smart-failure/application/services/smart-failure.service.ts` - Core log analysis
- `smart-failure/domain/constants.ts` - Failure pattern definitions
- `smart-failure/infrastructure/repositories/ansible-logs.repository.ts` - Repository implementation
- `smart-failure/presentation/controllers/smart-failure.controller.ts` - REST API endpoints

#### Ansible Config Module

The Ansible Config Module provides functionality for managing Ansible configuration files:
- CRUD operations for Ansible configuration entries
- Secure configuration file parsing and writing
- Validation of configuration entries
- Clean Architecture implementation with proper separation of concerns

Key files:
- `ansible-config/application/services/ansible-config.service.ts` - Core configuration management
- `ansible-config/presentation/controllers/ansible-config.controller.ts` - REST API endpoints
- `ansible-config/presentation/dtos/ansible-config.dto.ts` - Data Transfer Objects
- `ansible-config/presentation/interfaces/config.interface.ts` - Configuration interfaces

#### Logs Module

The Logs Module manages server logs and Ansible task execution logs:
- Server activity log management
- Ansible task execution log tracking
- Log retention and cleanup
- Repository pattern implementation for data access

Key files:
- `logs/services/server-logs.service.ts` - Server log management
- `logs/services/task-logs.service.ts` - Ansible task log management
- `logs/repositories/` - Repository implementations for data access
- `logs/schemas/` - Mongoose schemas for log data

#### Diagnostic Module

The Diagnostic Module performs health checks on connected devices:
- SSH connectivity verification
- Docker socket connectivity testing
- Disk space monitoring
- CPU and memory information retrieval
- Clean Architecture implementation with proper separation of concerns

Key files:
- `diagnostic/domain/entities/diagnostic.entity.ts` - Core domain entities
- `diagnostic/application/services/diagnostic.service.ts` - Core diagnostic functionality
- `diagnostic/presentation/controllers/diagnostic.controller.ts` - REST API endpoints
- `diagnostic/infrastructure/repositories/diagnostic.repository.ts` - Repository implementation
- `diagnostic/diagnostic.module.ts` - Module definition with event emitter integration

The Diagnostic Module has been refactored to follow the Clean Architecture pattern:
- **Domain Layer**: Contains the core business entities and repository interfaces
- **Application Layer**: Contains the service interfaces and implementations
- **Infrastructure Layer**: Contains the repository implementations
- **Presentation Layer**: Contains the controllers, DTOs, and mappers

The test structure mirrors the module architecture:
- `diagnostic/__tests__/domain/` - Tests for domain entities
- `diagnostic/__tests__/application/` - Tests for application services
- `diagnostic/__tests__/infrastructure/` - Tests for infrastructure repositories
- `diagnostic/__tests__/presentation/` - Tests for controllers and mappers

#### Devices Module

The Devices Module manages device information, connectivity, and status:
- Device registration and management
- Device connectivity testing
- Device status monitoring
- Device group management
- Clean Architecture implementation with proper separation of concerns

Key files:
- `devices/domain/entities/device.entity.ts` - Core domain entity interface
- `devices/domain/repositories/device-repository.interface.ts` - Repository interface
- `devices/application/services/device.service.ts` - Core device management
- `devices/infrastructure/repositories/device.repository.ts` - Repository implementation
- `devices/infrastructure/schemas/device.schema.ts` - Mongoose schema
- `devices/presentation/controllers/device.controller.ts` - REST API endpoints

The Devices Module has been refactored to follow the Clean Architecture pattern:
- **Domain Layer**: Contains the core business entities and repository interfaces
- **Application Layer**: Contains the service implementations with business logic
- **Infrastructure Layer**: Contains the repository implementations and database schemas
- **Presentation Layer**: Contains the controllers for handling HTTP requests

The test structure mirrors the module architecture:
- `devices/__tests__/domain/` - Tests for domain entities
- `devices/__tests__/application/` - Tests for application services
- `devices/__tests__/infrastructure/` - Tests for infrastructure repositories
- `devices/__tests__/presentation/` - Tests for controllers and DTOs

#### Update Module

The Update Module manages application version checking and updates:
- Fetches the latest version from GitHub
- Compares local and remote versions
- Notifies users of available updates

Key files:
- `update/services/update.service.ts` - Version checking logic
- `update/update.module.ts` - Module definition with scheduling

#### Automations Module

The Automations Module provides a system for creating and executing automated tasks:
- Time-based and event-based triggers
- Action execution for Docker containers, volumes, and playbooks
- Automation chain execution

Key files:
- `automations/services/automations.service.ts` - Automation management
- `automations/components/` - Trigger and action components
- `automations/automation-engine.service.ts` - Execution engine

#### Notifications Module

The Notifications Module manages system notifications for various events:
- Creation and tracking of notifications for system events
- Notification status management (seen/unseen)
- Event-driven notification generation
- Clean Architecture implementation with proper separation of concerns

Key files:
- `notifications/domain/entities/notification.entity.ts` - Core domain entity interface
- `notifications/domain/repositories/notification-repository.interface.ts` - Repository interface
- `notifications/application/services/notification.service.ts` - Core notification management
- `notifications/application/services/notification-component.service.ts` - Event handling
- `notifications/infrastructure/repositories/notification.repository.ts` - Repository implementation
- `notifications/infrastructure/schemas/notification.schema.ts` - Mongoose schema
- `notifications/presentation/controllers/notification.controller.ts` - REST API endpoints

The Notifications Module has been refactored to follow the Clean Architecture pattern:
- **Domain Layer**: Contains the core business entities and repository interfaces
- **Application Layer**: Contains the service implementations with business logic and event emissions
- **Infrastructure Layer**: Contains the repository implementations and database schemas
- **Presentation Layer**: Contains the controllers for handling HTTP requests

The test structure mirrors the module architecture:
- `notifications/__tests__/application/` - Tests for application services
- `notifications/__tests__/presentation/` - Tests for controllers

#### Users Module

The Users Module manages user accounts, authentication, and authorization:
- User registration and management
- User authentication
- Role-based access control
- User profile management
- Clean Architecture implementation with proper separation of concerns

Key files:
- `users/domain/entities/user.entity.ts` - Core domain entity interface
- `users/domain/repositories/user-repository.interface.ts` - Repository interface
- `users/application/services/user.service.ts` - Core user management
- `users/infrastructure/repositories/user.repository.ts` - Repository implementation
- `users/infrastructure/schemas/user.schema.ts` - Mongoose schema
- `users/presentation/controllers/user.controller.ts` - REST API endpoints

The Users Module has been refactored to follow the Clean Architecture pattern:
- **Domain Layer**: Contains the core business entities and repository interfaces
- **Application Layer**: Contains the service implementations with business logic
- **Infrastructure Layer**: Contains the repository implementations and database schemas
- **Presentation Layer**: Contains the controllers for handling HTTP requests

#### Repository Module

The Repository Module manages Git and local playbook repositories:
- Git repository management (clone, pull, commit, push)
- Local repository management
- Playbook and directory operations
- Repository tree generation and manipulation
- Bridge pattern for backward compatibility

Key files:
- `repository/services/playbooks-repository.service.ts` - Core repository management
- `repository/services/git-playbooks-repository.service.ts` - Git repository operations
- `repository/services/local-playbooks-repository.service.ts` - Local repository operations
- `repository/controllers/playbooks-repository.controller.ts` - REST API endpoints
- `repository/PlaybooksRepository.ts` - Bridge class for backward compatibility

#### Ansible Module

The Ansible Module manages Ansible playbook execution and inventory management:
- Execute Ansible commands and playbooks
- Transform inventory files
- Manage extra variables
- Track Ansible task execution
- Clean Architecture implementation with proper separation of concerns

Key files:
- `ansible/application/services/ansible-command-builder.service.ts` - Command building
- `ansible/domain/entities/` - Domain entities for Ansible operations
- `ansible/presentation/controllers/` - REST API endpoints
- `ansible/infrastructure/repositories/` - Repository implementations

### Other Modules

#### Auth Module
Handles authentication, authorization, and user management.

#### Container Stacks Module
Manages container stack repositories, including Git-based repositories for container stack definitions, with support for cloning, syncing, and updating repositories.

#### Containers Module
Manages Docker containers, images, and volumes.

#### Logs Module
Provides comprehensive logging for server activities and Ansible task executions. Implements the repository pattern for data access and includes type-safe schemas and interfaces.

#### SSH Module
Provides SSH connectivity and terminal functionality.

#### Remote System Information Module
Collects and processes system information from remote devices.

#### Shell Module
Manages shell command execution on remote systems.

#### Repository Module
Handles Git repository operations for playbooks and configurations.

## NestJS Integration

The refactored modules follow NestJS patterns:

### Module Registration

Modules are registered in the application's main module (`app.module.ts`):

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      // Database configuration
    }),
    AuthModule,
    AutomationsModule,
    DiagnosticModule,
    UpdateModule,
    NotificationsModule,
    RepositoryModule,
    // Other modules
  ],
})
export class AppModule {}
```

### Dependency Injection

Services are registered as providers in their respective modules:

```typescript
@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Event emitter configuration
    }),
  ],
  controllers: [DiagnosticController],
  providers: [DiagnosticService, EventEmitterService],
  exports: [DiagnosticService],
})
export class DiagnosticModule {}
```

### Event System

Modules use the NestJS event emitter for inter-module communication:

```typescript
// Publishing events
this.eventEmitterService.emit(Events.DIAGNOSTIC_CHECK, {
  success: true,
  severity: 'success',
  module: 'DeviceDiagnostic',
  data: { check },
  message: `✅ Check passed`,
});

// Subscribing to events
@OnEvent(Events.DIAGNOSTIC_CHECK)
handleDiagnosticCheck(payload: any) {
  // Handle the event
}
```

## Testing

All modules include comprehensive tests:

### Test Types

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Test complete workflows

### Testing Tools

- **Vitest**: Primary testing framework
- **@nestjs/testing**: NestJS testing utilities
- **vi.mock()**: For mocking dependencies

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific module tests
npm test -- src/modules/diagnostic
```

## Best Practices

When working with these modules:

1. **Maintain Modularity**: Keep modules focused on specific domains
2. **Follow NestJS Patterns**: Use NestJS decorators and dependency injection
3. **Event-Driven Communication**: Use the event system for cross-module communication
4. **Comprehensive Testing**: Maintain test coverage for all functionality
5. **Documentation**: Keep README files updated with architectural changes

## Migration Strategy

The application is being gradually migrated from a legacy architecture to NestJS:

1. **Phase 1**: Refactor core modules (Diagnostic, Update, Automations)
2. **Phase 2**: Refactor remaining modules
3. **Phase 3**: Migrate legacy code to use NestJS patterns

## Future Enhancements

Planned improvements for the modular architecture:

1. **Complete NestJS Migration**: Fully migrate all modules to NestJS patterns
2. **Clean Architecture Adoption**: Continue refactoring modules to follow the Clean Architecture pattern
3. **Enhanced Event System**: Improve event-driven communication between modules
4. **Standardized Error Handling**: Implement consistent error handling across modules
5. **API Documentation**: Add OpenAPI/Swagger documentation for all endpoints
6. **Performance Optimization**: Optimize module initialization and execution
