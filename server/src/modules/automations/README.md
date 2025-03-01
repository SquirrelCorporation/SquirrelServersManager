# Automations Module

## Overview

The Automations module provides a flexible and extensible system for creating, managing, and executing automated tasks within the Squirrel Servers Manager application. It allows users to define automation workflows triggered by various events (time-based, system events, etc.) that perform actions on server resources (containers, volumes, playbooks, etc.).

## Architecture

The module follows NestJS architectural patterns and best practices:

### Core Components

1. **Module Structure**
   - `automations.module.ts` - NestJS module definition
   - `automations.controller.ts` - REST API endpoints
   - `automations.service.ts` - Business logic and data access
   - `automation-engine.service.ts` - Core automation execution engine

2. **Data Layer**
   - `schemas/` - Mongoose schemas for MongoDB
   - `dto/` - Data Transfer Objects for API requests/responses

3. **Component System**
   - `components/automation.component.ts` - Base component class
   - `components/triggers/` - Event trigger components
   - `components/actions/` - Action execution components

4. **Testing**
   - `tests/` - Organized test files mirroring the module structure

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
  providers: [AutomationsService, AutomationEngine],
  exports: [AutomationsService, AutomationEngine],
})
export class AutomationsModule {}
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
   - Tests are organized in a dedicated `tests/` directory
   - The test directory structure mirrors the module structure

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

1. **Separation of Concerns**
   - Keep controllers focused on request/response handling
   - Keep services focused on business logic
   - Keep components focused on specific functionality

2. **Error Handling**
   - Use try/catch blocks for error handling
   - Return appropriate HTTP status codes
   - Log errors with context information

3. **Testing**
   - Write tests for all new functionality
   - Maintain test organization in the `tests/` directory
   - Mock external dependencies

4. **Documentation**
   - Document public APIs and interfaces
   - Keep this README updated with new components
   - Add comments for complex logic

## Module Template

This module serves as a template for creating new modules in the Squirrel Servers Manager application. When creating a new module:

1. Create a similar directory structure
2. Implement the core NestJS components (module, controller, service)
3. Define schemas and DTOs
4. Organize tests in a dedicated directory
5. Create a README.md file based on this template

## Future Enhancements

Potential areas for enhancement:

- Additional trigger types (webhooks, system events, etc.)
- Additional action types (email notifications, API calls, etc.)
- Improved error handling and recovery mechanisms
- Enhanced logging and monitoring
- User permissions and access control

## Recent Changes

- Migrated to NestJS event emitter system for improved event handling
- Fixed validation for automation data in the registration process
- Enhanced error handling during automation execution
- Improved test coverage for trigger and action components
- Added TypeScript strict property initialization for DTOs
- Implemented proper error handling for automation chain execution
