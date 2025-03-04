# Container Stacks Module

The Container Stacks Module provides functionality for managing container stack repositories, including Git-based repositories for container stack definitions.

## Features

- Manage container stack repositories (Git-based)
- Clone, sync, and update container stack repositories
- Track repository status and errors
- Store and retrieve container stack definitions
- Support for different Git services (GitHub, GitLab, etc.)

## Architecture

The module follows a standard NestJS architecture with:

- **Controllers**: Handle HTTP requests and delegate to services
- **Services**: Implement business logic
- **Schemas**: Define data models
- **Repositories**: Handle database operations

### Controllers

- `ContainerStacksController`: Controller for container stack repository operations

### Services

- `ContainerStacksService`: Main service for managing container stacks and repositories
- `ContainerCustomStacksRepositoryEngineService`: Engine service for managing repository operations
- `ContainerRepositoryComponentService`: Component service for handling individual repository operations

### Schemas

- `ContainerCustomStackDocument`: Schema for container stack definitions
- `ContainerCustomStackRepositoryDocument`: Schema for container stack repositories

### Repositories

- `ContainerCustomStackRepository`: Repository for container stack operations
- `ContainerCustomStacksRepositoryRepository`: Repository for container stack repository operations

## API Endpoints

- `GET /container-stacks-repository`: Get all repositories
- `GET /container-stacks-repository/:uuid`: Get repository by UUID
- `POST /container-stacks-repository`: Add a new repository
- `PUT /container-stacks-repository/:uuid`: Update a repository
- `DELETE /container-stacks-repository/:uuid`: Delete a repository
- `PUT /container-stacks-repository/:uuid/reset-error`: Reset repository error

## Usage

The module is used by importing it into the application module:

```typescript
import { ContainerStacksModule } from './modules/container-stacks/container-stacks.module';

@Module({
  imports: [
    // ...
    ContainerStacksModule,
    // ...
  ],
})
export class AppModule {}
```

## Using the Services

### Managing Container Stack Repositories

```typescript
import { ContainerStacksService } from './modules/container-stacks/services/container-stacks.service';
import { SsmGit } from 'ssm-shared-lib';

@Injectable()
export class MyService {
  constructor(private readonly containerStacksService: ContainerStacksService) {}

  async addGitRepository(
    name: string,
    accessToken: string,
    branch: string,
    email: string,
    userName: string,
    remoteUrl: string,
    gitService: SsmGit.Services,
    matchesList?: string[],
    ignoreSSLErrors?: boolean,
  ) {
    return this.containerStacksService.addGitRepository(
      name,
      accessToken,
      branch,
      email,
      userName,
      remoteUrl,
      gitService,
      matchesList,
      ignoreSSLErrors,
    );
  }
}
```

### Working with the Repository Engine

```typescript
import { ContainerCustomStacksRepositoryEngineService } from './modules/container-stacks/services/container-stacks-repository-engine-service';

@Injectable()
export class MyService {
  constructor(
    private readonly repositoryEngineService: ContainerCustomStacksRepositoryEngineService,
  ) {}

  async initializeRepositories() {
    await this.repositoryEngineService.init();
  }

  async syncAllRepositories() {
    await this.repositoryEngineService.syncAllRegistered();
  }
}
``` 