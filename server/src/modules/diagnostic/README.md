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
# Diagnostic Module

## Overview

The Diagnostic Module provides real-time diagnostic capabilities for devices and services within the Squirrel Servers Manager application. It follows Clean Architecture principles to ensure separation of concerns and maintainability.

## Features

- Real-time device diagnostics
- WebSocket-based event streaming
- Diagnostic event handling
- Device health monitoring
- Service status checks
- Real-time diagnostic updates
- Event-driven architecture
- Diagnostic data mapping

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core business entities and interfaces:

- **Entities**
  - `diagnostic.entity.ts`: Core diagnostic entity
  - `diagnostic-event.entity.ts`: Diagnostic event entity
- **Repository Interfaces**
  - `diagnostic-repository.interface.ts`: Diagnostic data access contract
- **Service Interfaces**
  - `diagnostic-service.interface.ts`: Diagnostic service contract

### Application Layer

Contains the business logic and services:

- **Core Services**
  - `diagnostic.service.ts`: Core diagnostic functionality
    - Device health checks
    - Service status monitoring
    - Event handling
    - Real-time updates

### Infrastructure Layer

Contains implementations of repositories and external integrations:

- **Repositories**
  - `diagnostic.repository.ts`: Diagnostic data storage
- **Event Integration**
  - Integration with event emitter service
  - WebSocket event handling

### Presentation Layer

Contains controllers, gateways, and DTOs:

- **Controllers**
  - `diagnostic.controller.ts`: REST API endpoints
- **Gateways**
  - `diagnostic.gateway.ts`: WebSocket gateway for real-time updates
  - `diagnostic-events.gateway.ts`: Event streaming gateway
- **Mappers**
  - `diagnostic.mapper.ts`: Maps between domain entities and DTOs
- **DTOs**
  - Request/response data transfer objects
  - WebSocket event DTOs

## Module Structure

```
diagnostic/
├── domain/
│   ├── entities/
│   │   ├── diagnostic.entity.ts
│   │   └── diagnostic-event.entity.ts
│   ├── repositories/
│   │   └── diagnostic-repository.interface.ts
│   └── interfaces/
│       └── diagnostic-service.interface.ts
├── application/
│   └── services/
│       └── diagnostic.service.ts
├── infrastructure/
│   └── repositories/
│       └── diagnostic.repository.ts
├── presentation/
│   ├── controllers/
│   │   └── diagnostic.controller.ts
│   ├── gateways/
│   │   ├── diagnostic.gateway.ts
│   │   └── diagnostic-events.gateway.ts
│   ├── mappers/
│   │   └── diagnostic.mapper.ts
│   └── dtos/
│       ├── diagnostic.dto.ts
│       └── diagnostic-event.dto.ts
├── __tests__/
├── diagnostic.module.ts
├── index.ts
└── README.md
```

## Integration

The module is integrated through dependency injection:

```typescript
@Module({
  imports: [
    DevicesModule,
  ],
  controllers: [
    DiagnosticController,
  ],
  providers: [
    DiagnosticService,
    EventEmitterService,
    DiagnosticMapper,
    DiagnosticGateway,
    DiagnosticEventsGateway,
  ],
  exports: [
    DiagnosticService,
  ],
})
```

## API Endpoints

### REST Endpoints

- `GET /diagnostic/:deviceId`: Get device diagnostics
- `POST /diagnostic/:deviceId/check`: Run diagnostic check
- `GET /diagnostic/:deviceId/status`: Get diagnostic status
- `GET /diagnostic/:deviceId/history`: Get diagnostic history

### WebSocket Events

- `diagnostic.status`: Real-time diagnostic status updates
- `diagnostic.event`: Diagnostic event notifications
- `diagnostic.check`: Diagnostic check results
- `diagnostic.error`: Error notifications

## Recent Changes

- Added real-time diagnostic updates
- Enhanced WebSocket event handling
- Improved diagnostic checks
- Added event streaming capabilities
- Enhanced error handling
- Added comprehensive test coverage
