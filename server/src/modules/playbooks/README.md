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
# Playbooks Module

This module provides functionality for managing playbooks and playbook repositories in the SSM application.

## Structure

The module is organized into the following components:

### Components
- `PlaybooksRepositoryComponent`: Base component for playbook repositories
- `GitPlaybooksRepositoryComponent`: Component for Git-based playbook repositories
- `LocalPlaybooksRepositoryComponent`: Component for local playbook repositories

### Services
- `PlaybooksRepositoryService`: Service for managing playbook repositories
- `GitPlaybooksRepositoryService`: Service for Git-based playbook repositories
- `LocalPlaybooksRepositoryService`: Service for local playbook repositories
- `PlaybooksRepositoryEngineService`: Service for managing playbook repository engines
- `PlaybookService`: Service for managing individual playbooks
- `TreeNodeService`: Service for managing tree nodes
- `DefaultPlaybooksRepositoriesService`: Service for managing default playbook repositories

### Controllers
- `PlaybooksRepositoryController`: Controller for playbook repositories
- `GitPlaybooksRepositoryController`: Controller for Git-based playbook repositories
- `LocalPlaybooksRepositoryController`: Controller for local playbook repositories
- `PlaybookController`: Controller for individual playbooks

### Repositories
- `PlaybooksRepositoryRepository`: Repository for playbook repositories
- `PlaybookRepository`: Repository for individual playbooks

### Schemas
- `PlaybookSchema`: Schema for individual playbooks
- `PlaybooksRepositorySchema`: Schema for playbook repositories

## Usage

To use this module, import it into your application:

```typescript
import { PlaybooksModule } from './modules/playbooks';
```

Then, you can inject the services into your controllers or other services:

```typescript
import { PlaybookService } from './modules/playbooks/services/playbook.service';

@Injectable()
export class YourService {
  constructor(private readonly playbookService: PlaybookService) {}
  
  // Use the service methods here
}
```

## API Endpoints

### Playbooks
- `GET /playbooks`: Get all playbooks
- `GET /playbooks/:uuid`: Get a playbook by UUID
- `PATCH /playbooks/:uuid`: Update a playbook
- `DELETE /playbooks/:uuid`: Delete a playbook
- `POST /playbooks/:uuid/extravars`: Add an extra var to a playbook
- `DELETE /playbooks/:uuid/extravars/:varname`: Delete an extra var from a playbook
- `POST /playbooks/exec/:uuid`: Execute a playbook
- `POST /playbooks/exec/quick-ref/:quickRef`: Execute a playbook by quick reference
- `POST /playbooks/exec/inventory/:uuid`: Execute a playbook on an inventory

### Playbook Repositories
- Various endpoints for managing playbook repositories

## Migration Notes

This module was migrated from the legacy Express-based implementation to a NestJS module. The migration involved:

1. Converting the Mongoose models to NestJS schemas
2. Converting the repository functions to NestJS repository services
3. Converting the use cases to NestJS services
4. Converting the Express routes to NestJS controllers
5. Updating the module to export all necessary components 
