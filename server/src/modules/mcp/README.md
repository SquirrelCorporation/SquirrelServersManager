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

*   **MCP Server Management:** Enables/disables the MCP server.
*   **Agent Interaction:** Handles requests from connected agents.
*   **Context Provision:** Provides relevant system context to agents.
*   **Command Execution:** Facilitates execution of commands initiated by agents (delegating to relevant modules like Playbooks, Devices, etc.).
*   **Security:** (Potential future feature) Manages authentication/authorization for agents.

## Architecture

This module adheres to Clean Architecture principles:

*   **Domain:** Contains core MCP concepts, entities (like MCP Settings), and interfaces.
*   **Application:** Implements use cases like enabling/disabling the server, handling agent requests, and coordinating with other modules.
*   **Infrastructure:** Handles specific implementations, such as the MCP server itself (e.g., using Express or a dedicated library), persistence for MCP settings (if needed), and communication bridges to other modules.
*   **Presentation:** Exposes MCP management endpoints (e.g., via REST API for the frontend) and potentially handles the low-level details of the MCP server's communication protocol.

## Module Structure

```
server/src/modules/mcp
├── application/         # Application layer (use cases, services, DTOs, interfaces)
├── infrastructure/      # Infrastructure layer (transport, persistence, external integrations)
│   └── transport/         # Contains MCP server transport logic (e.g., mcp-transport.service.ts)
├── presentation/        # Presentation layer (API controllers, potentially gateways)
└── mcp.module.ts        # NestJS module definition
└── README.md            # This file
```

(Note: A dedicated `domain` layer is not present at the root level based on current structure. Domain entities/interfaces might reside within `application` or other layers.)

## Integration

*   **Imports:** `ConfigModule`, potentially modules like `DevicesModule`, `PlaybooksModule`, `ContainersModule` to interact with their services.
*   **Exports:** `McpService` (or similar application service), potentially specific MCP management controllers or services.

```typescript
// mcp.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// ... other imports like McpController, McpService, etc.

@Module({
  imports: [
    ConfigModule,
    // Potentially DevicesModule, PlaybooksModule, etc.
  ],
  controllers: [/* McpApiController */],
  providers: [/* McpService, McpServerProvider, etc. */],
  exports: [/* McpService */],
})
export class McpModule {}
```

## API Endpoints (Management API)

*(Example - Adapt based on actual implementation)*

*   `GET /api/mcp/settings`: Retrieves the current MCP server settings (e.g., enabled status).
*   `PUT /api/mcp/settings`: Updates the MCP server settings.

## MCP Protocol Endpoints

*(Example - These are handled by the MCP server implementation, not the management API)*

*   `mcp_get_tasks`: Request handled by the MCP server to retrieve task list.
*   `mcp_set_task_status`: Request handled by the MCP server to update a task status.
*   *(... other MCP tool endpoints defined in mcp.mdc)* 