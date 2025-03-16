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

- **Entities**: Core business objects like ContainerEntity
- **Repositories**: Interfaces defining data access methods
- **Components**: Component interfaces and enums

### Application Layer

- **Services**: Business logic for container operations
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

### Controllers

- `ContainersController`: Controller for container operations
- `ContainerStatsController`: Controller for container statistics
- `ContainerVolumesController`: Controller for container volume operations
- `ContainerRegistriesController`: Controller for container registry operations
- `ContainerImagesController`: Controller for container image operations
- `ContainerNetworksController`: Controller for container network operations
- `ContainerTemplatesController`: Controller for container templates

### Services

- `ContainerService`: Service for container operations
- `ContainerLogsService`: Service for container logs
- `ContainerStatsService`: Service for container statistics
- `ContainerVolumesService`: Service for container volume operations
- `WatcherEngineService`: Core engine for container watchers and registries
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
- `POST /containers/device/:deviceUuid`: Create a new container on device
- `PATCH /containers/:uuid`: Update a container
- `DELETE /containers/:uuid`: Delete a container
- `POST /containers/:uuid/start`: Start a container
- `POST /containers/:uuid/stop`: Stop a container
- `POST /containers/:uuid/restart`: Restart a container
- `POST /containers/:uuid/pause`: Pause a container
- `POST /containers/:uuid/unpause`: Unpause a container
- `POST /containers/:uuid/kill`: Kill a container
- `GET /containers/:uuid/logs`: Get container logs
- `GET /containers/stats`: Get container statistics
- `GET /containers/volumes`: Get all volumes
- `POST /containers/volumes`: Create a new volume
- `DELETE /containers/volumes/:name`: Delete a volume
- `GET /containers/networks`: Get all networks
- `POST /containers/networks`: Create a new network
- `DELETE /containers/networks/:name`: Delete a network
- `GET /containers/images`: Get all images
- `GET /containers/registries`: Get all registries
- `POST /containers/registries`: Add a new registry
- `DELETE /containers/registries/:id`: Delete a registry
- `GET /containers/templates`: Get all templates
- `POST /containers/templates/deploy`: Deploy a template

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
import { ContainerService, CONTAINER_SERVICE } from '@modules/containers';

@Injectable()
export class MyService {
  constructor(
    @Inject(CONTAINER_SERVICE)
    private readonly containerService: ContainerService
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

  async createContainer(deviceUuid: string, containerData: CreateContainerDto) {
    return this.containerService.createContainer(deviceUuid, containerData);
  }
}
```

### Accessing Container Logs

```typescript
import { ContainerLogsService, CONTAINER_LOGS_SERVICE } from '@modules/containers';

@Injectable()
export class MyService {
  constructor(
    @Inject(CONTAINER_LOGS_SERVICE)
    private readonly containerLogsService: ContainerLogsService
  ) {}

  async getContainerLogs(containerUuid: string, options?: any) {
    return this.containerLogsService.getContainerLogs(containerUuid, options);
  }
}
```

### Working with Container Registries and Watchers

```typescript
import { 
  WatcherEngineService, 
  WATCHER_ENGINE_SERVICE,
  Kind,
  WATCHERS,
  REGISTRIES 
} from '@modules/containers';

@Injectable()
export class MyService {
  constructor(
    @Inject(WATCHER_ENGINE_SERVICE)
    private readonly watcherEngineService: WatcherEngineService
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
