# MCP Server Implementation Plan

*This document outlines the steps to implement the MCP (Management and Control Plane) server features.*

*(... Placeholder for potential previous tasks ...)*

*   **23. Task:** Refactor MCP Services to Forward Requests to Core Modules
    *   **23.1.** Define a common NestJS client (`ClientProxy`) for core communication. **(DONE)**
    *   **23.2.** Inject `ClientProxy` into MCP services (`McpDevicesService`, `McpContainersService`, `McpStatsService`). **(DONE)**
    *   **23.3.** Modify MCP service methods to `send` messages via `ClientProxy` instead of calling core services directly. **(DONE)**
    *   **23.4.** Define message patterns (e.g., `{ cmd: 'core_get_devices' }`) for core module handlers. **(DONE - implicitly via sends)**
    *   **23.5.** Ensure DTOs are correctly passed in payloads. **(DONE)**
    *   **23.6.** Update relevant modules (`McpModule`, core modules) to provide/register the `ClientProxy`. **(DONE)**
    *   **23.7.** Add error handling for `ClientProxy` communication failures (e.g., core service unavailable). **(DONE - basic logging implemented)**
    *   **23.8.** Implement `@MessagePattern` handlers in core services (`DevicesService` (**DONE**), `ContainersService` (**DONE**), `StatisticsService` (**DONE**)) to receive messages from MCP services via the `CORE_SERVICE_CLIENT`. **(DONE)**

*   **24. Task:** Implement End-to-End Tests for MCP-Core Communication
    *   **24.1.** Set up testing environment/framework for microservice interaction tests. **(DONE)**
    *   **24.2.** Write test for `StatsService` (`core_get_timeseries_stats`). **(DONE)**
    *   **24.3.** Write test for `DeviceService` (`core_find_all_devices`). **(DONE)**
    *   **24.4.** Write test for `DeviceService` (`core_find_device_by_id`). **(DONE)**
    *   **24.5.** Write test for `ContainerService` (`core_find_all_containers`). **(DONE)**
    *   **24.6.** Write test for `ContainerService` (`core_find_container_by_id`). **(DONE)**

*   **25. Task:** Refactor MCP Module to Clean Architecture
    *   **25.1.** Create `application/services` and `application/dto` directories.
    *   **25.2.** Move existing `*.service.ts` files to `application/services/`.
    *   **25.3.** Move existing DTO files from `dto/` to `application/dto/`.
    *   **25.4.** Update imports in moved files.
    *   **25.5.** Update `mcp.module.ts` provider paths and imports.
    *   **25.6.** Update E2E test import paths (`server/src/__tests__/integration/modules/mcp/`).
    *   **25.7.** Delete old feature directories (`stats/`, `container/`, `device/`, `playbook/`, `dto/`).

*(... Placeholder for potential subsequent tasks ...)* 