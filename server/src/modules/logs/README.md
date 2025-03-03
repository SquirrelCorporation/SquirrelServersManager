# Logs Module

## Overview

The Logs module provides a comprehensive system for managing server logs and Ansible task execution logs within the Squirrel Servers Manager application. It allows users to view, search, and manage logs for both server activities and Ansible automation tasks.

## Architecture

The module follows NestJS architectural patterns and best practices:

### Core Components

1. **Module Structure**
   - `logs.module.ts` - NestJS module definition
   - `services/` - Business logic services
   - `repositories/` - Data access layer
   - `schemas/` - Mongoose schemas for MongoDB
   - `dto/` - Data Transfer Objects for API requests/responses

2. **Services**
   - `server-logs.service.ts` - Manages server logs
   - `task-logs.service.ts` - Manages Ansible task logs

3. **Repositories**
   - `server-logs.repository.ts` - Data access for server logs
   - `ansible-logs.repository.ts` - Data access for Ansible logs
   - `ansible-task.repository.ts` - Data access for Ansible tasks

4. **Schemas**
   - `server-log.schema.ts` - Schema for server logs
   - `ansible-log.schema.ts` - Schema for Ansible logs
   - `ansible-task.schema.ts` - Schema for Ansible tasks

5. **Testing**
   - `tests/` - Organized test files mirroring the module structure

## Repository Pattern

The Logs module implements the repository pattern to abstract data access:

### Repository Classes

- **ServerLogsRepository**: Manages server log data
- **AnsibleLogsRepository**: Manages Ansible log data
- **AnsibleTaskRepository**: Manages Ansible task data

### Implementation Details

Each repository encapsulates Mongoose model operations:

```typescript
@Injectable()
export class ServerLogsRepository {
  constructor(@InjectModel(ServerLog.name) private serverLogModel: Model<ServerLog>) {}

  async findAll(): Promise<ServerLog[]> {
    return this.serverLogModel.find().sort({ time: -1 }).limit(10000).lean().exec();
  }

  async deleteAllOld(ageInDays: number): Promise<void> {
    await this.serverLogModel
      .deleteMany({
        time: { $lt: DateTime.now().minus({ day: ageInDays }).toJSDate() },
      })
      .exec();
  }

  async deleteAll(): Promise<void> {
    await this.serverLogModel.deleteMany().exec();
  }
}
```

## Service Layer

The service layer implements business logic and uses repositories for data access:

### Service Classes

- **ServerLogsService**: Business logic for server logs
- **TaskLogsService**: Business logic for Ansible task logs

### Implementation Details

Services use dependency injection to access repositories:

```typescript
@Injectable()
export class ServerLogsService {
  constructor(private readonly serverLogsRepository: ServerLogsRepository) {}

  async getServerLogs(serverId: string): Promise<ServerLog[]> {
    return this.serverLogsRepository.findAllByServerId(serverId);
  }

  async deleteServerLogs(serverId: string): Promise<void> {
    await this.serverLogsRepository.deleteAllByServerId(serverId);
  }
}
```

## Schema Design

The module uses Mongoose schemas with TypeScript interfaces:

### Schema Examples

```typescript
@Schema()
export class ServerLog {
  @Prop({ required: true })
  serverId!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: Date.now })
  time?: Date;
}

export const ServerLogSchema = SchemaFactory.createForClass(ServerLog);
export type ServerLogDocument = HydratedDocument<ServerLog>;
```

## Testing Strategy

The module follows a comprehensive testing strategy:

1. **Directory Structure**
   - Tests are organized in a dedicated `tests/` directory
   - The test directory structure mirrors the module structure

2. **Test Types**
   - Unit tests for repositories
   - Unit tests for services
   - Integration tests for service-repository interactions

3. **Mocking Approach**
   - Mongoose models are mocked to avoid actual database operations
   - External dependencies are mocked using Vitest's mocking capabilities

4. **Test File Naming**
   - Test files use the `.spec.ts` extension
   - Test files are named after the file they test

## Best Practices

When extending or modifying this module, follow these best practices:

1. **Repository Pattern**
   - Keep data access logic in repositories
   - Use dependency injection for repositories
   - Return plain objects from repositories using `.lean()`

2. **Type Safety**
   - Use TypeScript interfaces and types
   - Define document types for Mongoose models
   - Use proper type annotations for method parameters and return values

3. **Error Handling**
   - Use try/catch blocks for error handling
   - Log errors with context information
   - Return appropriate responses

4. **Testing**
   - Write tests for all new functionality
   - Mock external dependencies
   - Test error handling scenarios

## Recent Changes

- Migrated to NestJS architecture
- Implemented repository pattern for data access
- Enhanced type safety with TypeScript interfaces
- Improved error handling
- Added comprehensive unit tests
- Fixed TypeScript strict property initialization issues
