# Containers Module Refactoring to Clean Architecture

## Overview

This document details the progress made on refactoring the Containers Module to follow Clean Architecture principles, aligning it with other modules in the SquirrelServersManager application. The refactoring transforms the flat module structure into a layered architecture with clear separation of concerns, improving maintainability, testability, and extensibility.

## Completed Work

### 1. Directory Structure

Created a proper Clean Architecture directory structure:

```
modules/containers/
├── domain/             # Core business rules and entities
│   ├── entities/       # Business objects
│   ├── repositories/   # Repository interfaces
│   └── components/     # Component interfaces
├── application/        # Application business rules
│   ├── interfaces/     # Service interfaces
│   └── services/       # Service implementations
│       ├── components/ # Component implementations
│       └── engine/     # Engine service
├── infrastructure/     # External frameworks & tools
│   ├── repositories/   # Repository implementations
│   ├── schemas/        # Database schemas
│   └── mappers/        # Entity-document mappers
└── presentation/       # UI & external interfaces
    ├── controllers/    # API controllers
    ├── dtos/           # Data transfer objects
    ├── gateways/       # WebSocket gateways
    └── mappers/        # Entity-DTO mappers
```

### 2. Domain Layer Implementation

#### Entities
- `ContainerEntity`: Represents a container with all its properties
- `ContainerNetworkEntity`: Represents a container network configuration

#### Repository Interfaces
- `ContainerRepositoryInterface`: Interface for container data operations
- `ContainerNetworkRepositoryInterface`: Interface for network data operations

#### Component Interfaces & Enums
- `Component<T>`: Generic interface for all container-related components
- `Kind`: Enum defining component types (WATCHER, REGISTRY)

### 3. Application Layer Implementation

#### Service Interfaces
- `ContainerServiceInterface`: Interface for container operations
- `ContainerLogsServiceInterface`: Interface for container logs access
- `ContainerNetworksServiceInterface`: Interface for network operations
- `WatcherEngineServiceInterface`: Interface for component management

#### Service Implementations
- `ContainerService`: Core service for container CRUD operations
- `ContainerLogsService`: Service for container logs access and streaming
- `ContainerNetworksService`: Service for network operations
- `WatcherEngineService`: Service for managing components (registries & watchers)

#### Component System
- `AbstractWatcherComponent`: Base class for container watchers
- `AbstractRegistryComponent`: Base class for registry providers
- `DockerWatcherComponent`: Docker implementation with full container and network support
- `DockerHubRegistryComponent`: Docker Hub registry implementation

#### Component Factory
- `ContainerComponentFactory`: Factory for creating the correct component based on type and provider

### 4. Infrastructure Layer Implementation

#### Repository Implementations
- `ContainerRepository`: MongoDB implementation of container repository
- `ContainerNetworkRepository`: MongoDB implementation of network repository

#### Entity Mappers
- `ContainerMapper`: Maps between domain entities and database documents
- `ContainerNetworkMapper`: Maps between network entities and database documents

### 5. Presentation Layer Implementation

#### Controllers
- `ContainersController`: RESTful API for container operations
- `ContainerNetworksController`: RESTful API for network operations

#### Data Transfer Objects
- `CreateContainerDto`: DTO for container creation validation
- `UpdateNetworkDto`: DTO for network update validation
- `CreateNetworkDto`: DTO for network creation validation

#### WebSocket Gateways
- `ContainerLogsGateway`: WebSocket gateway for streaming container logs

### 6. Constants & Configuration
- `WATCHERS`: Constants for watcher types
- `REGISTRIES`: Constants for registry providers

## Enhanced Docker Component

The `DockerWatcherComponent` has been implemented with comprehensive functionality:

### Container Operations
- Container creation
- Container inspection
- Container lifecycle management (start, stop, restart, pause, unpause, kill)
- Container logs access
- Container listing

### Network Operations
- Network creation with custom configurations
- Network listing
- Network inspection
- Network removal
- Connecting containers to networks
- Disconnecting containers from networks

## Technical Implementation Details

### Component System Design

The component system follows a hierarchical design:

