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
# SFTP Module

## Overview

The SFTP Module provides secure file transfer functionality for remote devices. It enables users to browse, upload, download, and manage files on remote servers through a secure SFTP connection.

## Architecture

The SFTP Module follows the Clean Architecture pattern with proper separation of concerns:

### Domain Layer

Contains the core business entities and repository interfaces:

- `domain/entities/sftp.entity.ts` - Core domain entities like SftpSession, SftpStatusMessage, etc.
- `domain/repositories/sftp-repository.interface.ts` - Repository interface defining data access methods

### Application Layer

Contains the service interfaces and implementations:

- `application/interfaces/sftp-service.interface.ts` - Service interface defining business operations
- `application/services/sftp.service.ts` - Service implementation with business logic

### Infrastructure Layer

Contains the repository implementations and technical services:

- `infrastructure/repositories/sftp.repository.ts` - Repository implementation for data access
- `infrastructure/services/file-stream.service.ts` - Service for handling file streaming operations

### Presentation Layer

Contains the gateways and DTOs:

- `presentation/gateways/sftp.gateway.ts` - WebSocket gateway for client communication
- `presentation/dtos/sftp-session.dto.ts` - Data Transfer Objects for client-server communication

## Key Features

- Secure SFTP connections to remote devices
- Directory browsing and navigation
- File upload and download
- File and directory management (create, rename, delete, chmod)
- WebSocket-based real-time communication
- Session management for multiple clients

## Usage

The SFTP Module is used through WebSocket connections. Clients connect to the `/sftp` namespace and can perform various operations:

- Start a session with a remote device
- List directory contents
- Create directories
- Rename files and directories
- Change file permissions
- Delete files and directories
- Download files

## Dependencies

- SSH Module: For establishing secure SSH connections
- Socket.IO: For WebSocket communication
- ssh2: For SFTP functionality

## Testing

The module includes tests for each layer:

- `__tests__/application/sftp.service.spec.ts` - Tests for the service implementation
- `__tests__/infrastructure/sftp.repository.spec.ts` - Tests for the repository implementation
- `__tests__/presentation/sftp.gateway.spec.ts` - Tests for the WebSocket gateway 