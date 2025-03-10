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
# Automations Module

## Overview

The Automations module provides a flexible and extensible system for creating, managing, and executing automated tasks within the Squirrel Servers Manager application. It allows users to define automation workflows triggered by various events (time-based, system events, etc.) that perform actions on server resources (containers, volumes, playbooks, etc.).

## Architecture

The module follows the Clean Architecture pattern with clear separation of concerns:

### Layer Structure

1. **Domain Layer**
   - `domain/entities/` - Core business entities
   - `domain/repositories/` - Repository interfaces
   - `domain/components/` - Domain-specific components

2. **Application Layer**
   - `application/services/` - Business logic and use cases

3. **Infrastructure Layer**
   - `infrastructure/schemas/` - Mongoose schemas for MongoDB
   - `infrastructure/repositories/` - Repository implementations

4. **Presentation Layer**
   - `presentation/controllers/` - REST API endpoints
   - `presentation/dtos/` - Data Transfer Objects for API requests/responses
   - `presentation/interfaces/` - Presentation-specific interfaces
   - `presentation/utils/` - Utility functions for the presentation layer

5. **Module Definition**
   - `automations.module.ts` - NestJS module definition
   - `index.ts` - Public API exports

### Core Components

1. **Domain Components**
   - `AutomationComponent` - Base component class
   - `AbstractTriggerComponent` - Base class for all trigger components
   - `AbstractActionComponent` - Base class for all action components

2. **Application Services**
   - `AutomationsService` - Business logic for automation management
   - `AutomationEngine` - Core automation execution engine

3. **Infrastructure Components**
   - `AutomationRepository` - MongoDB repository implementation
   - `AutomationSchema` - Mongoose schema for MongoDB

4. **Presentation Components**
   - `AutomationsController` - REST API endpoints
   - `CreateAutomationDto` - DTO for creating automations
   - `UpdateAutomationDto` - DTO for updating automations

## Component System

The Automations module uses a component-based architecture:

### Base Components

- **AutomationComponent**: Base class for all automation components
- **AbstractTriggerComponent**: Base class for all trigger components
- **AbstractActionComponent**: Base class for all action components

### Trigger Components

Triggers determine when an automation should run:

- **CronTriggerComponent**: Time-based triggers using cron expressions
- **EventTriggerComponent**: Event-based triggers for system events

### Action Components

Actions define what operations to perform:

- **DockerActionComponent**: Manages Docker container operations
- **DockerVolumeActionComponent**: Handles Docker volume operations
- **PlaybookActionComponent**: Executes Ansible playbooks
- **NotificationActionComponent**: Sends notifications

## Implementation Details

### Dependency Injection

The module uses NestJS dependency injection for services and components:

```typescript
@Module({
  imports: [MongooseModule.forFeature([{ name: Automation.name, schema: AutomationSchema }])],
  controllers: [AutomationsController],
  providers: [AutomationsService, AutomationEngine, AutomationRepository],
  exports: [AutomationsService, AutomationEngine],
})
export class AutomationsModule {}
```

### Repository Pattern

The module implements the repository pattern for data access:

```typescript
export interface IAutomationRepository {
  findAll(): Promise<Automation[]>;
  findAllEnabled(): Promise<Automation[]>;
  findOne(uuid: string): Promise<Automation | null>;
  findByUuid(uuid: string): Promise<Automation | null>;
  create(automation: Automation): Promise<Automation>;
  update(uuid: string, automation: Partial<Automation>): Promise<Automation | null>;
  delete(uuid: string): Promise<void>;
  setLastExecutionStatus(uuid: string, status: 'success' | 'failed'): Promise<void>;
}
```

### Event-Driven Architecture

The module uses the NestJS event emitter system for communication between components:

```typescript
// Publishing events
this.eventEmitterService.emit(AUTOMATION_EVENTS.AUTOMATION_COMPLETED, { uuid: this.automationUuid });

// Subscribing to events
@OnEvent(AUTOMATION_EVENTS.AUTOMATION_COMPLETED)
handleAutomationCompleted(payload: any) {
  // Handle the event
}
```

### Extensibility

New trigger types and action types can be added by extending the base component classes:

```typescript
export class NewTriggerComponent extends AbstractTriggerComponent {
  // Implement required methods
}

export class NewActionComponent extends AbstractActionComponent {
  // Implement required methods
}
```

## Testing Strategy

The module follows a comprehensive testing strategy:

1. **Directory Structure**
   - Tests are organized in a dedicated `__tests__/` directory
   - The test directory structure mirrors the module structure:
     - `__tests__/domain/` - Tests for domain layer
     - `__tests__/application/` - Tests for application layer
     - `__tests__/infrastructure/` - Tests for infrastructure layer
     - `__tests__/presentation/` - Tests for presentation layer

2. **Test Types**
   - Unit tests for individual components
   - Integration tests for service interactions
   - Module tests for dependency verification

3. **Mocking Approach**
   - External dependencies are mocked using Vitest's mocking capabilities
   - Database repositories are mocked to avoid actual database operations

4. **Test File Naming**
   - Test files use the `.spec.ts` extension
   - Test files are named after the file they test

## API Endpoints

The module exposes the following REST API endpoints:

- `GET /automations` - List all automations
- `GET /automations/:id` - Get a specific automation
- `POST /automations` - Create a new automation
- `PATCH /automations/:id` - Update an automation
- `DELETE /automations/:id` - Delete an automation
- `POST /automations/:id/execute` - Manually execute an automation

## Best Practices

When extending or modifying this module, follow these best practices:

1. **Clean Architecture Principles**
   - Keep domain logic independent of frameworks
   - Ensure dependencies point inward (domain ← application ← infrastructure/presentation)
   - Use interfaces for dependency inversion

2. **Separation of Concerns**
   - Keep controllers focused on request/response handling
   - Keep services focused on business logic
   - Keep repositories focused on data access
   - Keep entities focused on domain rules

3. **Error Handling**
   - Use try/catch blocks for error handling
   - Return appropriate HTTP status codes
   - Log errors with context information

4. **Testing**
   - Write tests for all new functionality
   - Maintain test organization in the `__tests__/` directory
   - Mock external dependencies

5. **Documentation**
   - Document public APIs and interfaces
   - Keep this README updated with new components
   - Add comments for complex logic

## Module Template

This module serves as a template for creating new Clean Architecture modules in the Squirrel Servers Manager application. When creating a new module:

1. Create a similar layer structure (domain, application, infrastructure, presentation)
2. Implement the core components for each layer
3. Define entities, interfaces, schemas, and DTOs
4. Organize tests to mirror the module structure
5. Create a README.md file based on this template

## Future Enhancements

Potential areas for enhancement:

- Additional trigger types (webhooks, system events, etc.)
- Additional action types (email notifications, API calls, etc.)
- Improved error handling and recovery mechanisms
- Enhanced logging and monitoring
- User permissions and access control
- Stronger typing for automation chains

## Recent Changes

- Refactored to follow Clean Architecture principles
- Implemented proper repository pattern with interfaces
- Separated domain entities from database schemas
- Organized code into appropriate layers
- Improved test organization to mirror module structure
- Enhanced error handling during automation execution
- Implemented proper error handling for automation chain execution
