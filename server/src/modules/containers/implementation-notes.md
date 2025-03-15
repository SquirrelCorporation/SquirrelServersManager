# Containers Module Implementation Notes

## Registry Components - 2025-03-15

Implemented several container registry components following the clean architecture approach:

### Component Structure
- Created `AbstractRegistryComponent` as base class for all registry components
- Implemented specific registry components:
  - `DockerHubRegistryComponent`: Docker Hub registry with full API support
  - `CustomRegistryComponent`: Standard Docker Registry API v2 for private registries
  - `GcrRegistryComponent`: Google Container Registry with Google authentication
  - `GhcrRegistryComponent`: GitHub Container Registry integration
  - `AcrRegistryComponent`: Azure Container Registry with AAD authentication
  - `EcrRegistryComponent`: AWS Elastic Container Registry with AWS SDK integration
  - `QuayRegistryComponent`: Red Hat Quay.io with API support
  - `GitLabRegistryComponent`: GitLab Container Registry integration
  - `GiteaRegistryComponent`: Gitea Container Registry with API support
  - `ForgejoRegistryComponent`: Forgejo Container Registry (Gitea fork)
  - `LscrRegistryComponent`: Linux Server Container Registry integration

### Factory Implementation
- Enhanced `ContainerComponentFactory` to support all registry types
- Improved component creation with proper error handling
- Used Kind.REGISTRY with provider type for component identification

### Module Integration
- Registered all components in the ContainersModule
- Updated import/export statements for proper dependency injection
- Maintained backward compatibility with legacy registry services

### Registry Component Features
- Authentication mechanisms tailored to each provider
- Repository listing and searching
- Tag management
- Image information retrieval
- Connection testing and token refresh

### Registry Components Complete
All planned container registry components have been implemented following the clean architecture approach:

### Next Steps
1. Write comprehensive tests for all registry components
2. Update documentation with examples for each registry type
3. Implement registry component mocking for testing
4. Implement Proxmox watcher component following clean architecture pattern

## Watcher Engine Service - 2025-03-15

Refined the watcher engine service implementation following the clean architecture approach:

### Domain Layer
- Used the component interface from the domain layer
- Utilized the Kind enum for component type identification
- Maintained component hierarchical structure

### Application Layer
- Enhanced the watcher engine service interface with clear responsibility boundaries
- Improved the engine service implementation with dependency injection
- Integrated with component factory for dynamic component creation
- Maintained proper lifecycle management for all components

### Backward Compatibility
- Updated the legacy engine service with deprecation notices
- Used delegation pattern for backward compatibility
- Preserved original functionality while guiding to new implementation

### Next Steps
1. Complete the component factory implementation
2. Implement the adapter pattern for proxmox service
3. Update watcher class implementations to clean architecture
4. Continue with remaining infrastructure implementations

## Container Base Service - 2025-03-15

Implemented container base functionality following the clean architecture approach:

### Domain Layer
- Updated `ContainerEntity` for Docker and Proxmox container management
- Utilized `ContainerRepositoryInterface` for database operations

### Infrastructure Layer
- Implemented new `ContainerSchema` with proper indexes for MongoDB
- Enhanced `ContainerMapper` for entity-document transformation 
- Made schemas available in the infrastructure layer

### Application Layer
- Enhanced `ContainerServiceInterface` with comprehensive operations:
  - Container CRUD operations (create, read, update, delete)
  - Container lifecycle management (start, stop, restart, pause, kill)
  - Container logs retrieval
  - Counting and filtering functionality
- Enhanced `ContainerService` implementation with Docker integration

### Presentation Layer
- Improved container DTOs:
  - Enhanced `CreateContainerDto` with validation
  - Added `UpdateContainerDto` for partial updates
  - Added `ContainerActionDto` for container actions
- Updated container controller with RESTful endpoints

### Backward Compatibility
- Maintained original service and controller with deprecation notices
- Updated original implementations to delegate to new implementations
- Added original files to obsolete directory for reference

### Next Steps
1. Implement integration tests for container operations
2. Update Proxmox integration to work with the new architecture
3. Add missing documentation for container operations
4. Continue with watcher engine service refactoring

## Container Templates - 2025-03-15

Implemented container templates functionality following the clean architecture approach:

### Application Layer
- Created `IContainerTemplatesService` interface with key operations:
  - `getTemplates` for retrieving available templates with filtering and pagination
  - `deployTemplate` for deploying containers from templates via Ansible playbooks

- Implemented `ContainerTemplatesService` with integration with the Playbooks module:
  - Template listing with pagination, sorting, and filtering
  - Template deployment to target hosts via Ansible playbooks
  - Integration with Docker Compose via helper utilities

### Presentation Layer
- Created `ContainerTemplatesController` with REST endpoints:
  - GET `/container-templates` for listing available templates
  - POST `/container-templates/deploy` for deploying templates
- Added DTOs for template operations:
  - `ContainerTemplatesQueryDto` for pagination and filtering
  - `TemplateDeployDto` for deployment configuration
  - Nested DTOs for ports, volumes, and targets

### Backward Compatibility
- Maintained original service and controller with deprecation notices
- Updated original implementations to delegate to new implementations
- Added original files to obsolete directory for reference

### Next Steps
1. Implement integration tests for template deployment
2. Implement unit tests for the template service
3. Update documentation for template management
4. Continue with container base service implementation

## Container Logs - 2025-03-15

Implemented container logs functionality following the clean architecture approach:

