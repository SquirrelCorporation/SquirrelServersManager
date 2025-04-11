```
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
# Automations Module

The Automations module is a NestJS implementation that provides a powerful automation engine for the Squirrel Servers Manager. It enables users to create, manage, and execute automated tasks and workflows, including container operations and Ansible playbook executions.

## Features

- **Automation Engine**
  - Component-based architecture
  - Dynamic registration and deregistration
  - State management
  - Error handling and recovery
  - Execution tracking

- **Automation Management**
  - CRUD operations for automations
  - Template-based automation creation
  - Enabled/disabled state control
  - Execution status tracking
  - Bulk operations support

- **Scheduling Capabilities**
  - Cron-based scheduling
  - Manual execution
  - Schedule management
  - Execution history

- **Integration Support**
  - Container operations
  - Ansible playbook execution
  - User management
  - Task logging
  - Volume management

## Architecture

The module follows Clean Architecture principles with clear separation of concerns:

### Domain Layer
- **Entities**
  - `Automation`: Core automation entity
  - Automation chain definitions
  - Trigger specifications
  - Action definitions

- **Interfaces**
  - `IAutomationEngineService`: Engine service contract
  - `IAutomationsService`: Management service contract
  - `IAutomationRepository`: Data access contract

### Application Layer
- **Services**
  - `AutomationEngine`: Core automation engine
    - Component lifecycle management
    - Execution orchestration
    - State tracking
    - Error handling

  - `AutomationsService`: Automation management
    - CRUD operations
    - Template handling
    - Status management
    - Execution control

  - `AutomationComponent`: Individual automation handler
    - Trigger management
    - Action execution
    - State persistence
    - Error recovery

### Infrastructure Layer
- **Repositories**
  - `AutomationRepository`: Automation data persistence
  - MongoDB integration
  - Data mapping

### Presentation Layer
- **Controllers**
  - REST endpoints for automation management
  - Template retrieval
  - Execution control

- **DTOs**
  - `CreateAutomationDto`: Creation parameters
  - `UpdateAutomationDto`: Update parameters
  - Response structures

## API Endpoints

### Automation Management
```typescript
GET /automations
// Retrieve all automations

GET /automations/:uuid
// Get specific automation by UUID

PUT /automations/:name
// Create new automation
// Body: { rawChain: AutomationChain }

POST /automations/:uuid
// Update existing automation
// Body: { name: string, rawChain: AutomationChain }

DELETE /automations/:uuid
// Delete automation
```

### Execution Control
```typescript
POST /automations/:uuid/execute
// Manually execute automation
```

### Templates
```typescript
GET /automations/template/:templateId
// Get automation template
// Available templates:
// - Monthly device updates
// - Daily device reboots
// - Daily container restarts
```

## Integration

Import the module into your NestJS application:

```typescript
import { AutomationsModule } from './modules/automations';

@Module({
  imports: [AutomationsModule],
})
export class AppModule {}
```

## Recent Changes

- Enhanced automation engine reliability
- Added template-based automation creation
- Improved error handling and recovery
- Added execution status tracking
- Enhanced component lifecycle management

## Future Improvements

- Workflow visualization
- Advanced scheduling options
- Conditional execution paths
- Event-based triggers
- Automation chaining
- Performance analytics
