# Migration Plan: Containers Module Refactoring to Clean Architecture

## Current State Analysis

The containers module currently:
- Has a flat structure without clear separation of concerns
- Mixes repositories, services, controllers in the same directory level
- Contains a complex "engine" component (WatcherEngineService) that manages container registries and watchers
- Has specialized components for different container providers (Docker, Proxmox)
- Lacks clean architecture patterns found in other modules

## Target Architecture

Refactor to match the clean architecture used in other modules:
- **Domain Layer**: Core business logic, entities, and repository interfaces
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: Database interaction, external services
- **Presentation Layer**: Controllers, DTOs, and mappers

## Migration Strategy

### Phase 1: Preparation and Infrastructure Setup

1. **Create Directory Structure**
   - Create domain, application, infrastructure, and presentation folders
   - Set up necessary subdirectories (entities, repositories, services, etc.)

2. **Define Domain Entities and Interfaces**
   - Create container entity models in domain/entities
   - Define repository interfaces in domain/repositories
   - Define service interfaces in domain/services or application/interfaces

3. **Implement Repository Pattern**
   - Move schemas to infrastructure/schemas
   - Create mappers in infrastructure/mappers
   - Move repositories to infrastructure/repositories
   - Implement repository interfaces

### Phase 2: Component and Engine Refactoring

4. **Refactor Core Components**
   - Move Component.ts and related files to domain/components
   - Refactor CustomAgent.ts to follow clean architecture principles

5. **Engine Refactoring**
   - Create ContainerWatcherEngineService interface in application/interfaces
   - Move and refactor WatcherEngineService implementation to application/services/engine
   - Refactor to use dependency injection through interfaces
   - Create component factories similar to playbooks module

6. **Provider-Specific Components**
   - Create abstract base components for watchers
   - Implement provider-specific components (Docker, Proxmox)
   - Move registry providers to appropriate infrastructure components 

### Phase 3: Service Layer Refactoring

7. **Application Services**
   - Define service interfaces in application/interfaces
   - Implement services in application/services
   - Ensure proper dependency injection

8. **Gateways and WebSockets**
   - Move gateways to presentation/gateways
   - Refactor ContainerLogsGateway to use application services

### Phase 4: Presentation Layer Refactoring

9. **Controllers and DTOs**
   - Move controllers to presentation/controllers
   - Create DTOs in presentation/dtos
   - Implement mappers in presentation/mappers

10. **Module Definition Update**
    - Update containers.module.ts to use the new structure
    - Configure dependency injection using interfaces

## Implementation Plan

### Step 1: Initial Structure and Minimal Changes

1. Create new directory structure without modifying existing files
2. Create empty interface definitions for all services
3. Update imports in one isolated service to verify approach

### Step 2: Domain Layer Implementation

1. Define and implement container entities
2. Create repository interfaces
3. Create service interfaces for application layer

### Step 3: Infrastructure Layer Migration

1. Move and adapt schemas
2. Create entity mappers
3. Implement repositories using the interfaces

### Step 4: Engine Component Migration

This is the most complex part and should be done with extra care:

1. Define engine interfaces
2. Break down engine into smaller components
3. Implement component factory pattern
4. Migrate stateful functionalities with proper lifecycle management

### Step 5: Service Layer Migration

1. Implement application services with proper interface boundaries
2. Adapt watcher components to use new architecture
3. Ensure proper dependency injection

### Step 6: Update Controllers and Module Definition

1. Move controllers to presentation layer
2. Create proper DTOs
3. Update module definition with proper DI

### Step 7: Testing and Validation

1. Create comprehensive tests for each layer
2. Validate all functionality against existing implementation
3. Test in development environment before release

## Risk Mitigation

1. **Backward Compatibility**: Maintain existing service interfaces during transition
2. **Incremental Approach**: Refactor one component at a time with thorough testing
3. **Feature Flags**: Implement toggles to switch between old and new implementations
4. **Comprehensive Testing**: Add tests before refactoring to ensure behavior is preserved

## Timeline Estimation

1. Preparation and design: 1-2 days
2. Domain and infrastructure layers: 2-3 days
3. Engine component refactoring: 3-4 days
4. Service and presentation layers: 2-3 days
5. Testing and validation: 2-3 days

Total: 10-15 days for complete migration

## Next Steps After Migration

1. Improve error handling with custom exceptions
2. Enhance testability with proper mocking
3. Document the new architecture
4. Consider implementing CQRS pattern for more complex operations