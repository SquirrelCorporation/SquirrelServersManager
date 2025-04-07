# DTO Implementation Plan

This document provides a detailed, module-by-module plan for strengthening DTO usage across the application. Each task includes a checkbox for tracking progress.

## Global Tasks

- [ ] Create a base pagination DTO that can be reused across modules
- [ ] Establish naming conventions document for team reference
- [ ] Set up global ValidationPipe in main.ts with appropriate options

## Devices Module

### Input DTOs
- [ ] Review and enhance validation in `CreateDeviceDto`
- [ ] Review and enhance validation in `UpdateDeviceDto`
- [ ] Create `DeviceQueryDto` for GET endpoints with filtering and pagination
- [ ] Standardize naming conventions across all device DTOs

### Response DTOs
- [ ] Create `DeviceResponseDto` for list responses
- [ ] Create `DeviceDetailResponseDto` for single device responses
- [ ] Create `DeviceStatusResponseDto` for status-related endpoints

### Mappers
- [ ] Enhance `DeviceMapper` to support all new response DTOs
- [ ] Add comprehensive unit tests for mapper functions

## Ansible Module

### Input DTOs
- [ ] Review and enhance validation in `TaskHookDto`
- [ ] Review and enhance validation in `TaskEventDto`
- [ ] Create `AnsiblePlaybookExecutionDto` for playbook execution
- [ ] Create `AnsibleGalaxyQueryDto` for galaxy search endpoints

### Response DTOs
- [ ] Create `AnsibleTaskResponseDto` for task responses
- [ ] Create `AnsiblePlaybookResponseDto` for playbook responses
- [ ] Create `AnsibleGalaxyCollectionResponseDto` for galaxy collection responses

### Mappers
- [ ] Create `AnsibleTaskMapper` for task-related DTOs
- [ ] Create `AnsiblePlaybookMapper` for playbook-related DTOs
- [ ] Create `AnsibleGalaxyMapper` for galaxy-related DTOs

## Containers Module

### Input DTOs
- [ ] Enhance validation in `CreateContainerDto`
- [ ] Create `UpdateContainerDto` with proper validation
- [ ] Create `ContainerQueryDto` for list endpoints
- [ ] Create `ContainerNetworkDto` and `ContainerVolumeDto` with validation

### Response DTOs
- [ ] Create `ContainerResponseDto` for list responses
- [ ] Create `ContainerDetailResponseDto` for single container responses
- [ ] Create `ContainerStatusResponseDto` for status endpoints
- [ ] Create `ContainerDiagnosticResponseDto` for diagnostic endpoints

### Mappers
- [ ] Enhance `ContainerMapper` to support all new response DTOs
- [ ] Create mappers for container networks and volumes
- [ ] Add unit tests for all mapper functions

## Container Stacks Module

### Input DTOs
- [ ] Create `CreateContainerStackDto` with validation
- [ ] Create `UpdateContainerStackDto` with validation
- [ ] Create `ContainerStackQueryDto` for list endpoints

### Response DTOs
- [ ] Create `ContainerStackResponseDto` for list responses
- [ ] Create `ContainerStackDetailResponseDto` for single stack responses
- [ ] Create `ContainerStackRepositoryResponseDto` for repository endpoints

### Mappers
- [ ] Create `ContainerStackMapper` for stack-related DTOs
- [ ] Create `ContainerStackRepositoryMapper` for repository-related DTOs

## Playbooks Module

### Input DTOs
- [ ] Create `CreatePlaybookDto` with validation
- [ ] Create `UpdatePlaybookDto` with validation
- [ ] Create `PlaybookExecutionDto` for execution endpoints
- [ ] Create `PlaybookQueryDto` for list endpoints

### Response DTOs
- [ ] Create `PlaybookResponseDto` for list responses
- [ ] Create `PlaybookDetailResponseDto` for single playbook responses
- [ ] Create `PlaybookExecutionResponseDto` for execution results

### Mappers
- [ ] Create `PlaybookMapper` for playbook-related DTOs
- [ ] Create `PlaybookExecutionMapper` for execution-related DTOs

## Notifications Module

### Input DTOs
- [ ] Create `CreateNotificationDto` with validation
- [ ] Create `UpdateNotificationDto` with validation
- [ ] Create `NotificationQueryDto` for list endpoints

