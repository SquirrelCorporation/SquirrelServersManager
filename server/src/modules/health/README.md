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
# Health Module

## Overview

The Health Module provides basic health check functionality for the Squirrel Servers Manager application. It follows a simple implementation of the Clean Architecture pattern to provide health status endpoints.

## Features

- Basic health check endpoint
- Public access without authentication
- Simple status response
- Kubernetes-compatible health check

## Architecture

The module follows a simplified Clean Architecture pattern with the following structure:

### Domain Layer

Contains the core business logic (minimal in this case):

- Health check status types
- Health check response interfaces

### Application Layer

Contains the application logic:

- Health check service implementations
- Status validation logic

### Presentation Layer

Contains the controller for health check endpoints:

- `health.controller.ts`: Provides health check endpoints

## Module Structure

```
health/
├── domain/
│   └── types/
├── application/
│   └── services/
├── health.controller.ts
├── health.module.ts
└── README.md
```

## Integration

The module is integrated through dependency injection:

```typescript
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
```

## API Endpoints

### Health Check

- `GET /ping`: Basic health check endpoint
  - Returns: `{ status: 'ok' }`
  - Access: Public (no authentication required)
  - Use: Kubernetes liveness probe, load balancer health check

## Usage

The health check endpoint can be used by various systems:

- Kubernetes liveness and readiness probes
- Load balancer health checks
- Monitoring systems
- CI/CD pipeline checks

Example usage with curl:

```bash
curl http://your-server/ping
```

Expected response:

```json
{
  "status": "ok"
}
```

## Recent Changes

- Implemented Clean Architecture pattern
- Added public access decorator
- Enhanced response format
- Added comprehensive test coverage 
