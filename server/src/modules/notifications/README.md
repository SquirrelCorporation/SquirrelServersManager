# Notifications Module

## Overview

The Notifications module provides a comprehensive system for managing application notifications within the Squirrel Servers Manager. It allows the application to create, track, and manage notifications for various events, such as automation failures, Docker watch failures, and other system events.

## Architecture

The module follows NestJS architectural patterns and best practices:

### Core Components

1. **Module Structure**
   - `notifications.module.ts` - NestJS module definition
   - `services/` - Business logic services
   - `controllers/` - REST API controllers
   - `entities/` - Mongoose schemas for MongoDB
   - `__tests__/` - Test files for services and controllers

2. **Services**
   - `notification.service.ts` - Core service for managing notifications
   - `notification-component.service.ts` - Service for handling notification events

3. **Controllers**
   - `notification.controller.ts` - REST API endpoints for notifications

4. **Entities**
   - `notification.entity.ts` - Schema for notification documents

5. **Bridge Classes**
   - `Notification.ts` - Bridge class for backward compatibility

## Notification Entity

The module uses a Mongoose schema to define notifications:

```typescript
@Schema({
  timestamps: true,
  versionKey: false,
  collection: 'notifications',
})
export class Notification {
  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  message!: string;

  @Prop({
    type: String,
    required: true,
    immutable: true,
    enum: ['info', 'warning', 'error'],
  })
  severity!: 'info' | 'warning' | 'error';

  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  event!: Events;

  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  module!: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  seen!: boolean;

  @Prop({
    type: Date,
  })
  createdAt?: Date;

  @Prop({
    type: Date,
  })
  updatedAt?: Date;
}
```

## Service Layer

The service layer implements business logic for notifications:

### NotificationService

Handles core notification operations:

- Creating new notifications
- Finding unseen notifications
- Counting unseen notifications
- Marking notifications as seen

```typescript
@Injectable()
export class NotificationService {
  async create(notification: Partial<Notification>): Promise<Notification> {
    // Create notification and emit event
  }

  async findAllNotSeen(): Promise<Notification[]> {
    // Find all unseen notifications
  }

  async countAllNotSeen(): Promise<number> {
    // Count unseen notifications
  }

  async markAllSeen(): Promise<void> {
    // Mark all notifications as seen
  }
}
```

### NotificationComponentService

Handles notification events:

- Subscribes to system events
- Creates notifications based on events
- Emits notification update events

## Controller Layer

The controller layer provides REST API endpoints:

```typescript
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  @Get()
  async getAllNotifications(): Promise<Notification[]> {
    // Get all unseen notifications
  }

  @Post()
  async markAllSeen(): Promise<void> {
    // Mark all notifications as seen
  }
}
```

## Bridge Pattern

The module implements a bridge pattern for backward compatibility:

```typescript
export default class Notification {
  private static moduleRef: ModuleRef;
  private static service: NotificationService;

  static setModuleRef(moduleRef: ModuleRef): void {
    Notification.moduleRef = moduleRef;
  }

  private static getService(): NotificationService {
    if (!Notification.moduleRef) {
      throw new Error('ModuleRef not set in Notification');
    }
    
    if (!Notification.service) {
      Notification.service = Notification.moduleRef.get(NotificationService, { strict: false });
    }
    
    return Notification.service;
  }

  static async create(notification: Partial<NotificationEntity>): Promise<NotificationEntity> {
    return Notification.getService().create(notification);
  }

  static async findAllNotSeen(): Promise<NotificationEntity[]> {
    return Notification.getService().findAllNotSeen();
  }

  static async countAllNotSeen(): Promise<number> {
    return Notification.getService().countAllNotSeen();
  }

  static async markAllSeen(): Promise<void> {
    return Notification.getService().markAllSeen();
  }
}
```

## Event System

The module uses NestJS event emitter for event-driven communication:

- Listens for system events like `AUTOMATION_FAILED`, `DOCKER_STAT_FAILED`, etc.
- Emits `UPDATED_NOTIFICATIONS` event when notifications are updated

## Testing Strategy

The module includes comprehensive tests:

1. **Controller Tests**
   - Test API endpoints
   - Mock service dependencies
   - Verify correct responses

2. **Service Tests**
   - Test business logic
   - Mock database models and event emitter
   - Verify correct behavior

## Best Practices

When extending or modifying this module, follow these best practices:

1. **Event-Driven Architecture**
   - Use events for cross-module communication
   - Keep event handlers focused and simple

2. **Type Safety**
   - Use TypeScript interfaces and types
   - Define proper schemas with decorators

3. **Error Handling**
   - Use try/catch blocks for error handling
   - Log errors with context information

4. **Testing**
   - Write tests for all new functionality
   - Mock external dependencies
   - Test error handling scenarios

## Recent Changes

- Migrated to NestJS architecture
- Implemented event-driven notification system
- Enhanced type safety with TypeScript interfaces
- Improved error handling
- Added comprehensive unit tests 