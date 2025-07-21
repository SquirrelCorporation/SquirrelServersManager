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
# Code Guidelines - Naming Conventions and Standards

This document outlines the naming conventions and standards to be followed across the codebase to maintain consistency.

## Interfaces

### Service Interfaces
- **Pattern**: `IServiceName` (e.g., `IContainerService`, `IAnsibleService`)
- **Filename**: `service-name.interface.ts`
- **DI Tokens**: Use constants (e.g., `CONTAINER_SERVICE`)

### Repository Interfaces
- **Pattern**: `IEntityNameRepository` (e.g., `IContainerRepository`, `IAnsibleTaskRepository`)
- **Filename**: `entity-name-repository.interface.ts`
- **DI Tokens**: Use constants (e.g., `CONTAINER_REPOSITORY`)

### Component Interfaces
- **Pattern**: `IComponentName` (e.g., `IActionComponent`, `IWatcherComponent`)
- **Filename**: `component-name.interface.ts`

## Entities

### Entity Interfaces
- **Pattern**: `IEntityName` without "Entity" suffix (e.g., `IContainer`, `IAnsibleTask`)
- **Filename**: `entity-name.entity.ts`
- **Properties**: Use clear, descriptive names without prefixes

## DTOs

### DTO Classes
- **Pattern**: PascalCase with descriptive action prefixes (e.g., `CreateContainerDto`, `UpdateDeviceDto`)
- **Filename**: `action-entity-name.dto.ts`
- **Pluralization**: Use singular for entity names
- **Directory**: Place all DTOs in a `dtos/` directory (use plural)

## Directory Structure

### Module Structure
- Maintain clean architecture layers: domain, application, infrastructure, presentation
- Use pluralized directory names for collections (`interfaces/`, `entities/`, `dtos/`)

## Implementation Classes

### Service Implementations
- Drop the "I" prefix when implementing interfaces (e.g., `ContainerService` implements `IContainerService`)
- Use descriptive, action-oriented method names (e.g., `findById`, `createNew`, `updateStatus`)

### Repository Implementations
- Drop the "I" prefix when implementing interfaces (e.g., `ContainerRepository` implements `IContainerRepository`)
- Use consistent method naming across repositories

## Mappers

### Mapper Classes
- **Pattern**: `EntityNameMapper` for mapper classes
- **Filename**: `entity-name.mapper.ts`
- **Methods**: Implement consistent mapping methods (`toEntity`, `toDomain`, `toDto`)

## Module Architecture and Dependencies

### Module Encapsulation
- **Only services** should be exported and used by other modules
- **Never import repositories** directly from other modules
- Modules should provide all necessary functionality through their service interfaces
- If a repository method is needed by other modules, expose it through a service method

### Module Dependencies
- Always use proper injection tokens (e.g., `DEVICES_SERVICE`, not string literals like 'DevicesService')
- Import from module path aliases (e.g., `@modules/devices`) instead of relative paths
- When a module needs functionality from another module:
  1. Import the module in the module's imports array
  2. Import and inject the service interface and token from the module
  3. Use the injected service to access functionality

## Error Handling

### Exception Types
- Use the standardized exception types from `/infrastructure/exceptions/app-exceptions.ts`
- Match exception types to HTTP status codes (e.g., `NotFoundException` for 404)
- Include relevant context in exceptions (e.g., entity name, identifier)

### Error Response Format
- All API errors should return the standardized response format:
  ```json
  {
    "success": false,
    "message": "Human-readable error message",
    "error": "ErrorTypeName", 
    "statusCode": 400,
    "timestamp": "2023-01-01T00:00:00.000Z",
    "path": "/api/resource",
    "data": null
  }
  ```

### Legacy Error Handling
- For legacy code, continue using `ApiError` types
- Use `ExceptionFactory` to convert legacy errors to standardized ones
- New code should use the new exception classes directly

## General Rules

- Follow TypeScript best practices
- Use consistent casing conventions
  - **PascalCase**: classes, interfaces, types, enums
  - **camelCase**: variables, functions, methods, properties
  - **ALL_UPPERCASE**: constants
- Use descriptive names that clearly indicate purpose
- Maintain consistent naming schemes across related components
- Use async/await instead of direct Promise handling
- Add JSDoc comments for public APIs