1. **Interface Layer**: The `Component<T>` interface defines the contract for all components
2. **Abstract Base Classes**: `AbstractWatcherComponent` and `AbstractRegistryComponent` provide common functionality
3. **Concrete Implementations**: `DockerWatcherComponent` and `DockerHubRegistryComponent` implement provider-specific logic

This design allows for easy addition of new container or registry providers while maintaining a consistent API.

### Docker Watcher Implementation

The `DockerWatcherComponent` interacts with Docker daemons using the Dockerode library:

```typescript
protected async setup(): Promise<void> {
  try {
    logger.info(`Setting up Docker watcher for ${this.name}`);
    const { host } = this.configuration;
    
    // Create Docker client
    this.docker = new Docker({
      host,
      port: 2375, // Default Docker port
    });

    // Test connection
    await this.docker.ping();
    
    // Start cron jobs
    this.startWatchJobs();
    
    logger.info(`Docker watcher ${this.name} set up successfully`);
  } catch (error) {
    logger.error(`Failed to set up Docker watcher ${this.name}: ${error.message}`);
    throw error;
  }
}
```

### Engine Service

The `WatcherEngineService` manages component lifecycle:

1. **Registration**: Creates and initializes components based on configuration
2. **State Management**: Maintains references to all active components
3. **Deregistration**: Properly cleans up components when they're no longer needed

### Dependency Injection

The module uses NestJS dependency injection with token-based providers:

```typescript
// Domain repositories
{
  provide: CONTAINER_REPOSITORY,
  useClass: ContainerRepository,
},
{
  provide: CONTAINER_NETWORK_REPOSITORY,
  useClass: ContainerNetworkRepository,
},

// Application services
ContainerService,
{
  provide: CONTAINER_SERVICE,
  useClass: ContainerService,
},
```

This approach allows for:
- Easy replacement of implementations
- Better testability through mocking
- Loose coupling between layers

### Backward Compatibility

The implementation maintains backward compatibility:

1. Legacy repository methods are maintained alongside new methods
2. Component interfaces ensure consistent API despite different implementations
3. Service implementations handle translation between old and new models

## Current Status (Updated March 15, 2025)

The Containers Module is currently **disabled** in app.module.ts due to TypeScript compilation issues. The module is functionally complete but needs TypeScript errors fixed before it can be enabled.

## Next Steps

### 1. Fix TypeScript Compilation Issues

- Fix TypeScript errors in test files
- Update DTO classes with proper initializers
- Fix schema definitions to follow NestJS patterns
- Update import paths in tests
- Enable the ContainersModule in app.module.ts

### 2. Complete Component Implementation

- ✅ Implement `CustomRegistryComponent` for private registries
- ✅ Implement `GcrRegistryComponent` for Google Container Registry (fixed to use basic auth)
- ✅ Implement `GhcrRegistryComponent` for GitHub Container Registry
- ✅ Implement other registry components (ACR, ECR, Quay, GitLab, Gitea, Forgejo, LSCR)
- Implement `ProxmoxWatcherComponent` for Proxmox LXC containers

### 3. Additional Services

- ✅ Implement `ContainerVolumesService` for volume management
- ✅ Implement `ContainerImagesService` for image management
- ✅ Implement `ContainerStatsService` for container statistics
- ✅ Implement `ContainerTemplatesService` for container templates

### 4. Schema Migration

- ✅ Move all schemas to the infrastructure/schemas directory
- ✅ Complete repository implementations for all entities
- ✅ Update DTOs for all operations

### 5. Testing

- ✅ Add unit tests for components
- Complete unit tests for all services
- Fix TypeScript issues in test files
- Create integration tests for component interaction
- Test backward compatibility with existing code

### 6. Legacy Code Cleanup

- ✅ Remove legacy services, controllers, and gateways
- ✅ Move obsolete code to the obsolete directory for reference

## Technical Challenges & Solutions

### Challenge: Complex Stateful Components

The Docker and registry components need to maintain state (connections, caches) while following clean architecture principles.

**Solution**: Implemented lifecycle methods (setup, cleanup) in the abstract component classes and used dependency injection to manage component lifecycle.

