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
# Devices Module

The Devices module is responsible for managing device information, connectivity, and status within the Squirrel Servers Manager application. It provides a comprehensive set of features for device management, including CRUD operations, connectivity testing, and status monitoring.

## Features

- Device registration and management
- Device connectivity testing
- Device status monitoring
- Device group management
- Device authentication management
- Device metadata management
- Device search and filtering

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer
- **Entities**: Defines the core business entities like `Device`, `DeviceGroup`, and `DeviceAuth`
- **Repository Interfaces**: Defines interfaces for data access like `IDeviceRepository`
- **Value Objects**: Defines immutable value objects used by the domain entities

### Application Layer
- **Service Interfaces**: Defines interfaces for business logic like `IDeviceService`
- **Services**: Implements the business logic for device management
- **Use Cases**: Implements specific use cases for device operations

### Infrastructure Layer
- **Repositories**: Implements the repository interfaces for data access
- **Schemas**: Defines the database schemas for device data
- **Mappers**: Maps between domain entities and database schemas

### Presentation Layer
- **Controllers**: Handles HTTP requests and responses
- **DTOs**: Defines the data transfer objects for request/response validation
- **Mappers**: Maps between domain entities and DTOs

## API Endpoints

### GET /devices
Returns a list of all devices.

### GET /devices/:id
Returns a specific device by ID.

### POST /devices
Creates a new device.

### PUT /devices/:id
Updates an existing device.

### DELETE /devices/:id
Deletes a device.

### GET /devices/groups
Returns a list of all device groups.

### POST /devices/test-connection
Tests the connection to a device.

## Data Models

### Device
```typescript
interface Device {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  description?: string;
  groupId?: string;
  status: DeviceStatus;
  lastSeen?: Date;
  metadata?: Record<string, any>;
}
```

### DeviceGroup
```typescript
interface DeviceGroup {
  id: string;
  name: string;
  description?: string;
  devices?: string[]; // Device IDs
}
```

### DeviceAuth
```typescript
interface DeviceAuth {
  id: string;
  deviceId: string;
  username: string;
  authType: 'password' | 'privateKey';
  authData: string; // Encrypted password or private key
}
```

## Usage

To use the Devices module, import it into your NestJS application:

```typescript
import { DevicesModule } from './modules/devices';

@Module({
  imports: [
    // ... other modules
    DevicesModule,
  ],
})
export class AppModule {}
```

## Testing

The module includes comprehensive tests that mirror the module structure:

- **Domain Layer Tests**: Tests for domain entities and value objects
- **Application Layer Tests**: Tests for services and use cases
- **Infrastructure Layer Tests**: Tests for repositories and mappers
- **Presentation Layer Tests**: Tests for controllers and DTOs

## Future Improvements

- Add support for device templates
- Implement device auto-discovery
- Add support for device metrics collection
- Improve device grouping and tagging
- Add support for device provisioning 