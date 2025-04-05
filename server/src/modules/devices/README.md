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
# Devices Module

## Overview

The Devices Module provides comprehensive device management functionality within the Squirrel Servers Manager application. It handles device registration, authentication, configuration, and capabilities for different device types including Docker and Proxmox hosts. The module follows Clean Architecture principles to ensure separation of concerns and maintainability.

## Features

- Device registration and management
- Device authentication and authorization
- Docker host management
- Proxmox host management
- Device capabilities discovery
- Device configuration management
- Sensitive information handling
- Support for multiple device types

## Architecture

The module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core business entities and interfaces:

- **Entities**
  - `device.entity.ts`: Core domain entity for devices
  - `device-auth.entity.ts`: Entity for device authentication
- **Repository Interfaces**
  - `device-repository.interface.ts`
  - `device-auth-repository.interface.ts`
- **Service Interfaces**
  - `devices-service.interface.ts`
  - `device-auth-service.interface.ts`
  - `docker-device-service.interface.ts`
  - `proxmox-device-service.interface.ts`
  - `sensitive-info-service.interface.ts`

### Application Layer

Contains the business logic and services:

- **Core Services**
  - `devices.service.ts`: Main device management service
  - `device-auth.service.ts`: Device authentication service
  - `docker-device.service.ts`: Docker host management
  - `proxmox-device.service.ts`: Proxmox host management
  - `sensitive-info.service.ts`: Sensitive information handling

### Infrastructure Layer

Contains implementations of repositories and external services:

- **Repositories**
  - `device.repository.ts`: MongoDB repository for devices
  - `device-auth.repository.ts`: MongoDB repository for device authentication
- **Schemas**
  - `device.schema.ts`: Mongoose schema for devices
  - `device-auth.schema.ts`: Mongoose schema for device authentication
- **Mappers**
  - `device-repository.mapper.ts`: Maps between domain entities and database models

### Presentation Layer

Contains controllers, DTOs, and mappers:

- **Controllers**
  - `devices.controller.ts`: Core device management endpoints
  - `devices-auth.controller.ts`: Device authentication endpoints
  - `devices-capabilities.controller.ts`: Device capabilities endpoints
  - `devices-configuration.controller.ts`: Device configuration endpoints
- **DTOs**
  - `device.dto.ts`: Device data transfer objects
  - `device-auth.dto.ts`: Authentication data transfer objects
  - `device-capabilities.dto.ts`: Capabilities data transfer objects
  - `device-configuration.dto.ts`: Configuration data transfer objects
  - `update-docker-auth.dto.ts`: Docker authentication updates
  - `update-proxmox-auth.dto.ts`: Proxmox authentication updates
- **Mappers**
  - `device.mapper.ts`: Maps between domain entities and DTOs

## Module Structure

```
devices/
├── domain/
│   ├── entities/
│   │   ├── device.entity.ts
│   │   └── device-auth.entity.ts
│   ├── repositories/
│   │   ├── device-repository.interface.ts
│   │   └── device-auth-repository.interface.ts
│   └── services/
│       ├── devices-service.interface.ts
│       ├── device-auth-service.interface.ts
│       ├── docker-device-service.interface.ts
│       ├── proxmox-device-service.interface.ts
│       └── sensitive-info-service.interface.ts
├── application/
│   └── services/
│       ├── devices.service.ts
│       ├── device-auth.service.ts
│       ├── docker-device.service.ts
│       ├── proxmox-device.service.ts
│       └── sensitive-info.service.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── device.repository.ts
│   │   └── device-auth.repository.ts
│   ├── schemas/
│   │   ├── device.schema.ts
│   │   └── device-auth.schema.ts
│   └── mappers/
│       └── device-repository.mapper.ts
├── presentation/
│   ├── controllers/
│   │   ├── devices.controller.ts
│   │   ├── devices-auth.controller.ts
│   │   ├── devices-capabilities.controller.ts
│   │   └── devices-configuration.controller.ts
│   ├── dtos/
│   │   ├── device.dto.ts
│   │   ├── device-auth.dto.ts
│   │   ├── device-capabilities.dto.ts
│   │   ├── device-configuration.dto.ts
│   │   ├── update-docker-auth.dto.ts
│   │   └── update-proxmox-auth.dto.ts
│   └── mappers/
│       └── device.mapper.ts
├── __tests__/
├── devices.module.ts
├── index.ts
└── README.md
```

## Integration

The module is integrated through dependency injection:

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DEVICE, schema: DeviceSchema },
      { name: DEVICE_AUTH, schema: DeviceAuthSchema },
    ]),
    AnsibleVaultsModule,
  ],
  controllers: [
    DevicesController,
    DevicesAuthController,
    DevicesCapabilitiesController,
    DevicesConfigurationController,
  ],
  providers: [
    // Core services
    DevicesService,
    DeviceAuthService,
    DockerDeviceService,
    ProxmoxDeviceService,
    SensitiveInfoService,
    
    // Mappers
    DeviceMapper,
    DeviceRepositoryMapper,
    
    // Repositories
    {
      provide: DEVICE_REPOSITORY,
      useClass: DeviceRepository,
    },
    {
      provide: DEVICE_AUTH_REPOSITORY,
      useClass: DeviceAuthRepository,
    },
  ],
  exports: [
    DevicesService,
    DeviceAuthService,
    DockerDeviceService,
    ProxmoxDeviceService,
    SENSITIVE_INFO_SERVICE,
  ],
})
```

## API Endpoints

### Device Management

- `GET /devices`: List all devices
- `GET /devices/:id`: Get device by ID
- `POST /devices`: Create new device
- `PATCH /devices/:id`: Update device
- `DELETE /devices/:id`: Delete device

### Device Authentication

- `GET /devices/auth/:id`: Get device authentication
- `POST /devices/auth/:id`: Set device authentication
- `PATCH /devices/auth/:id`: Update device authentication
- `DELETE /devices/auth/:id`: Delete device authentication
- `POST /devices/auth/:id/docker`: Set Docker authentication
- `POST /devices/auth/:id/proxmox`: Set Proxmox authentication

### Device Capabilities

- `GET /devices/:id/capabilities`: Get device capabilities
- `POST /devices/:id/capabilities/refresh`: Refresh capabilities

### Device Configuration

- `GET /devices/:id/configuration`: Get device configuration
- `PATCH /devices/:id/configuration`: Update device configuration

## Recent Changes

- Added support for Proxmox devices
- Enhanced Docker host management
- Improved sensitive information handling
- Added device capabilities discovery
- Enhanced authentication flows
- Added comprehensive test coverage 