### Challenge: Backward Compatibility

The existing codebase relies on the current module structure.

**Solution**: Maintained backward-compatible methods in repositories and created adapter services where needed.

### Challenge: Docker API Integration

Docker API operations can be complex and error-prone.

**Solution**: Encapsulated Docker API calls within the DockerWatcherComponent with proper error handling and logging.

## Architecture Benefits

### 1. Separation of Concerns

- **Domain Layer**: Contains only business logic and entities
- **Application Layer**: Implements use cases without external dependencies
- **Infrastructure Layer**: Handles external concerns like database access
- **Presentation Layer**: Manages API endpoints and validation

### 2. Testability

- Interfaces at domain boundaries enable easy mocking
- Pure domain logic can be tested without external dependencies
- Component-based design allows testing components in isolation

### 3. Extensibility

- New watcher types can be added by implementing AbstractWatcherComponent
- New registry providers can be added by implementing AbstractRegistryComponent
- New functionality can be added without modifying existing code

### 4. Maintainability

- Clear separation of concerns makes code easier to understand
- Interface-based design makes dependencies explicit
- Standard patterns across modules reduce cognitive load

## Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Domain Layer | ✅ Complete | Entity and repository interfaces defined |
| ContainerService | ✅ Complete | Full implementation with Docker integration |
| ContainerNetworksService | ✅ Complete | Network management with Docker integration |
| ContainerVolumesService | ✅ Complete | Volume management with Docker integration |
| DockerWatcherComponent | ✅ Complete | Container, network, volume, and image operations implemented |
| DockerHubRegistryComponent | ✅ Complete | Image operations implemented |
| ContainerLogsService | ✅ Complete | Log access and streaming |
| Controllers | ✅ Complete | Container, network, volume, and image endpoints |
| DTOs | ✅ Complete | Container, network, volume, and image DTOs implemented |
| ProxmoxWatcherComponent | ❌ Pending | Not started |
| ContainerImagesService | ✅ Complete | Image management with Docker integration |
| ContainerStatsService | ✅ Complete | Container statistics implementation |
| GCR Registry Component | ✅ Complete | Fixed to use basic authentication |
| GHCR Registry Component | ✅ Complete | GitHub Container Registry support |
| ACR Registry Component | ✅ Complete | Azure Container Registry support |
| ECR Registry Component | ✅ Complete | AWS ECR Registry support |
| Custom Registry Component | ✅ Complete | Private registry support |
| ContainerTemplatesService | ✅ Complete | Container templates management |
| TypeScript Compilation | ❌ Issues | Test files and DTOs need fixes |
| Module Integration | ❌ Disabled | Due to TypeScript compilation issues |

## Refactoring Impact

The refactoring aligns the Containers Module with other modules in the application (playbooks, container-stacks, devices, users) that already follow clean architecture. This creates a consistent architectural approach across the codebase, making it easier for developers to work with different modules.

## Conclusion

The containers module refactoring to clean architecture has made significant progress, with all core components and services now implemented. The component-based design provides flexibility for future extensions, while maintaining backward compatibility with existing code.

The refactoring is functionally complete but faces TypeScript compilation issues that prevent it from being fully integrated into the application. These issues are primarily in the test files and DTOs, which need proper TypeScript initializers and import path corrections.

### Recent Improvements

1. **GCR Registry Component:** Fixed the implementation to use basic authentication with Base64 encoding instead of the incorrect Google Auth Library dependency.
2. **Legacy File Removal:** Removed all legacy implementation files that have been properly migrated to the new architecture, including services, controllers, and gateways.
3. **All Registry Components:** Completed implementations for all registry providers, including Docker Hub, GCR, GHCR, ACR, ECR, Quay, GitLab, Gitea, Forgejo, and LSCR.
4. **Clean Architecture Structure:** Finalized the directory structure and organization to fully comply with clean architecture principles.

### Final Steps

The next steps focus on fixing the TypeScript compilation issues, completing the remaining tests, and integrating the module back into the application. Once these are addressed, the refactored module will be more maintainable, testable, and extensible while providing a consistent architectural approach across the application.