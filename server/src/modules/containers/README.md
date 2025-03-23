```
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

The Containers Module provides functionality for managing Docker and Proxmox containers across connected devices. It follows Clean Architecture principles with clear separation of concerns between domain, application, infrastructure, and presentation layers.

## Features

- Docker container management (create, start, stop, remove)
- Container volume management
- Container network management
- Container image management
- Container registry integration (Docker Hub, ECR, GCR, ACR, etc.)
- Container statistics collection
- Container templates

## Architecture

This module is structured according to clean architecture principles:

### Domain Layer

- **Entities**: Core business objects like `IContainerEntity`
- **Repositories**: Interfaces defining data access methods like `IContainerRepository`
- **Components**: Component interfaces like `IContainerComponent` and enums like `Kind`

### Application Layer

- **Interfaces**: Service interfaces like `IContainerService` and `IContainerVolumesService`
- **Services**: Business logic implementations for container operations
- **Components**: Reusable component implementations
  - AbstractWatcherComponent: Base class for container watchers
  - AbstractRegistryComponent: Base class for registry providers
- **Engine**: WatcherEngine for managing container watchers and registries

### Infrastructure Layer

- **Repositories**: Concrete implementations of repository interfaces
- **Mappers**: Transform domain entities to/from database documents
- **Schemas**: Database schema definitions

### Presentation Layer

- **Controllers**: HTTP endpoints for container operations
- **Gateways**: WebSocket endpoints for real-time container logs
- **DTOs**: Data transfer objects for validation and API structure

## Key Components

### Interfaces

- **Domain Entities**:
  - `IContainerEntity`: Entity interface for containers
  - `IContainerVolumeEntity`: Entity interface for container volumes
  - `IContainerNetworkEntity`: Entity interface for container networks
  - `IContainerImageEntity`: Entity interface for container images
  - `IContainerRegistryEntity`: Entity interface for container registries
  - `IContainerComponent`: Base component interface

- **Domain Repositories**:
  - `IContainerRepository`: Repository interface for container operations
  - `IContainerVolumeRepository`: Repository interface for volume operations
  - `IContainerNetworkRepository`: Repository interface for network operations
  - `IContainerImageRepository`: Repository interface for image operations
  - `IContainerRegistryRepository`: Repository interface for registry operations

- **Application Services**:
  - `IContainerService`: Service interface for container operations
  - `IContainerVolumesService`: Service interface for volume operations
  - `IContainerNetworksService`: Service interface for network operations
  - `IContainerImagesService`: Service interface for image operations
  - `IContainerRegistriesService`: Service interface for registry operations
  - `IContainerStatsService`: Service interface for container statistics
  - `IContainerLogsService`: Service interface for container logs
  - `IContainerWatcherEngineService`: Service interface for watcher engine
  - `IContainerTemplatesService`: Service interface for container templates

### Controllers

- `ContainersController`: Controller for container operations
- `ContainerStatsController`: Controller for container statistics
- `ContainerVolumesController`: Controller for container volume operations
- `ContainerRegistriesController`: Controller for container registry operations
- `ContainerImagesController`: Controller for container image operations
- `ContainerNetworksController`: Controller for container network operations
- `ContainerTemplatesController`: Controller for container templates
- `ContainerLogsGateway`: WebSocket gateway for container logs

### Services

- `ContainerService`: Implementation of `IContainerService`
- `ContainerVolumesService`: Implementation of `IContainerVolumesService`
- `ContainerNetworksService`: Implementation of `IContainerNetworksService`
- `ContainerImagesService`: Implementation of `IContainerImagesService`
- `ContainerRegistriesService`: Implementation of `IContainerRegistriesService`
- `ContainerStatsService`: Implementation of `IContainerStatsService`
- `ContainerLogsService`: Implementation of `IContainerLogsService`
- `WatcherEngineService`: Implementation of `IContainerWatcherEngineService`
- `ContainerComponentFactory`: Factory for creating watcher and registry components

### Container Watchers

The module uses a component-based architecture for container watchers:

- **Docker Watcher**: Manages Docker containers on remote devices
- **Proxmox Watcher**: Manages Proxmox LXC containers on remote devices

### Container Registries

Various registry providers are supported through a component system:

- Docker Hub, GCR, GHCR, Quay, ECR, GitLab, etc.

## API Endpoints

- `GET /containers`: Get all containers
- `GET /containers/:uuid`: Get container by UUID
- `GET /containers/device/:deviceUuid`: Get containers by device UUID
- `PATCH /containers/:uuid`: Update a container
- `DELETE /containers/:uuid`: Delete a container
- `POST /containers/:uuid/start`: Start a container
- `POST /containers/:uuid/stop`: Stop a container
- `POST /containers/:uuid/restart`: Restart a container
- `POST /containers/:uuid/pause`: Pause a container
- `POST /containers/:uuid/unpause`: Unpause a container
- `POST /containers/:uuid/kill`: Kill a container
- `GET /containers/:uuid/logs`: Get container logs

- `GET /container-volumes`: Get all volumes
- `GET /container-volumes/device/:deviceUuid`: Get volumes by device UUID
- `GET /container-volumes/:uuid`: Get volume by UUID
- `POST /container-volumes/device/:deviceUuid`: Create a volume
- `PATCH /container-volumes/:uuid`: Update a volume
- `DELETE /container-volumes/:uuid`: Delete a volume
- `POST /container-volumes/prune/device/:deviceUuid`: Prune unused volumes
- `POST /container-volumes/backup/:uuid`: Backup a volume
- `GET /container-volumes/backup`: Download a volume backup

- `GET /container-networks`: Get all networks
- `GET /container-networks/:uuid`: Get network by UUID
- `GET /container-networks/device/:deviceUuid`: Get networks by device UUID
- `POST /container-networks/device/:deviceUuid`: Create a network
- `PATCH /container-networks/:uuid`: Update a network
- `DELETE /container-networks/:uuid`: Delete a network

- `GET /container-images`: Get all images

- `GET /container-registries`: Get all registries
- `POST /container-registries/:name`: Update registry authentication
- `PUT /container-registries/:name`: Create a custom registry
- `PATCH /container-registries/:name`: Reset registry authentication
- `DELETE /container-registries/:name`: Remove a custom registry

- `GET /container-statistics/:id/stat/:type`: Get container stat by type
- `GET /container-statistics/:id/stats/:type`: Get container stats by type
- `GET /container-statistics/count/:status`: Get container count by status
- `GET /container-statistics/averaged`: Get averaged container stats

- `GET /container-templates`: Get all templates
- `POST /container-templates/deploy`: Deploy a template

## WebSocket Endpoints

- `container-logs`: Namespace for container logs
  - `subscribe`: Subscribe to container logs
  - `unsubscribe`: Unsubscribe from container logs

## Usage

### Module Import

The module is used by importing it into the application module:

```typescript
import { ContainersModule } from '@modules/containers';

