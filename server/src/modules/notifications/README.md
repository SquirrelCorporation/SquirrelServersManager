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
# Notifications Module

## Overview

The Notifications module provides a comprehensive system for managing application notifications within the Squirrel Servers Manager. It allows the application to create, track, and manage notifications for various events, such as automation failures, Docker watch failures, and other system events.

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

### Core Layers

1. **Domain Layer**
   - Contains the core business entities and interfaces
   - Defines the repository interfaces
   - Independent of frameworks and implementation details

2. **Application Layer**
   - Contains the business logic and use cases
   - Depends only on the domain layer
   - Handles event emissions and business rules

3. **Infrastructure Layer**
   - Implements the repository interfaces
   - Contains database schemas and data access logic

4. **Presentation Layer**
   - Contains controllers for handling HTTP requests
   - Depends on the application layer for business logic
   - Handles request/response formatting

### Directory Structure

```
notifications/
├── __tests__/                        # Test files mirroring the module structure
│   ├── application/                  # Application layer tests
│   │   └── services/                 # Service tests
│   └── presentation/                 # Presentation layer tests
│       └── controllers/              # Controller tests
├── domain/                           # Domain layer
│   ├── entities/                     # Domain entities
│   │   └── notification.entity.ts    # Notification entity interface
│   └── repositories/                 # Repository interfaces
│       └── notification-repository.interface.ts
├── application/                      # Application layer
│   └── services/                     # Business logic services
│       ├── notification.service.ts   # Core notification service
│       └── notification-component.service.ts # Event handling service
├── infrastructure/                   # Infrastructure layer
│   ├── repositories/                 # Repository implementations
│   │   └── notification.repository.ts # MongoDB repository implementation
│   └── schemas/                      # Database schemas
│       └── notification.schema.ts    # Mongoose schema for notifications
├── presentation/                     # Presentation layer
│   └── controllers/                  # REST API controllers
│       └── notification.controller.ts # Notification endpoints
├── notifications.module.ts           # NestJS module definition
├── index.ts                          # Public API exports
└── README.md                         # Module documentation
```

## Domain Layer

### Notification Entity

The domain layer defines the core notification entity:

```typescript
export interface Notification {
  id?: string;
  event: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  seen: boolean;
  module: string;
  moduleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Repository Interface

The domain layer also defines the repository interface:

```typescript
export interface INotificationRepository {
  create(notification: Partial<Notification>): Promise<Notification>;
  findAllNotSeen(): Promise<Notification[]>;
  countAllNotSeen(): Promise<number>;
  markAllSeen(): Promise<void>;
}
```

## Application Layer

### NotificationService

The application layer contains the business logic for notifications:

```typescript
@Injectable()
export class NotificationService {
  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async create(notification: Partial<Notification>): Promise<Notification> {
    const created = await this.notificationRepository.create(notification);
    
    // Emit event to notify clients about the new notification
    this.eventEmitter.emit(Events.UPDATED_NOTIFICATIONS, 'Updated Notification');
    
    return created;
  }

  async findAllNotSeen(): Promise<Notification[]> {
    return this.notificationRepository.findAllNotSeen();
  }

  async countAllNotSeen(): Promise<number> {
    return this.notificationRepository.countAllNotSeen();
  }

  async markAllSeen(): Promise<void> {
    await this.notificationRepository.markAllSeen();
    
    // Emit event to notify clients that notifications have been updated
    this.eventEmitter.emit(Events.UPDATED_NOTIFICATIONS, 'Updated Notification');
  }
}
```

### NotificationComponentService

Handles notification events:

```typescript
@Injectable()
export class NotificationComponentService extends EventManager implements OnModuleInit {
  private eventsToListen = [
    Events.AUTOMATION_FAILED,
    Events.DOCKER_STAT_FAILED,
    Events.DOCKER_WATCH_FAILED,
  ];

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  onModuleInit() {
    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    this.eventsToListen.forEach((event) => {
      this.on(event, (payload: Payload) => this.handleNotificationEvent(event, payload));
    });
  }

  private async handleNotificationEvent(event: Events, payload: Payload) {
    // Create notification based on event
    await this.notificationService.create({
      event,
      message: payload.message,
      severity: payload.severity,
      module: payload.module,
      moduleId: payload.moduleId,
      seen: false,
    });
  }
}
```

## Infrastructure Layer

### Notification Schema

The infrastructure layer defines the MongoDB schema:

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
  event!: string;

  @Prop({
    type: String,
    required: true,
    immutable: true,
  })
  module!: string;

  @Prop({
    type: String,
    required: false,
    immutable: true,
  })
  moduleId?: string;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
  })
  seen!: boolean;
}
```

### Repository Implementation

The infrastructure layer implements the repository interface:

```typescript
@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @InjectModel(NOTIFICATION) private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(notification: Partial<Notification>): Promise<Notification> {
    const created = await this.notificationModel.create(notification);
    return created.toObject();
  }

  async findAllNotSeen(): Promise<Notification[]> {
    return this.notificationModel
      .find({ seen: false })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec();
  }

  async countAllNotSeen(): Promise<number> {
    return this.notificationModel.countDocuments({ seen: false }).lean().exec();
  }

  async markAllSeen(): Promise<void> {
    await this.notificationModel.updateMany({ seen: false }, { seen: true }).lean().exec();
  }
}
```

## Presentation Layer

### NotificationController

The presentation layer provides REST API endpoints:

```typescript
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAllNotSeen(): Promise<Notification[]> {
    return this.notificationService.findAllNotSeen();
  }

  @Get('count')
  async countAllNotSeen(): Promise<{ count: number }> {
    const count = await this.notificationService.countAllNotSeen();
    return { count };
  }

  @Post('mark-seen')
  async markAllSeen(): Promise<void> {
    return this.notificationService.markAllSeen();
  }
}
```

## Module Configuration

The module is configured in `notifications.module.ts`:

```typescript
@Module({
  imports: [MongooseModule.forFeature([{ name: NOTIFICATION, schema: NotificationSchema }])],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationComponentService,
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
```

## Event System

The module uses NestJS event emitter for event-driven communication:

- Listens for system events like `AUTOMATION_FAILED`, `DOCKER_STAT_FAILED`, etc.
- Emits `UPDATED_NOTIFICATIONS` event when notifications are updated

## Best Practices

When extending or modifying this module, follow these best practices:

1. **Clean Architecture Principles**
   - Maintain separation of concerns between layers
   - Keep the domain layer independent of frameworks
   - Use dependency injection for loose coupling

2. **Event-Driven Architecture**
   - Use events for cross-module communication
   - Keep event handlers focused and simple
   - Emit events from the service layer, not the repository

3. **Type Safety**
   - Use TypeScript interfaces and types
   - Define proper schemas with decorators

4. **Error Handling**
   - Use try/catch blocks for error handling
   - Log errors with context information

5. **Testing**
   - Write tests for all new functionality
   - Mock external dependencies
   - Test error handling scenarios

## Recent Changes

- Migrated to Clean Architecture
- Implemented event-driven notification system
- Enhanced type safety with TypeScript interfaces
- Improved error handling
- Added comprehensive unit tests
- Removed bridge pattern for direct module usage
