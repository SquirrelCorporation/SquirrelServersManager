# Diagnostic Module

## Overview
The Diagnostic Module provides functionality to perform diagnostic checks on connected devices within the Squirrel Servers Manager (SSM) application. It allows administrators to verify connectivity, resource availability, and system health for managed servers.

## Architecture
The Diagnostic Module follows the NestJS component-based design pattern and has been refactored to improve modularity and testability. It consists of:

- **DiagnosticModule**: The main NestJS module that provides the DiagnosticService.
- **DiagnosticService**: The core service that performs diagnostic checks.
- **DiagnosticController**: REST API endpoints for triggering diagnostic operations.
- **EventEmitterService**: Service for emitting diagnostic check events.

## Components

### DiagnosticService
The DiagnosticService is responsible for:
- Executing a sequence of diagnostic checks on target devices
- Verifying SSH connectivity for both Ansible and Docker operations
- Checking Docker socket connectivity
- Monitoring disk space availability
- Retrieving CPU and memory information
- Emitting events for each diagnostic check result

### Diagnostic Checks
The module performs the following diagnostic checks in sequence:
1. **SSH_CONNECT**: Verifies SSH connectivity for Ansible operations
2. **SSH_DOCKER_CONNECT**: Verifies SSH connectivity for Docker operations
3. **DOCKER_SOCKET**: Checks Docker socket connectivity
4. **DISK_SPACE**: Monitors available disk space
5. **CPU_MEMORY_INFO**: Retrieves CPU and memory usage information

### Integration with Event System
The module uses the NestJS event emitter system to publish diagnostic check results:
```typescript
this.eventEmitterService.emit(Events.DIAGNOSTIC_CHECK, {
  success: true,
  severity: 'success',
  module: 'DeviceDiagnostic',
  data: { check },
  message: `✅ Ssh connect check passed on ${sshOptionsAnsible.host}:${sshOptionsAnsible.port}`,
});
```

## Usage
The Diagnostic Module can be used through the REST API:

```typescript
// Trigger diagnostic checks for a device
POST /diagnostic/:uuid
```

## Testing
The Diagnostic Module includes comprehensive unit tests that verify:
- SSH connectivity check functionality
- Docker socket connectivity verification
- Disk space and system resource monitoring
- Event emission for diagnostic results

Tests use Vitest for mocking dependencies such as SSH connections and Docker socket communication.

## Dependencies
- ssh2: For SSH connection handling
- docker-modem: For Docker socket connectivity
- @nestjs/event-emitter: For event management
- ssm-shared-lib: For shared diagnostic enums

## Recent Changes
- Migrated from legacy implementation to NestJS patterns
- Updated diagnostic check logic with improved error handling
- Fixed enum usage (SsmDeviceDiagnostic.Checks vs SsmDeviceDiagnostic.Check)
- Implemented proper error rejection in connectivity checks
- Added TypeScript strict property initialization for DTOs
- Standardized diagnostic check sequence
