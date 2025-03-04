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

### Module Structure

Each module typically follows this structure:

```
module-name/
├── __tests__/                  # Test files
│   ├── controllers/            # Controller tests
│   └── services/               # Service tests
├── controllers/                # REST API controllers
├── dto/                        # Data Transfer Objects
├── services/                   # Business logic services
├── module-name.module.ts       # NestJS module definition
├── index.ts                    # Public API exports
└── README.md                   # Module documentation
```

## Modules Overview

### Recently Refactored Modules

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

Key files:
- `diagnostic/services/diagnostic.service.ts` - Core diagnostic functionality
- `diagnostic/controllers/diagnostic.controller.ts` - REST API endpoints
- `diagnostic/diagnostic.module.ts` - Module definition with event emitter integration

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
- Bridge pattern for backward compatibility

Key files:
- `notifications/services/notification.service.ts` - Core notification management
- `notifications/services/notification-component.service.ts` - Event handling
- `notifications/controllers/notification.controller.ts` - REST API endpoints
- `notifications/entities/notification.entity.ts` - Mongoose schema for notifications

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

### Other Modules

#### Ansible Module
Manages Ansible playbook execution and inventory management.

#### Auth Module
Handles authentication, authorization, and user management.

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
2. **Enhanced Event System**: Improve event-driven communication between modules
3. **Standardized Error Handling**: Implement consistent error handling across modules
4. **API Documentation**: Add OpenAPI/Swagger documentation for all endpoints
5. **Performance Optimization**: Optimize module initialization and execution
