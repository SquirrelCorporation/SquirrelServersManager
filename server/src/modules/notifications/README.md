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
# Notifications Module

The Notifications module is a NestJS implementation that provides real-time notification capabilities within the Squirrel Servers Manager. It manages system notifications, user alerts, and real-time updates using WebSocket technology.

## Features

- **Real-time Notifications**
  - WebSocket-based delivery
  - Instant updates
  - Client subscription management
  - Connection state handling
  - Broadcast capabilities

- **Notification Management**
  - Create notifications
  - Track notification status
  - Mark notifications as seen
  - Notification persistence
  - Notification querying

- **Component Integration**
  - System event handling
  - Component-specific notifications
  - Event aggregation
  - Priority management
  - Custom notification types

- **Status Tracking**
  - Seen/unseen status
  - Notification counts
  - Batch operations
  - Status updates
  - History tracking

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

### Domain Layer
- **Entities**
  - `Notification`: Core notification entity
    - Message content
    - Status tracking
    - Timestamp information
    - Component metadata

- **Interfaces**
  - `INotificationService`: Core notification management
    - Create notifications
    - Find unseen notifications
    - Count notifications
    - Mark notifications as seen

  - `INotificationComponentService`: Component integration
    - Component-specific notifications
    - Event handling
    - Status management

### Application Layer
- **Services**
  - `NotificationService`: Core notification management
    - Notification creation
    - Status tracking
    - Query operations
    - Batch operations

  - `NotificationComponentService`: Component integration
    - Event handling
    - Component notifications
    - Status updates
    - Priority management

### Infrastructure Layer
- **Repositories**
  - `NotificationRepository`: Notification persistence
  - MongoDB integration
  - Data mapping
  - Query operations

- **Schemas**
  - `NotificationSchema`: MongoDB schema
    - Message structure
    - Status fields
    - Timestamps
    - Indexes

### Presentation Layer
- **Controllers**
  - REST endpoints for notification management
  - Status queries
  - Batch operations

- **Gateways**
  - `NotificationsGateway`: WebSocket handling
    - Real-time updates
    - Client subscriptions
    - Event broadcasting
    - Connection management

## API Endpoints

### Notification Management
```typescript
POST /notifications
// Create a new notification
// Body: {
//   message: string,
//   component: string,
//   type: string
// }

GET /notifications/unseen
// Retrieve all unseen notifications
// Returns: Notification[]

GET /notifications/count
// Get count of unseen notifications
// Returns: { count: number }

POST /notifications/mark-seen
// Mark all notifications as seen
```

### WebSocket Events
```typescript
// Client-side connection
socket.connect('/notifications')

// Server events
'notification.created' // New notification
'notification.updated' // Status update
'notification.seen'    // Seen status change
```

## Integration

Import the module into your NestJS application:

```typescript
import { NotificationsModule } from './modules/notifications';

@Module({
  imports: [NotificationsModule],
})
export class AppModule {}
```

Example usage in a service:

```typescript
@Injectable()
export class YourService {
  constructor(private notificationService: NotificationService) {}

  async someOperation() {
    await this.notificationService.create({
      message: 'Operation completed',
      component: 'YourComponent',
      type: 'success'
    });
  }
}
```

## Recent Changes

- Added WebSocket support for real-time updates
- Enhanced notification persistence
- Improved component integration
- Added batch operations
- Enhanced status tracking
- Optimized query performance

## Future Improvements

- Notification categories
- Custom notification templates
- Rich media support
- Notification expiration
- Priority queues
- Notification archiving