### Domain Layer
- Updated `ContainerEntity` to be used for log retrieval

### Application Layer
- Created `IContainerLogsService` interface with key operations:
  - `findContainerById` to get container details
  - `findRegisteredComponent` to get Docker component
  - `getContainerLogs` to retrieve logs
  - `streamContainerLogs` for real-time log streaming

- Implemented `ContainerLogsService` with DockerWatcher integration for:
  - Finding containers by UUID
  - Getting registered Docker components
  - Streaming container logs in real-time
  - Retrieving historical logs

### Presentation Layer
- Created `ContainerLogsGateway` with WebSocket support:
  - `handleSubscribe` for real-time log subscriptions
  - `handleUnsubscribe` for cleanup
  - Legacy support for `GET_LOGS` events
  - Stream management and client tracking
- Added `ContainerLogsDto` with proper validation

### Backward Compatibility
- Maintained original service and gateway with deprecation notices
- Updated original implementations to delegate to new implementations
- Modified module configuration to register both new and legacy components

### Next Steps
1. Implement integration tests for log streaming
2. Implement unit tests for the logs service
3. Update documentation for container logs management
4. Continue with container networks implementation

## Registry Management - 2025-03-15

Implemented registry management functionality following the clean architecture approach:

### Domain Layer
- Created `ContainerRegistryEntity` entity with registry properties
- Defined `ContainerRegistryRepositoryInterface` with standard CRUD operations

### Application Layer
- Implemented `ContainerRegistriesService` with comprehensive registry management operations:
  - Add registry if it doesn't exist
  - Update registry authentication
  - Create custom registry
  - Remove registry authentication
  - List all registries with authentication set up
- Integrated with `WatcherEngineService` for registry component lifecycle management

### Infrastructure Layer
- Created `ContainerRegistryRepository` for database operations
- Implemented `ContainerRegistryMapper` for entity-document transformation
- Added `ContainerRegistrySchema` for MongoDB

### Presentation Layer
- Created `ContainerRegistriesController` with RESTful endpoints for registry management
- Added DTOs for registry operations:
  - `UpdateRegistryAuthDto`
  - `CreateCustomRegistryDto`
  - `ContainerRegistryDto`

### Next Steps
1. Implement integration tests for registry operations
2. Implement unit tests for the registry service and repository
3. Update documentation for registry management
4. Continue with container logs implementation

## Image Management - 2025-03-15

Implemented image management functionality following the clean architecture approach:

### Domain Layer
- Created `ContainerImageEntity` entity with Docker image properties
- Defined `ContainerImageRepositoryInterface` with standard CRUD operations

### Application Layer
- Implemented `ContainerImagesService` with comprehensive Docker image operations:
  - Pull images from registries
  - Build images from Dockerfiles
  - Tag images
  - Push images to registries
  - Remove images
  - Prune unused images
- Updated `DockerWatcherComponent` with image management methods:
  - listImages
  - getImage
  - pullImage
  - removeImage
  - buildImage
  - tagImage
  - pushImage
  - pruneImages

### Infrastructure Layer
- Created `ContainerImageRepository` for database operations
- Implemented `ContainerImageMapper` for entity-document transformation
- Added `ContainerImageSchema` for MongoDB

### Presentation Layer
- Created `ContainerImagesController` with RESTful endpoints
- Added DTOs for image operations:
  - `PullImageDto`
  - `BuildImageDto`
  - `TagImageDto`

### Next Steps
1. Implement integration tests for image operations
2. Implement unit tests for the image service and repositories
3. Update documentation for image management
4. Continue with container stats implementation

## Volume Management - 2025-03-15

Implemented volume management functionality following the clean architecture approach:

### Domain Layer
- Created `ContainerVolumeEntity` entity with Docker volume properties
- Defined `ContainerVolumeRepositoryInterface` with standard CRUD operations

### Application Layer
- Implemented `ContainerVolumesService` with Docker integration
- Updated `DockerWatcherComponent` with volume management methods:
  - createVolume
  - getVolume
  - listVolumes
  - removeVolume
  - pruneVolumes

### Infrastructure Layer
- Created `ContainerVolumeRepository` for database operations
- Implemented `ContainerVolumeMapper` for entity-document transformation
- Added `ContainerVolumeSchema` for MongoDB

### Presentation Layer
- Created `ContainerVolumesController` with RESTful endpoints
- Added `CreateVolumeDto` for input validation

### Next Steps
1. Implement integration tests for volume operations
2. Implement unit tests for the volume service and repositories
3. Create migration for database schema
4. Continue with image management implementation

## Network Management - 2025-03-14

Implemented network management functionality following the clean architecture approach:

### Domain Layer
- Created `ContainerNetworkEntity` entity with Docker network properties
- Defined `ContainerNetworkRepositoryInterface` with standard CRUD operations

### Application Layer
- Implemented `ContainerNetworksService` with Docker integration
- Updated `DockerWatcherComponent` with network management methods:
  - createNetwork
  - getNetwork
  - listNetworks
  - removeNetwork
  - connectContainerToNetwork
  - disconnectContainerFromNetwork

### Infrastructure Layer
- Created `ContainerNetworkRepository` for database operations
- Implemented `ContainerNetworkMapper` for entity-document transformation
- Added `ContainerNetworkSchema` for MongoDB

### Presentation Layer
- Created `ContainerNetworksController` with RESTful endpoints
- Added `CreateNetworkDto` for input validation
- Added `UpdateNetworkDto` for network update validation