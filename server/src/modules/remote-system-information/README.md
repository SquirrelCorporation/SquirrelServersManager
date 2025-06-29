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
# Remote System Information Module

## Overview

The Remote System Information Module provides functionality for collecting and managing system information from remote devices within the Squirrel Servers Manager application. It follows the Clean Architecture pattern to ensure separation of concerns and maintainability.

## Features

- Remote system information collection
- System metrics processing
- Device information queuing
- Diagnostic capabilities
- Integration with statistics module
- Vault-secured authentication
- Concurrent processing management

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core business entities and interfaces:

- **Entities**
  - System information entities
  - Device metrics entities
- **Interfaces**
  - `remote-system-information-service.interface.ts`
- **Helpers**
  - `sudo.ts`: Sudo command handling

### Application Layer

Contains the business logic and services:

- **Services**
  - `remote-system-information.service.ts`: Core system information service
  - `remote-system-information-engine.service.ts`: Processing engine service
- **Queue Processing**
  - `remote-system-information.processor.ts`: Queue processor for system information

### Infrastructure Layer

Contains implementations and external service integrations:

- **Queue**
  - Queue configuration and constants
  - Job processing implementation
- **Integration**
  - Prometheus metrics integration
  - Device authentication integration
  - Ansible vault integration

### Presentation Layer

Contains controllers and DTOs:

- **Controllers**
  - `diagnostic.ts`: Diagnostic endpoints for system information

## Module Structure

```
remote-system-information/
├── domain/
│   ├── entities/
│   ├── interfaces/
│   │   └── remote-system-information-service.interface.ts
│   └── helpers/
│       └── sudo.ts
├── application/
│   ├── services/
│   │   ├── remote-system-information.service.ts
│   │   └── engine/
│   │       └── remote-system-information-engine.service.ts
│   └── queue/
│       └── remote-system-information.processor.ts
├── infrastructure/
│   └── queue/
│       └── constants.ts
├── presentation/
│   └── controllers/
│       └── diagnostic.ts
├── __tests__/
├── remote-system-information.module.ts
├── index.ts
└── README.md
```

## Integration

The module is integrated through dependency injection:

```typescript
@Module({
  imports: [
    // Import devices module to access device repository
    forwardRef(() => DevicesModule),
    // Import statistics module to access metrics service
    StatisticsModule,
    // Import AnsibleVaults module for vault decryption
    AnsibleVaultsModule,
    // Register Bull queue for processing system information updates
    BullModule.registerQueue({
      name: REMOTE_SYSTEM_INFO_QUEUE,
      limiter: {
        max: JOB_CONCURRENCY,
        duration: 1000,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    }),
  ],
  controllers: [RemoteSystemInformationDiagnosticController],
  providers: [
    // Register queue processor
    RemoteSystemInformationProcessor,
    // Register services
    RemoteSystemInformationEngineService,
    RemoteSystemInformationService,
    // Add provider for IRemoteSystemInformationService
    {
      provide: REMOTE_SYSTEM_INFORMATION_SERVICE,
      useClass: RemoteSystemInformationService,
    },
  ],
  exports: [
    // Export services
    RemoteSystemInformationService,
  ],
})
```

## Queue Processing

The module uses Bull queue for processing system information updates:

- **Concurrency**: Configurable job concurrency
- **Retries**: Automatic retry with exponential backoff
- **Job Management**: Automatic cleanup of completed/failed jobs
- **Rate Limiting**: Configurable rate limiting for job processing

## API Endpoints

### Diagnostics

- `GET /remote-system-info/diagnostic/:deviceId`: Get system information diagnostics
- `POST /remote-system-info/diagnostic/:deviceId/check`: Run diagnostic check

## Testing

The module includes comprehensive tests that verify:

- Service functionality
- Queue processing
- Controller endpoints
- Integration with other modules
- Error handling and retries

Run the tests using:

```bash
npm test -- modules/remote-system-information
```

## Recent Changes

- Implemented Clean Architecture pattern
- Added queue-based processing
- Enhanced error handling
- Improved device authentication
- Added diagnostic capabilities
- Enhanced test coverage 