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
# MCP Module

## Overview

The MCP (Model Context Protocol) Module provides the core functionality for enabling and managing communication between the server backend and external AI agents or language models. It facilitates structured data exchange, allowing agents to query system state, execute commands, and interact with various modules through a defined protocol.

## Features

*   **MCP Server Management:** Enables/disables the MCP server via API and cache settings (`mcp.enabled`).
*   **Agent Authentication:** Authenticates agents using Bearer API keys associated with users.
*   **Agent Interaction:** Handles requests from connected agents according to the Model Context Protocol.
*   **Context Provision:** Provides relevant system context to agents via registered resource resolvers.
*   **Tool Execution:** Facilitates execution of commands (tools) initiated by agents (delegating to relevant modules like Playbooks, Devices, etc.), subject to permissions.
*   **Playbook Execution Permissions:** Controls which Ansible playbooks agents are allowed to execute via cache settings (`mcp.allowed_playbooks`) managed through the API.

## Architecture

This module adheres to Clean Architecture principles:

*   **Application:** Contains core logic, services (like handler registration), DTOs, constants (`mcp.constants.ts`), and interfaces.
*   **Infrastructure:** Handles specific implementations:
    *   `handlers/`: Contains the logic for specific MCP tools and resource resolvers (e.g., `playbook.handler.ts`).
    *   `transport/`: Manages the underlying MCP server connection, authentication, and session handling (`mcp-transport.service.ts`).
*   **Presentation:** Exposes MCP management endpoints via a REST API controller (`mcp-settings.controller.ts`) and includes related DTOs and Swagger decorators.

## Module Structure

```
server/src/modules/mcp
├── application/
│   ├── constants/         # Constants (e.g., cache keys)
│   └── services/          # Application services (handler registration, etc.)
├── infrastructure/
│   ├── handlers/          # Tool and resource resolver implementations
│   └── transport/         # MCP server transport, auth, session logic
├── presentation/
│   ├── controllers/       # REST API controllers for MCP management
│   ├── decorators/        # Swagger/API documentation decorators
│   └── dtos/              # Data Transfer Objects for the API
├── mcp.module.ts        # NestJS module definition
└── README.md            # This file
```

## Integration

*   **Imports:** `CacheModule`, `ConfigModule`, `UsersModule`, `EventsModule`, and modules required by specific handlers (e.g., `PlaybooksModule`, `DevicesModule`).
*   **Exports:** None currently. The module sets up the MCP transport and handlers internally.

```typescript
// mcp.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { McpSettingsController } from './presentation/controllers/mcp-settings.controller.ts';
import { McpHandlerRegistryService } from './application/services/mcp-handler-registry.service';
import { McpTransportService } from './infrastructure/transport/mcp-transport.service.ts';
import { UsersModule } from '@modules/users/users.module';
import { registerDeviceHandlers } from './infrastructure/handlers/device.handler';
// ... other handler imports ...

@Global() // If services need to be globally available
@Module({
  imports: [
    CacheModule.register(),
    UsersModule,
    // Import modules needed by handlers
  ],
  controllers: [McpSettingsController],
  providers: [
    McpHandlerRegistryService,
    McpTransportService,
    // Potentially provide handlers if they have dependencies
  ],
  exports: [],
})
export class McpModule {
  constructor(private readonly registryService: McpHandlerRegistryService) {}
  // Handler registration logic often happens in onModuleInit or constructor
}
```

## API Endpoints (Management API)

Managed by `McpSettingsController`:

*   `POST /api/settings/mcp/status`: Updates the MCP server enabled status (requires server restart). Body: `{ "enabled": boolean }`
*   `GET /api/settings/mcp/status`: Retrieves the current MCP server enabled status.
*   `PUT /api/settings/mcp/allowed-playbooks`: Updates the list of allowed playbooks. Body: `{ "allowed": string[] | "all" }`
*   `GET /api/settings/mcp/allowed-playbooks`: Retrieves the current allowed playbooks setting.

## MCP Protocol Handlers

These are registered within the `infrastructure/handlers/` directory and exposed via the MCP server transport. Examples:

*   `executePlaybook`: Executes an Ansible playbook (subject to permissions configured via the API).
*   `getPlaybookExecutionStatus`: Checks the status of a playbook run.
*   `list_resources` (for `devices://`): Lists available devices.
*   *(... other MCP tools and resource resolvers)*

## Configuration

*   **Cache:** MCP enabled status (`mcp.enabled`) and allowed playbooks (`mcp.allowed_playbooks`) are stored in the cache. Use constants `MCP_ENABLED_CACHE_KEY` and `MCP_ALLOWED_PLAYBOOKS_CACHE_KEY`.
*   **Authentication:** Requires a valid User API key passed as a Bearer token in the `Authorization` header of MCP requests.
*   **Port:** The MCP server listens on port 3001 by default (defined in `mcp-transport.service.ts`).
