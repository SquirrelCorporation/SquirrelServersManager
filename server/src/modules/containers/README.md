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
# Containers Module

## Overview
The Containers Module provides comprehensive Docker container management capabilities within the Squirrel Servers Manager application. It implements a robust system for managing containers, volumes, networks, images, and registries across multiple devices, following Clean Architecture principles with a component-based design for extensibility.

## Features
- Container lifecycle management (create, start, stop, remove)
- Volume management with backup capabilities
- Network management and configuration
- Image management and registry integration
- Multi-registry support (Docker Hub, ECR, GCR, ACR, etc.)
- Real-time container statistics and logging
- Template-based container deployment
- Container health monitoring
- Resource usage tracking
- Multi-device container orchestration
- WebSocket-based real-time updates
- Component-based registry integration
- Watcher engine for container state management

## Clean Architecture Implementation

### Domain Layer (`/domain`)
- **Entities**
  - Container entities and value objects
  - Volume, network, and image entities
  - Registry configuration entities
- **Interfaces**
  - Repository interfaces
  - Service interfaces
  - Component interfaces
- **Types**
  - Custom types and enums
  - Shared constants

### Application Layer (`/application`)
- **Services**
  - `ContainerService`: Core container operations
  - `ContainerVolumesService`: Volume management
  - `ContainerNetworksService`: Network operations
  - `ContainerImagesService`: Image handling
  - `ContainerRegistriesService`: Registry management
  - `ContainerStatsService`: Statistics collection
  - `ContainerLogsService`: Log management
  - `ContainerTemplatesService`: Template handling
  - `WatcherEngineService`: Container state monitoring
- **Components**
  - Registry components for different providers
  - Watcher components for container monitoring
  - Component factories for extensibility

### Infrastructure Layer (`/infrastructure`)
- **Repositories**
  - MongoDB implementations
  - Data persistence logic
- **Schemas**
  - Container schema
  - Volume schema
  - Network schema
  - Image schema
  - Registry schema
- **Mappers**
  - Entity to model mapping
  - DTO transformations

### Presentation Layer (`/presentation`)
- **Controllers**
  - RESTful endpoints
  - Resource management
- **Gateways**
  - WebSocket communication
  - Real-time updates
- **DTOs**
  - Request/Response objects
  - Validation schemas

## Module Structure
```
containers/
├── __tests__/                    # Test files
├── application/
│   └── services/
│       ├── components/           # Registry and watcher components
│       ├── engine/              # Watcher engine
│       ├── container.service.ts
│       ├── container-volumes.service.ts
│       ├── container-networks.service.ts
│       ├── container-images.service.ts
│       ├── container-registries.service.ts
│       ├── container-stats.service.ts
│       ├── container-logs.service.ts
│       └── container-templates.service.ts
├── domain/
│   ├── interfaces/              # Service and repository interfaces
│   └── repositories/           # Repository interfaces
├── infrastructure/
│   ├── mappers/               # Entity mappers
│   ├── repositories/          # Repository implementations
│   └── schemas/              # MongoDB schemas
├── presentation/
│   ├── controllers/          # REST controllers
│   └── gateways/            # WebSocket gateways
├── utils/                   # Utility functions
├── containers.module.ts     # Module definition
├── types.ts                # Type definitions
├── constants.ts            # Constants
└── README.md
```

## API Endpoints
### Container Management
- `GET /containers`: List all containers
- `GET /containers/:uuid`: Get container details
- `POST /containers`: Create container
- `PATCH /containers/:uuid`: Update container
- `DELETE /containers/:uuid`: Remove container
- `POST /containers/:uuid/{start|stop|restart|pause|unpause|kill}`: Container actions

### Volume Management
- `GET /container-volumes`: List volumes
- `POST /container-volumes`: Create volume
- `GET /container-volumes/:uuid`: Get volume details
- `DELETE /container-volumes/:uuid`: Remove volume
- `POST /container-volumes/backup/:uuid`: Backup volume

### Network Management
- `GET /container-networks`: List networks
- `POST /container-networks`: Create network
- `DELETE /container-networks/:uuid`: Remove network

### Registry Management
- `GET /container-registries`: List registries
- `POST /container-registries/:name`: Configure registry
- `DELETE /container-registries/:name`: Remove registry

### Statistics & Monitoring
- `GET /container-statistics/:id/stats/:type`: Get container statistics
- `GET /container-statistics/averaged`: Get averaged stats

### WebSocket Events
- `container-logs:subscribe`: Subscribe to container logs
- `container-logs:data`: Receive log data
- `container-logs:unsubscribe`: Unsubscribe from logs

## Recent Changes
- Added multi-registry support
- Enhanced container monitoring
- Improved volume backup functionality
- Added template-based deployment
- Enhanced real-time statistics
- Implemented container health checks
- Added resource usage tracking
- Improved error handling
- Enhanced WebSocket communication
- Added component-based registry system