### Response DTOs
- [ ] Create `NotificationResponseDto` for list responses
- [ ] Create `NotificationCountResponseDto` for count endpoint

### Mappers
- [ ] Create `NotificationMapper` for notification-related DTOs

## Users Module

### Input DTOs
- [ ] Enhance validation in `LoginDto`
- [ ] Create `CreateUserDto` with proper validation
- [ ] Create `UpdateUserDto` with proper validation

### Response DTOs
- [ ] Enhance `LoginResponseDto` if needed
- [ ] Create `UserResponseDto` for user data responses
- [ ] Create `UserListResponseDto` for list responses

### Mappers
- [ ] Enhance `UserMapper` to use the new response DTOs
- [ ] Add unit tests for mapper functions

## SFTP Module

### Input DTOs
- [ ] Review and enhance validation in existing DTOs
- [ ] Create any missing DTOs for SFTP operations

### Response DTOs
- [ ] Create `SftpDirectoryListResponseDto` for directory listing
- [ ] Create `SftpFileResponseDto` for file operations

### Mappers
- [ ] Create `SftpMapper` for SFTP-related DTOs

## Diagnostic Module

### Input DTOs
- [ ] Review and enhance validation in `DiagnosticParamDto`
- [ ] Create any missing input DTOs

### Response DTOs
- [ ] Review and enhance `DiagnosticReportDto` and `DiagnosticResultDto`
- [ ] Create any missing response DTOs

### Mappers
- [ ] Review and enhance `DiagnosticMapper`
- [ ] Add unit tests for mapper functions

## Smart Failure Module

### Input DTOs
- [ ] Enhance validation in `SmartFailureRequestDto`
- [ ] Create any missing input DTOs

### Response DTOs
- [ ] Create `SmartFailureResponseDto` for analysis results

### Mappers
- [ ] Create `SmartFailureMapper` for smart failure-related DTOs

## Scheduler Module

### Input DTOs
- [ ] Create `CreateCronDto` with validation
- [ ] Create `UpdateCronDto` with validation

### Response DTOs
- [ ] Create `CronResponseDto` for cron job responses

### Mappers
- [ ] Create `CronMapper` for cron-related DTOs

## Statistics Module

### Input DTOs
- [ ] Create `StatisticsQueryDto` for statistics endpoints

### Response DTOs
- [ ] Create `DashboardPerformanceResponseDto` for performance stats
- [ ] Create `DashboardAvailabilityResponseDto` for availability stats

### Mappers
- [ ] Create `StatisticsMapper` for statistics-related DTOs

## Remote System Information Module

### Input DTOs
- [ ] Create input DTOs for remote system information endpoints

### Response DTOs
- [ ] Create `SystemInformationResponseDto` for system information
- [ ] Create `DiagnosticConnectionResponseDto` for connection testing

### Mappers
- [ ] Create `RemoteSystemInformationMapper` for related DTOs

## Automations Module

### Input DTOs
- [ ] Create `CreateAutomationDto` with validation
- [ ] Create `UpdateAutomationDto` with validation
- [ ] Create `AutomationQueryDto` for list endpoints

### Response DTOs
- [ ] Create `AutomationResponseDto` for list responses
- [ ] Create `AutomationDetailResponseDto` for single automation responses
- [ ] Create `AutomationTemplateResponseDto` for template responses

### Mappers
- [ ] Create `AutomationMapper` for automation-related DTOs

## Testing and Documentation

- [ ] Create unit tests for all new DTOs and mappers
- [ ] Update API documentation to reflect new DTO structures
- [ ] Create examples of DTO usage for team reference

## Implementation Strategy

### Phase 1: Foundation (Weeks 1-2)
- [ ] Implement global tasks
- [ ] Focus on high-priority modules: Devices, Containers, Users

### Phase 2: Core Modules (Weeks 3-4)
- [ ] Implement DTOs for Ansible, Playbooks, Notifications modules
- [ ] Begin testing and documentation

### Phase 3: Remaining Modules (Weeks 5-6)
- [ ] Implement DTOs for remaining modules
- [ ] Complete testing and documentation

### Phase 4: Review and Refinement (Weeks 7-8)
- [ ] Review implementation across all modules
- [ ] Refine and standardize as needed
- [ ] Complete final documentation
