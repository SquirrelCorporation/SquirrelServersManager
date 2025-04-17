import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';
import { GitRepositoryDto, GitRepositoryResponseDto } from '../dtos/git-repository.dto';

export const GIT_REPOSITORIES_TAG = 'GitPlaybooksRepositories';

export const AddGitRepository = () =>
  applyDecorators(
    ApiOperation({ summary: 'Add a new Git repository' }),
    ApiBody({ type: GitRepositoryDto }),
    ApiResponse({
      status: 201,
      description: 'Git repository added successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );

export const GetGitRepositories = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all Git repositories' }),
    ApiResponse({
      status: 200,
      description: 'List of Git repositories',
      type: GitRepositoryResponseDto,
      isArray: true,
    }),
  );

export const UpdateGitRepository = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a Git repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiBody({ type: GitRepositoryDto }),
    ApiResponse({
      status: 200,
      description: 'Git repository updated successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const DeleteGitRepository = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a Git repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiResponse({
      status: 200,
      description: 'Git repository deleted successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const ForcePullRepository = () =>
  applyDecorators(
    ApiOperation({ summary: 'Force pull a Git repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiResponse({
      status: 200,
      description: 'Repository pulled successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const ForceCloneRepository = () =>
  applyDecorators(
    ApiOperation({ summary: 'Force clone a Git repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiResponse({
      status: 200,
      description: 'Repository cloned successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const CommitAndSyncRepository = () =>
  applyDecorators(
    ApiOperation({ summary: 'Commit and sync a Git repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiResponse({
      status: 200,
      description: 'Repository committed and synced successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const ForceRegisterRepository = () =>
  applyDecorators(
    ApiOperation({ summary: 'Force register a Git repository' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiResponse({
      status: 200,
      description: 'Repository registered successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );

export const SyncToDatabaseRepository = () =>
  applyDecorators(
    ApiOperation({ summary: 'Sync a Git repository to database' }),
    ApiParam({ name: 'uuid', description: 'Repository UUID' }),
    ApiResponse({
      status: 200,
      description: 'Repository synced to database successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Repository not found',
      type: ApiErrorResponse,
    }),
  );
