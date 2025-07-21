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
# Shell Module

## Overview
The Shell Module provides a comprehensive interface for executing shell commands and managing file system operations within the Squirrel Servers Manager application. It serves as a foundational module that enables secure command execution, file system operations, Docker Compose management, playbook file handling, and SSH key management, all following Clean Architecture principles.

## Features
- Secure shell command execution and management
- File system operations (create, read, write, delete)
- Docker Compose operations management
- Ansible playbook file handling
- SSH key generation and management
- Error handling and recovery mechanisms
- Integration with Ansible Vaults
- Cross-platform compatibility
- Secure file permissions handling
- Asynchronous operation support

## Clean Architecture Implementation

### Domain Layer (`/domain`)
- **Interfaces**
  - `IShellWrapperService`: Shell command execution contract
  - `IFileSystemService`: File system operations contract
  - `IDockerComposeService`: Docker Compose operations contract
  - `IPlaybookFileService`: Playbook file operations contract
  - `ISshKeyService`: SSH key management contract

### Application Layer (`/application`)
- **Services**
  - `ShellWrapperService`: Shell command execution implementation
    - Command execution
    - Process management
    - Output handling
  - `FileSystemService`: File system operations implementation
    - Directory operations
    - File operations
    - Permission management
  - `DockerComposeService`: Docker Compose operations
    - Compose file management
    - Container orchestration
  - `PlaybookFileService`: Playbook file operations
    - Playbook validation
    - File management
  - `SshKeyService`: SSH key management
    - Key generation
    - Key validation
    - Permission handling

### Infrastructure Layer (`/infrastructure`)
- Shell command execution implementations
- File system access implementations
- External library integrations:
  - shelljs integration
  - fs-extra integration

## Module Structure
```
shell/
├── __tests__/                  # Test files
│   ├── application/
│   │   └── services/          # Service tests
│   └── infrastructure/        # Infrastructure tests
├── application/
│   └── services/
│       ├── docker-compose.service.ts
│       ├── file-system.service.ts
│       ├── playbook-file.service.ts
│       ├── shell-wrapper.service.ts
│       └── ssh-key.service.ts
├── domain/
│   └── interfaces/
│       ├── docker-compose.interface.ts
│       ├── file-system.interface.ts
│       ├── playbook-file.interface.ts
│       ├── shell-wrapper.interface.ts
│       └── ssh-key.interface.ts
├── infrastructure/            # Implementation details
├── index.ts                   # Public API exports
├── shell.module.ts            # Module definition
└── README.md
```

## API Endpoints
### Service Methods
- **Shell Wrapper Service**
  - `executeCommand(command: string)`: Execute shell command
  - `executeCommandWithOutput(command: string)`: Execute with output capture

- **File System Service**
  - `createDirectory(path: string)`: Create directory
  - `writeFile(path: string, content: string)`: Write file
  - `readFile(path: string)`: Read file
  - `deleteFile(path: string)`: Delete file
  - `chmod(path: string, mode: string)`: Change permissions

- **Docker Compose Service**
  - `validateComposeFile(path: string)`: Validate compose file
  - `executeCompose(command: string)`: Execute compose command

- **SSH Key Service**
  - `generateKey(options: KeyOptions)`: Generate SSH key pair
  - `validateKey(path: string)`: Validate SSH key
  - `getPublicKey(path: string)`: Get public key content

## Recent Changes
- Added Docker Compose service integration
- Enhanced SSH key management capabilities
- Improved file system error handling
- Added playbook file validation
- Implemented secure permission handling
- Enhanced cross-platform compatibility
