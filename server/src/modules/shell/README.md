# Shell Module

## Overview
The Shell Module provides a reliable interface for executing shell commands and managing file system operations within the application. It serves as a foundation for various operations including Ansible command execution, Docker Compose management, file system manipulations, and SSH key management.

## Architecture
The Shell Module follows the NestJS component-based design pattern while maintaining backward compatibility with non-NestJS parts of the application. It consists of:

- **ShellModule**: The main NestJS module that provides all shell services.
- **ShellServices**: Individual services handling different types of shell operations.
- **Legacy Shell Managers**: Backward compatibility layer that redirects calls to the new NestJS services.

## Components

### Core Services
- **FileSystemService**: Handles file and directory operations like creating, deleting, copying files.
- **AnsibleCommandService**: Executes Ansible playbooks and commands.
- **DockerComposeService**: Manages Docker Compose operations.
- **PlaybookFileService**: Handles operations related to playbook files.
- **SshKeyService**: Manages SSH private key operations.

### Backward Compatibility Layer
The module maintains backward compatibility by:
1. Preserving the original exported interfaces
2. Using a facade pattern to redirect calls from legacy code to new NestJS services
3. Providing singleton-pattern compatibility for existing code

## Usage

### NestJS Style Usage
```typescript
// Import the service
import { FileSystemService } from './modules/shell/services/file-system.service';

// Inject in constructor
constructor(private readonly fileSystemService: FileSystemService) {}

// Use the service
this.fileSystemService.createDirectory('/path/to/dir');
```

### Legacy Style Usage
```typescript
// Continue using the original import
import Shell from './modules/shell';

// Use the familiar interface
Shell.FileSystemManager.createDirectory('/path/to/dir');
```

## Testing
The Shell Module includes comprehensive unit tests that verify:
- File system operations
- Ansible command execution
- Docker Compose operations
- SSH key management
- Error handling

## Dependencies
- shelljs: Core library for shell operations
- fs-extra: Extended file system operations
- @nestjs/common: NestJS framework

## Migration Notes
This module was migrated from a traditional singleton-based implementation to NestJS services while maintaining backward compatibility. The migration preserves all functionality and interfaces of the original implementation while adopting NestJS best practices.
