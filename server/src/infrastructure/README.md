# Infrastructure Layer

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

## Overview

The Infrastructure Layer provides essential services, adapters, utilities, and frameworks that support the overall application architecture of Squirrel Servers Manager. This layer implements interfaces defined in the domain and application layers, providing concrete technical implementations for external services, databases, authentication mechanisms, and cross-cutting concerns.

## Architecture

The Infrastructure Layer follows Clean Architecture principles, serving as the outermost layer that interacts with external systems and frameworks. Its key responsibilities include:

1. **External Service Integration**: Providing adapters and wrappers for third-party services and libraries
2. **Database Access**: Implementing repository interfaces with database-specific code
3. **Authentication & Security**: Handling authentication, authorization, and security concerns
4. **Error Handling**: Providing centralized exception handling and transformation
5. **Cross-Cutting Concerns**: Implementing logging, monitoring, and other infrastructural concerns

## Directory Structure

```
infrastructure/
├── adapters/             # Adapters for external services and libraries
│   ├── git/              # Git service adapter for repository management
│   ├── proxmox/          # Proxmox API adapter for VM management
│   └── ssh/              # SSH connection adapter
├── auth/                 # Authentication and authorization infrastructure
├── common/               # Shared utilities and helpers
│   ├── ansible/          # Ansible utility functions
│   ├── directory-tree/   # File system directory tree utilities
│   ├── dns/              # DNS resolution utilities
│   ├── docker/           # Docker utilities and helpers
│   ├── files/            # File system utilities
│   ├── query/            # Query parameter handling utilities
│   ├── redis/            # Redis connection and utility functions
│   └── utils/            # Common utility functions
├── documentation/        # Documentation for infrastructure components
├── exceptions/           # Exception handling and factory
├── filters/              # HTTP filters and request/response transformers
├── interceptors/         # NestJS interceptors for request processing
├── plugins/              # Plugin system for application extensibility
├── prometheus/           # Prometheus metrics and monitoring
├── security/             # Security-related components
│   ├── audit/            # Audit logging for security events
│   ├── csp/              # Content Security Policy middleware
│   ├── roles/            # Role-based access control
│   ├── throttler/        # Rate limiting and request throttling
│   └── vault-crypto/     # Secure vault for sensitive data
├── ssh/                  # SSH infrastructure module
├── websocket-auth/       # WebSocket authentication guards
└── index.ts              # Barrel exports for infrastructure components
```

## Key Components

### Adapters

Adapters provide interfaces to external services and libraries, ensuring the application core remains decoupled from implementation details.

#### Git Adapter

The Git adapter provides a comprehensive interface for Git operations, including:

- Repository cloning (`clone.service.ts`)
- Commit and synchronization (`commit-and-sync.service.ts`)
- Force pulling (`force-pull.service.ts`)
- Repository initialization (`init-git.service.ts`)
- Repository inspection (`inspect.service.ts`)
- Repository synchronization (`sync.service.ts`)

#### Proxmox Adapter

The Proxmox adapter enables interaction with Proxmox VE API for virtual machine management:

- VM construction and manipulation (`constructor.service.ts`)
- Proxmox API engine (`proxmox-engine.service.ts`)
- API proxying (`proxy.service.ts`)
- VM monitoring (`qm-monitor.service.ts`)

#### SSH Adapter

The SSH adapter provides secure shell connectivity to remote systems:

- SSH credential management (`ssh-credentials.adapter.ts`)
- Custom SSH agent implementation (`custom-agent.adapter.ts`)
- Axios integration for HTTP-based SSH (`axios-ssh.adapter.ts`)

### Authentication

The Authentication infrastructure implements various authentication strategies and guards:

- JWT token authentication (`jwt.strategy.ts`)
- Bearer token authentication (`bearer.strategy.ts`)
- Composite authentication strategy (`auth.strategy.ts`)
- Authentication guards (`jwt-auth.guard.ts`)

### Common Utilities

The Common directory contains shared utilities used throughout the application:

- Ansible configuration helpers
- Directory tree generation and manipulation
- DNS resolution utilities
- Docker Compose utilities and transformers
- File system helpers
- Query parameter handling (filtering, pagination, sorting)
- Redis connection and information utilities
- General-purpose utility functions

### Exceptions

The Exceptions directory provides centralized exception handling:

- Custom application exceptions (`app-exceptions.ts`)
- Exception factory for creating typed errors (`exception-factory.ts`)

### Filters & Interceptors

Filters and interceptors process HTTP requests and responses:

- API exception handling (`api-exception.filter.ts`)
- HTTP exception transformation (`http-exception.filter.ts`)
- Error transformation (`error-transformer.interceptor.ts`)
- Response transformation (`transform.interceptor.ts`)

### Plugin System

The Plugin System enables extensibility through dynamically loaded plugins:

- Plugin registration and loading (`plugin-system.ts`)
- Plugin API endpoints (`plugins.controller.ts`)
- NestJS module integration (`plugins.module.ts`)

### Prometheus

The Prometheus integration provides metrics and monitoring:

- Metric collection and definition (`prometheus.service.ts`)
- Provider configuration (`prometheus.provider.ts`)
- Metric types and interfaces

### Security

The Security directory contains components related to application security:

#### Audit

The Audit module tracks security-relevant events:

- Audit logging service (`audit-log.service.ts`)
- Audit interceptor for capturing events (`audit.interceptor.ts`)
- Audit log schema for data storage

#### Content Security Policy

- CSP middleware for HTTP security headers (`csp.middleware.ts`)

#### Roles

Role-based access control implementation:

- Permission service for role management (`permission.service.ts`)
- Resource action decorator (`resource-action.decorator.ts`)
- Role-based guard (`roles.guard.ts`)

#### Throttler

Request rate limiting to prevent abuse:

- Throttling module configuration (`throttler.module.ts`)

#### Vault Crypto

Secure data encryption and storage:

- Vault service for storing sensitive data (`vault.service.ts`)
- Encryption utilities (`binascii.util.ts`, `pkcs7.util.ts`)

### WebSocket Authentication

WebSocket-specific authentication guards:

- WebSocket authentication guard (`ws-auth.guard.ts`)
- WebSocket authentication module (`ws-auth.module.ts`)

## Integration with Application Architecture

The Infrastructure Layer implements interfaces defined in the domain and application layers, following the dependency inversion principle:

1. **Repository Implementations**: Concrete database access implementations for repository interfaces defined in the domain layer
2. **External Service Adapters**: Concrete implementations of service interfaces defined in the application layer
3. **Cross-Cutting Concerns**: Implementation of cross-cutting concerns like logging, security, and error handling

## Best Practices

When working with the Infrastructure Layer:

1. **Dependency Inversion**: Ensure infrastructure components depend on abstractions from domain and application layers, not vice versa
2. **Single Responsibility**: Keep infrastructure components focused on specific technical concerns
3. **Testability**: Use dependency injection and interfaces to make components testable in isolation
4. **Error Handling**: Implement consistent error handling and transformation
5. **Performance**: Consider performance implications, especially for database access and external service calls
6. **Security**: Apply security best practices for authentication, authorization, and data protection
