
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
# Squirrel Servers Manager (SSM) - Server 🐿️

## Overview

Squirrel Servers Manager (SSM) is a comprehensive server management platform designed to simplify the administration, monitoring, and orchestration of server infrastructure. Built on NestJS with Clean Architecture principles, SSM provides a robust set of tools for managing containers, executing Ansible playbooks, handling SSH connections, and much more.

## Features

- **Container Management**: Comprehensive Docker container orchestration
- **Ansible Integration**: Execute playbooks, manage inventories, and Galaxy collections
- **SSH/SFTP Connectivity**: Secure remote access and file transfers
- **Device Management**: Monitor and manage remote devices
- **Automation**: Schedule and execute automated tasks
- **Diagnostic Tools**: Health checks and system monitoring
- **User Management**: Role-based access control and authentication
- **Notifications**: Real-time system notifications
- **Repository Management**: Git-based playbook and container stack repositories
- **Real-time Monitoring**: WebSocket-based statistics and logs

## Architecture

SSM follows a modular Clean Architecture approach with a clear separation of concerns:

### Core Principles

1. **Modularity**: Each feature is encapsulated in a self-contained module
2. **Clean Architecture**: Strict separation between domain, application, infrastructure, and presentation layers
3. **Dependency Injection**: NestJS's DI system for managing dependencies
4. **Event-Driven Communication**: Inter-module communication through event emitters
5. **Repository Pattern**: Abstracting data access through repositories
6. **Comprehensive Testing**: Each module includes detailed test coverage

### Layer Structure

Each module follows a consistent layered architecture:

1. **Domain Layer**: Core business entities and repository interfaces
   - Business entities representing domain concepts
   - Repository interfaces defining data access contracts
   - Domain-specific interfaces and types

2. **Application Layer**: Business logic and service implementations
   - Service interfaces defining feature contracts
   - Service implementations containing business logic
   - Use cases orchestrating domain operations

3. **Infrastructure Layer**: External system integrations and data access
   - Repository implementations for data persistence
   - Database schemas for MongoDB models
   - External service adapters (SSH, Docker, Git)

4. **Presentation Layer**: API endpoints and client interfaces
   - REST controllers handling HTTP requests
   - WebSocket gateways for real-time communication
   - DTOs (Data Transfer Objects) for API contracts

## Module System

SSM is organized into specialized modules, each focused on a specific domain:

### Core Modules

- **Ansible**: Playbook execution and management
- **Containers**: Docker container orchestration
- **Devices**: Remote device management
- **SSH/SFTP**: Secure connectivity and file transfer
- **Users**: Authentication and authorization

### Supporting Modules

- **Diagnostics**: System health checks
- **Logs**: Centralized logging infrastructure
- **Shell**: Command execution and file system operations
- **Statistics**: Performance metrics collection
- **Notifications**: Event-based notification system
- **Updates**: Version management and updates

### Utility Modules

- **Telemetry**: Anonymous usage tracking
- **Smart Failure**: Intelligent error analysis
- **Scheduler**: Task scheduling and execution