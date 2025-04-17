import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const CONTAINER_STACK_REPOSITORIES_TAG = 'ContainerStacksRepositories';

export const GetAllRepositoriesDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all container stack repositories' }),
    ApiResponse({
      status: 200,
      description: 'List of all container stack repositories',
      isArray: true,
      schema: { $ref: '#/components/schemas/ContainerCustomStackRepository' },
    }),
  );

export const GetRepositoryByUuidDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a container stack repository by UUID' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository',
      type: 'string',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'The container stack repository',
      schema: { $ref: '#/components/schemas/ContainerCustomStackRepository' },
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
    }),
  );

export const CreateRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new container stack repository' }),
    ApiResponse({
      status: 201,
      description: 'The created container stack repository',
      schema: { $ref: '#/components/schemas/ContainerCustomStackRepository' },
    }),
  );

export const UpdateRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a container stack repository' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to update',
      type: 'string',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'The updated container stack repository',
      schema: { $ref: '#/components/schemas/ContainerCustomStackRepository' },
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
    }),
  );

export const DeleteRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a container stack repository' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to delete',
      type: 'string',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'True if the repository was deleted successfully',
      type: Boolean,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
    }),
  );

export const ForcePullRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Force pull a container stack repository' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to force pull',
      type: 'string',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Repository pulled successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
    }),
  );

export const ForceCloneRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Force clone a container stack repository' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to force clone',
      type: 'string',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Repository cloned successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
    }),
  );

export const ForceRegisterRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Force register a container stack repository' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to force register',
      type: 'string',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Repository registered successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
    }),
  );

export const CommitAndSyncRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Commit and sync a container stack repository' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to commit and sync',
      type: 'string',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Repository committed and synced successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
    }),
  );

export const SyncToDatabaseRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Sync a container stack repository to database' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to sync to database',
      type: 'string',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Repository synced to database successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
    }),
  );
