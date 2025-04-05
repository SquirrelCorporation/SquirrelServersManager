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
# Scheduler Module

The Scheduler module is a NestJS implementation that manages system-wide cron jobs and scheduled tasks within the Squirrel Servers Manager. It provides centralized scheduling capabilities for various system maintenance tasks and automated operations.

## Features

- **System Cron Management**
  - Device offline detection
  - Ansible logs cleanup
  - Server logs cleanup
  - Job status tracking
  - Execution history

- **Cron Job Management**
  - Dynamic job registration
  - Job status monitoring
  - Last execution tracking
  - Active jobs listing
  - Job persistence

- **Scheduling Features**
  - Configurable intervals
  - Automatic job initialization
  - Job deduplication
  - Error handling
  - Execution logging

- **Integration Support**
  - Device status management
  - Log retention policies
  - Cache management
  - Task cleanup
  - Status updates

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

### Domain Layer
- **Entities**
  - `ICron`: Core cron job entity
  - Job definitions
  - Execution tracking
  - Status information

- **Interfaces**
  - `ICronService`: Cron management contract
  - `ISystemCronService`: System jobs contract
  - `ICronRepository`: Data access contract

### Application Layer
- **Services**
  - `CronService`: Core cron management
    - Job creation and updates
    - Execution tracking
    - Job querying
    - Status management

  - `SystemCronService`: System maintenance jobs
    - Device offline detection (every minute)
    - Ansible logs cleanup (every 5 minutes)
    - Server logs cleanup (every 5 minutes)
    - Job initialization
    - Error handling

### Infrastructure Layer
- **Repositories**
  - `CronRepository`: Cron job persistence
  - MongoDB integration
  - Data mapping

- **Schemas**
  - `CronSchema`: MongoDB schema
  - Job data structure
  - Execution history

### Presentation Layer
- **Controllers**
  - REST endpoints for cron management
  - Job status monitoring
  - Active jobs listing

## System Cron Jobs

### Device Offline Detection
```typescript
@Cron('0 * * * * *', { name: '_isDeviceOffline' })
// Runs every minute
// - Checks device last seen timestamps
// - Updates device online/offline status
// - Configurable offline threshold
```

### Ansible Logs Cleanup
```typescript
@Cron('0 */5 * * * *', { name: '_CleanAnsibleTasksLogsAndStatuses' })
// Runs every 5 minutes
// - Cleans old Ansible task logs
// - Removes outdated status records
// - Configurable retention period
```

### Server Logs Cleanup
```typescript
@Cron('0 */5 * * * *', { name: '_CleanServerLogs' })
// Runs every 5 minutes
// - Removes old server logs
// - Applies retention policy
// - Configurable cleanup period
```

## API Endpoints

### Cron Management
```typescript
GET /admin/crons
// Retrieve all cron jobs with status
// Returns:
// - Job name
// - Last execution
// - Active status
// - Expression
```

## Integration

Import the module into your NestJS application:

```typescript
import { SchedulerModule } from './modules/scheduler';

@Module({
  imports: [SchedulerModule],
})
export class AppModule {}
```

## Recent Changes

- Enhanced job deduplication
- Improved error handling
- Added execution tracking
- Enhanced logging capabilities
- Added job status monitoring

## Future Improvements

- Job execution metrics
- Custom job scheduling
- Job failure notifications
- Execution history viewer
- Performance optimization
- Job priority management 