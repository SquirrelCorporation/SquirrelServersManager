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
# Logs Module

The Logs module is a NestJS implementation that manages both server and Ansible logs within the Squirrel Servers Manager. It provides comprehensive logging capabilities with features for storage, retrieval, and maintenance of logs.

## Features

- **Server Logs Management**
  - Log storage and retrieval
  - Pagination and filtering
  - Sorting capabilities
  - Log retention management
  - Bulk deletion support

- **Ansible Logs Management**
  - Execution-specific logs
  - Chronological log retrieval
  - Execution context preservation
  - Log cleanup utilities

- **Query Capabilities**
  - Field-based filtering
  - Multi-parameter queries
  - Customizable pagination
  - Flexible sorting options

- **Log Maintenance**
  - Automatic cleanup based on retention policy
  - Bulk deletion operations
  - Age-based log pruning
  - Storage optimization

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

### Domain Layer
- **Interfaces**
  - `IServerLogsService`: Server logs management contract
  - `IAnsibleLogsService`: Ansible logs management contract
  - `IServerLogsRepository`: Server logs data access contract
  - `IAnsibleLogsRepository`: Ansible logs data access contract

- **Entities**
  - Server log definitions
  - Ansible log structures
  - Log metadata types

### Application Layer
- **Services**
  - `ServerLogsService`: Core server logs management
    - Log retrieval with filtering
    - Deletion operations
    - Retention management
  - `AnsibleLogsService`: Core Ansible logs management
    - Execution-specific log handling
    - Log cleanup operations
    - Chronological retrieval

### Infrastructure Layer
- **Repositories**
  - `ServerLogsRepository`: Server logs persistence
  - `AnsibleLogsRepository`: Ansible logs persistence
  - MongoDB schema definitions
  - Data mapping utilities

- **Mappers**
  - `ServerLogMapper`: Domain to persistence mapping
  - `AnsibleLogMapper`: Domain to persistence mapping
  - `ServerLogPresentationMapper`: Domain to DTO mapping

### Presentation Layer
- **Controllers**
  - REST endpoints for log access
  - Query parameter handling
  - Response formatting

- **DTOs**
  - `ServerLogsQueryDto`: Log query parameters
  - Response data structures
  - Pagination metadata

## API Endpoints

### Server Logs
```typescript
GET /logs/server
// Retrieve server logs with filtering and pagination
// Query Parameters:
// - current: Current page number (default: 1)
// - pageSize: Items per page (default: 10)
// - time: Filter by timestamp
// - pid: Filter by process ID
// - level: Filter by log level
// - msg: Filter by message content
// - hostname: Filter by hostname
```

### Ansible Logs
```typescript
GET /logs/ansible/:executionId
// Retrieve logs for specific Ansible execution
// Parameters:
// - executionId: The execution identifier
// Optional:
// - sortDirection: Sort order (1: ascending, -1: descending)
```

### Log Management
```typescript
DELETE /logs/server
// Delete all server logs

DELETE /logs/server/old/:days
// Delete server logs older than specified days

DELETE /logs/ansible
// Delete all Ansible logs
```

## Integration

Import the module into your NestJS application:

```typescript
import { LogsModule } from './modules/logs';

@Module({
  imports: [LogsModule],
})
export class AppModule {}
```

## Recent Changes

- Enhanced log filtering capabilities
- Added pagination support for server logs
- Improved log retention management
- Added execution-specific Ansible log retrieval
- Enhanced log cleanup operations

## Future Improvements

- Real-time log streaming
- Advanced search capabilities
- Log aggregation features
- Custom log formatters
- Log export functionality
- Log analysis tools