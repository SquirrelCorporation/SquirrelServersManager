# Containers Module

The Containers Module provides functionality for managing Docker containers, volumes, networks, images, and container registries.

## Features

- Docker container management (create, start, stop, remove)
- Container volume management
- Container network management
- Container image management
- Container registry integration (Docker Hub, ECR, GCR, ACR, etc.)
- Container statistics collection
- Container templates

## Architecture

The module follows a standard NestJS architecture with:

- **Controllers**: Handle HTTP requests and delegate to services
- **Services**: Implement business logic
- **Schemas**: Define data models
- **Repositories**: Handle database operations
- **DTOs**: Define data transfer objects

### Controllers

- `ContainersController`: Controller for container operations
- `ContainerStatsController`: Controller for container statistics
- `ContainerVolumesController`: Controller for container volume operations
- `ContainerRegistriesController`: Controller for container registry operations
- `ContainerImagesController`: Controller for container image operations
- `ContainerNetworksController`: Controller for container network operations
- `ContainerTemplatesController`: Controller for container templates

### Services

- `ContainersService`: Service for container operations
- `ContainerStatsService`: Service for container statistics
- `ContainerVolumesService`: Service for container volume operations
- `ContainerRegistriesService`: Service for container registry operations
- `DockerService`: Service for Docker-specific operations
- `ProxmoxService`: Service for Proxmox-specific operations
- `WatcherEngineService`: Service for watching container events

### Schemas

- `Container`: Schema for container data
- `ContainerVolume`: Schema for container volume data
- `ContainerNetwork`: Schema for container network data
- `ContainerRegistry`: Schema for container registry data
- `ContainerTemplate`: Schema for container template data

### Repositories

- `ContainerRepository`: Repository for container operations
- `ContainerVolumeRepository`: Repository for container volume operations
- `ContainerRegistryRepository`: Repository for container registry operations
- `ContainerTemplateRepository`: Repository for container template operations

## API Endpoints

- `GET /containers`: Get all containers
- `GET /containers/:id`: Get container by ID
- `POST /containers`: Create a new container
- `PUT /containers/:id`: Update a container
- `DELETE /containers/:id`: Delete a container
- `POST /containers/:id/start`: Start a container
- `POST /containers/:id/stop`: Stop a container
- `POST /containers/:id/restart`: Restart a container
- `GET /containers/:id/logs`: Get container logs
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

## Usage

The module is used by importing it into the application module:

```typescript
import { ContainersModule } from './modules/containers/containers.module';

@Module({
  imports: [
    // ...
    ContainersModule,
    // ...
  ],
})
export class AppModule {}
```

## Using the Services

### Managing Containers

```typescript
import { ContainersService } from './modules/containers/services/containers.service';

@Injectable()
export class MyService {
  constructor(private readonly containersService: ContainersService) {}

  async getContainers(deviceId: string) {
    return this.containersService.getContainers(deviceId);
  }

  async startContainer(deviceId: string, containerId: string) {
    return this.containersService.startContainer(deviceId, containerId);
  }
}
```

### Working with Container Volumes

```typescript
import { ContainerVolumesService } from './modules/containers/services/container-volumes.service';

@Injectable()
export class MyService {
  constructor(private readonly containerVolumesService: ContainerVolumesService) {}

  async getVolumes(deviceId: string) {
    return this.containerVolumesService.getVolumes(deviceId);
  }

  async createVolume(deviceId: string, name: string) {
    return this.containerVolumesService.createVolume(deviceId, name);
  }
}
```

### Working with Container Registries

```typescript
import { ContainerRegistriesService } from './modules/containers/services/container-registries.service';

@Injectable()
export class MyService {
  constructor(private readonly containerRegistriesService: ContainerRegistriesService) {}

  async getRegistries() {
    return this.containerRegistriesService.getRegistries();
  }

  async addRegistry(registry: ContainerRegistryDto) {
    return this.containerRegistriesService.addRegistry(registry);
  }
}