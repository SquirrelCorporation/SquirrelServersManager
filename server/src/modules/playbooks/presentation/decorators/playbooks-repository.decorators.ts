import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';

export const PLAYBOOKS_REPOSITORIES_TAG = 'PlaybooksRepositories';

export const GetPlaybooksRepositoriesDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all playbooks repositories' }),
    ApiResponse({
      status: 200,
      description: 'List of playbooks repositories',
      type: ApiSuccessResponse,
    }),
  );

export const AddDirectoryToPlaybookRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Add a directory to a playbook repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiParam({ name: 'directoryName', description: 'Directory name' }),
    ApiBody({
      schema: {
        properties: {
          fullPath: { type: 'string', description: 'Full path to the directory' },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Directory added successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const AddPlaybookToRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Add a playbook to a repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiParam({ name: 'playbookName', description: 'Playbook name' }),
    ApiBody({
      schema: {
        properties: {
          fullPath: { type: 'string', description: 'Full path to the playbook' },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Playbook added successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const DeletePlaybookFromRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a playbook from a repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiParam({ name: 'playbookUuid', description: 'Playbook UUID' }),
    ApiResponse({
      status: 200,
      description: 'Playbook deleted successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository or playbook not found',
      type: ApiErrorResponse,
    }),
  );

export const DeleteDirectoryFromRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a directory from a repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiBody({
      schema: {
        properties: {
          fullPath: { type: 'string', description: 'Full path to the directory' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Directory deleted successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const SavePlaybookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Save a playbook' }),
    ApiParam({ name: 'playbookUuid', description: 'Playbook UUID' }),
    ApiBody({
      schema: {
        properties: {
          content: { type: 'string', description: 'Playbook content' },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Playbook saved successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Playbook not found',
      type: ApiErrorResponse,
    }),
  );

export const SyncRepositoryDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Sync a repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
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
  );