@Module({
  imports: [
    // ...
    ContainersModule,
    // ...
  ],
})
export class AppModule {}
```

### Managing Containers

```typescript
import { IContainerService, CONTAINER_SERVICE } from '@modules/containers';

@Injectable()
export class MyService {
  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: IContainerService
  ) {}

  async getAllContainers() {
    return this.containerService.getAllContainers();
  }

  async getContainersByDeviceUuid(deviceUuid: string) {
    return this.containerService.getContainersByDeviceUuid(deviceUuid);
  }

  async startContainer(containerUuid: string) {
    return this.containerService.startContainer(containerUuid);
  }

  async createContainer(deviceUuid: string, containerData: IContainerEntity) {
    return this.containerService.createContainer(deviceUuid, containerData);
  }
}
```

### Accessing Container Logs

```typescript
import { IContainerLogsService, CONTAINER_LOGS_SERVICE } from '@modules/containers';

@Injectable()
export class MyService {
  constructor(
    @Inject(CONTAINER_LOGS_SERVICE)
    private readonly containerLogsService: IContainerLogsService
  ) {}

  async getContainerLogs(containerUuid: string, options?: any) {
    return this.containerLogsService.getContainerLogs(containerUuid, options);
  }
}
```

### Working with Container Registries and Watchers

```typescript
import { 
  IContainerWatcherEngineService, 
  WATCHER_ENGINE_SERVICE,
  Kind,
  WATCHERS,
  REGISTRIES 
} from '@modules/containers';

@Injectable()
export class MyService {
  constructor(
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: IContainerWatcherEngineService
  ) {}

  async registerDockerWatcher(deviceId: string, deviceUuid: string, config: any) {
    return this.watcherEngineService.registerComponent(
      deviceId,
      Kind.WATCHER,
      WATCHERS.DOCKER,
      `${WATCHERS.DOCKER}-${deviceUuid}`,
      config
    );
  }

  async registerRegistry(registryId: string, provider: string, name: string, auth: any) {
    return this.watcherEngineService.registerComponent(
      registryId,
      Kind.REGISTRY,
      provider,
      name,
      { ...auth, name, provider }
    );
  }
}
```

## Extending the Module

### Adding a New Watcher Type

1. Create a new component class extending AbstractWatcherComponent
2. Implement required methods for container operations
3. Add the component to ContainerComponentFactory
4. Update the WATCHERS constants

### Adding a New Registry Provider

1. Create a new component class extending AbstractRegistryComponent
2. Implement required methods for registry operations
3. Add the component to ContainerComponentFactory
4. Update the REGISTRIES constants
