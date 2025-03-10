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
# SSH Module

## Overview

The SSH Module provides secure shell connectivity to remote devices. It enables users to establish SSH connections, execute commands, and interact with remote servers through a terminal interface.

## Architecture

The SSH Module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core business entities and repository interfaces:

- `domain/entities/ssh.entity.ts` - Core domain entities like SshSession, SshStatusMessage, etc.
- `domain/repositories/ssh-repository.interface.ts` - Repository interface defining data access methods

### Application Layer

Contains the service interfaces and implementations:

- `application/interfaces/ssh-connection-service.interface.ts` - Service interface for SSH connections
- `application/interfaces/ssh-terminal-service.interface.ts` - Service interface for terminal operations
- `application/services/ssh-connection.service.ts` - Service implementation for SSH connections
- `application/services/ssh-terminal.service.ts` - Service implementation for terminal operations

### Infrastructure Layer

Contains the repository implementations:

- `infrastructure/repositories/ssh.repository.ts` - Repository implementation for data access

### Presentation Layer

Contains the gateways and DTOs:

- `presentation/gateways/ssh.gateway.ts` - WebSocket gateway for client communication
- `presentation/dtos/ssh-session.dto.ts` - Data Transfer Objects for client-server communication

## Key Features

- Secure SSH connections to remote devices
- Interactive terminal sessions
- Session management for multiple clients
- Terminal resizing
- WebSocket-based real-time communication

## Usage

The SSH Module is used through WebSocket connections. Clients connect to the `/ssh` namespace and can perform various operations:

- Start a terminal session with a remote device
- Send terminal commands
- Resize the terminal
- Close the terminal session

## Dependencies

- Socket.IO: For WebSocket communication
- ssh2: For SSH functionality
- Device authentication: For retrieving device credentials

## Testing

The module includes tests for each layer:

- `__tests__/application/ssh-connection.service.spec.ts` - Tests for the connection service
- `__tests__/application/ssh-terminal.service.spec.ts` - Tests for the terminal service
- `__tests__/infrastructure/ssh.repository.spec.ts` - Tests for the repository implementation
- `__tests__/presentation/ssh.gateway.spec.ts` - Tests for the WebSocket gateway 