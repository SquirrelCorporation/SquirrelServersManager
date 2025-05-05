import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';
import { LocalRepositoryDto } from '@modules/playbooks/presentation/dtos/local-repository.dto';

export const LOCAL_PLAYBOOKS_REPOSITORIES_TAG = 'LocalPlaybooksRepositories';

export const GetLocalRepositoriesDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all local playbook repositories',
      description: 'Retrieves a list of all configured local Ansible playbook repositories',
    }),
    ApiResponse({
      status: 200,
      description: 'List of local repositories retrieved successfully',
      schema: {
        type: 'array',
        items: { $ref: '#/components/schemas/LocalRepositoryDto' },
      },
    }),
  );

export const UpdateLocalRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update a local playbook repository',
      description: 'Updates the configuration of an existing local Ansible playbook repository',
    }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to update',
      required: true,
    }),
    ApiBody({
      type: LocalRepositoryDto,
      description: 'Updated repository configuration',
    }),
    ApiResponse({
      status: 200,
      description: 'Repository updated successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const DeleteLocalRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete a local playbook repository',
      description: 'Removes a local Ansible playbook repository from the system',
    }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to delete',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Repository deleted successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const AddLocalRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Add a new local playbook repository',
      description: 'Configures a new local Ansible playbook repository in the system',
    }),
    ApiBody({
      type: LocalRepositoryDto,
      description: 'New repository configuration',
    }),
    ApiResponse({
      status: 201,
      description: 'Repository added successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid repository configuration',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error - Failed to add repository',
      type: ApiErrorResponse,
    }),
  );

export const SyncToDatabaseLocalRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Sync a local playbook repository to database',
      description:
        'Synchronizes the contents of a local Ansible playbook repository with the database',
    }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the repository to sync',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Repository synced successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error - Sync operation failed',
      type: ApiErrorResponse,
    }),
  );
