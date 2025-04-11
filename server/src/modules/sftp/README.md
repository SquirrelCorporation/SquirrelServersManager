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
# SFTP Module

## Overview
The SFTP Module provides secure file transfer functionality within the Squirrel Servers Manager application. It enables real-time file operations on remote devices through WebSocket connections, implementing secure SFTP protocol handling and file management capabilities.

## Features
- Real-time file operations via WebSocket connections
- Secure SFTP connection management
- Directory browsing and navigation
- File upload and download capabilities
- File and directory management operations
- Multi-client session handling
- Automatic session cleanup and resource management
- Event-based communication system
- Error handling and recovery mechanisms
- Integration with SSH infrastructure

## Clean Architecture Implementation

### Domain Layer (`/domain`)
- **Entities**
  - `SftpSession`: Core entity representing an SFTP session
- **Interfaces**
  - `ISftpService`: SFTP service contract
  - `ISftpRepository`: Repository contract for SFTP operations
- **Repositories**
  - Repository interfaces for data access patterns

### Application Layer (`/application`)
- **Services**
  - `SftpService`: Implements SFTP operations
    - Session management
    - File operations
    - Directory operations
    - Permission management

### Infrastructure Layer (`/infrastructure`)
- **Services**
  - `FileStreamService`: Handles file streaming operations
- **Repositories**
  - `SftpRepository`: Implements SFTP repository interface
- Utilizes `SshInfrastructureModule` for:
  - SSH connection handling
  - Authentication management

### Presentation Layer (`/presentation`)
- **Gateways**
  - `SftpGateway`: WebSocket gateway for real-time communication
    - Client connection management
    - Event handling
    - File operation streaming

## Module Structure
```
sftp/
├── __tests__/           # Test files
├── application/
│   └── services/
│       └── sftp.service.ts
├── domain/
│   ├── entities/
│   ├── interfaces/
│   └── repositories/
├── infrastructure/
│   ├── services/
│   │   └── file-stream.service.ts
│   └── repositories/
│       └── sftp.repository.ts
├── presentation/
│   └── gateways/
│       └── sftp.gateway.ts
├── index.ts            # Module exports
├── sftp.module.ts      # Module definition
└── README.md
```

## API Endpoints (WebSocket)
### Events
- **Client -> Server**
  - `sftp:connect`: Initialize SFTP connection
  - `sftp:list`: List directory contents
  - `sftp:mkdir`: Create directory
  - `sftp:rename`: Rename file/directory
  - `sftp:chmod`: Change file permissions
  - `sftp:delete`: Delete file/directory
  - `sftp:upload`: Upload file
  - `sftp:download`: Download file
  - `sftp:disconnect`: Close SFTP connection

- **Server -> Client**
  - `sftp:data`: File/directory data
  - `sftp:progress`: Operation progress
  - `sftp:status`: Connection status updates
  - `sftp:error`: Error notifications

## Recent Changes
- Added multi-client session support
- Improved file streaming performance
- Enhanced error handling and recovery
- Added automatic session cleanup
- Implemented progress tracking for file operations 