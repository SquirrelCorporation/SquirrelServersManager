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
# SSH Module

## Overview
The SSH Module provides secure shell terminal functionality within the Squirrel Servers Manager application. It enables real-time terminal access to remote devices through WebSocket connections, implementing secure SSH protocol handling and terminal management.

## Features
- Real-time terminal sessions via WebSocket connections
- Secure SSH connection management
- Terminal resizing support
- Multi-client session handling
- Automatic session cleanup and resource management
- Event-based communication system
- Error handling and recovery mechanisms
- Integration with device management system

## Clean Architecture Implementation

### Domain Layer (`/domain`)
- **Entities**
  - `SshSession`: Core entity representing an SSH terminal session
- **Interfaces**
  - `ISshTerminalService`: Terminal service contract
  - `ISshGatewayService`: WebSocket gateway service contract
  - `ISshConnectionService`: SSH connection management contract

### Application Layer (`/application`)
- **Services**
  - `SshTerminalService`: Implements terminal session management
    - Session creation and termination
    - Data transmission
    - Terminal resizing
    - Client session tracking

### Infrastructure Layer (`/infrastructure`)
- Utilizes `SshInfrastructureModule` for:
  - SSH connection handling
  - Authentication management
  - Network communication

### Presentation Layer (`/presentation`)
- **Gateways**
  - `SshGateway`: WebSocket gateway for real-time communication
    - Client connection management
    - Event handling
    - Data streaming

## Module Structure
```
ssh/
├── __tests__/           # Test files
├── application/
│   └── services/
│       └── ssh-terminal.service.ts
├── domain/
│   ├── entities/
│   ├── interfaces/
│   └── repositories/
├── infrastructure/      # SSH infrastructure implementation
├── presentation/
│   └── gateways/
│       └── ssh.gateway.ts
├── index.ts            # Module exports
├── ssh.module.ts       # Module definition
└── README.md
```

## API Endpoints (WebSocket)
### Events
- **Client -> Server**
  - `ssh:create`: Create new SSH session
  - `ssh:data`: Send terminal input
  - `ssh:resize`: Resize terminal window
  - `ssh:close`: Close SSH session

- **Server -> Client**
  - `ssh:new-data`: Terminal output data
  - `ssh:status`: Connection status updates
  - `ssh:error`: Error notifications

## Recent Changes
- Added multi-client session support
- Improved error handling and recovery
- Enhanced terminal resize functionality
- Added automatic session cleanup
- Implemented connection status monitoring