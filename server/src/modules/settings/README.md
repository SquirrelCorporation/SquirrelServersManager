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
# Settings Module

The Settings module is a comprehensive NestJS implementation that manages application-wide configurations, system information, and advanced operations within the Squirrel Servers Manager. It provides a centralized way to handle settings, monitor system metrics, and perform maintenance operations.

## Features

- **Configuration Management**
  - Key-value based settings storage
  - Default values initialization
  - Type-safe settings retrieval
  - TTL support for temporary settings
  - Validation for setting updates

- **System Information**
  - MongoDB server statistics
  - Redis server metrics
  - Prometheus metrics collection
  - Real-time performance monitoring

- **Advanced Operations**
  - Server restart capability
  - Log management (server and Ansible)
  - Playbook model management
  - System maintenance tools

- **Dashboard Settings**
  - Performance thresholds configuration
  - Resource utilization metrics
  - Display preferences

- **Device Management**
  - Device offline detection settings
  - Device statistics retention
  - Connection monitoring

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

### Domain Layer
- **Entities**
  - `ISetting`: Core setting entity definition
  - Setting validation interfaces
  - Type definitions for settings

- **Interfaces**
  - `ISettingsService`: Core settings management contract
  - `IInformationService`: System information retrieval contract
  - `IAdvancedOperationsService`: Advanced operations contract

- **Repositories**
  - `ISettingRepository`: Data access abstraction

### Application Layer
- **Services**
  - `SettingsService`: Core settings management
  - `InformationService`: System metrics collection
  - `AdvancedOperationsService`: System maintenance operations

### Infrastructure Layer
- **Repositories**
  - `SettingRepository`: Settings persistence implementation
  - Integration with MongoDB
  - Integration with Redis cache

### Presentation Layer
- **Controllers**
  - REST endpoints for settings management
  - System information retrieval
  - Advanced operations execution

## API Endpoints

### Settings Management

#### Dashboard Settings
```typescript
POST /settings/dashboard/:key
// Update dashboard-related settings (CPU/Memory thresholds)
```

#### Device Settings
```typescript
POST /settings/devices/:key
// Update device-related settings (offline detection, etc.)
```

#### Logs Settings
```typescript
POST /settings/logs/:key
// Update log-related settings (retention, cleanup)
```

#### Device Stats Settings
```typescript
POST /settings/device-stats/:key
// Update device statistics settings (retention period)
```

#### Master Node Configuration
```typescript
POST /settings/keys/master-node-url
// Update master node URL configuration
```

### System Information

#### MongoDB Stats
```typescript
GET /settings/mongodb-stats
// Retrieve MongoDB server statistics
```

#### Redis Stats
```typescript
GET /settings/redis-stats
// Retrieve Redis server metrics
```

#### Prometheus Stats
```typescript
GET /settings/prometheus-stats
// Retrieve Prometheus metrics
```

### Advanced Operations

#### Server Management
```typescript
POST /settings/advanced/restart
// Initiate server restart
```

#### Log Management
```typescript
DELETE /settings/advanced/logs
// Purge server logs
DELETE /settings/advanced/ansible-logs
// Purge Ansible logs
```

#### Playbook Management
```typescript
DELETE /settings/advanced/playbooks
// Delete and resync playbooks model
```

## Default Settings

The module initializes with sensible defaults for critical settings:

- Scheme Version
- Server Log Retention Period
- Device Offline Detection Threshold
- Performance Thresholds (CPU/Memory)
- Statistics Retention Periods
- Ansible Task Cleanup Intervals

## Integration

Import the module into your NestJS application:

```typescript
import { SettingsModule } from './modules/settings';

@Module({
  imports: [SettingsModule],
})
export class AppModule {}
```

## Recent Changes

- Added system information collection capabilities
- Enhanced settings validation
- Improved error handling and logging
- Added support for TTL-based settings
- Implemented advanced operations for system maintenance

## Future Improvements

- Real-time settings updates via WebSocket
- Enhanced validation rules
- Setting categories and grouping
- Backup and restore functionality
- Setting change audit logging
- UI-based configuration management 