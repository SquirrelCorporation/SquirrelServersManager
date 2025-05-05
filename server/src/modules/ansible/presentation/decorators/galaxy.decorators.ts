import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';
import {
  CollectionQueryDto,
  CollectionsQueryDto,
  InstallCollectionDto,
} from '../dtos/galaxy-collection.dto';
import { CollectionsPaginatedResponseDto } from '../dtos/galaxy-response.dto';

export const GALAXY_TAG = 'AnsibleGalaxyCollections';

export function SearchCollectionsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Search for Ansible Galaxy collections' }),
    ApiQuery({ type: CollectionsQueryDto }),
    ApiResponse({
      status: 200,
      description: 'List of collections with pagination',
      type: CollectionsPaginatedResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid query parameters',
      type: ApiErrorResponse,
    }),
  );
}

export function GetCollectionDetailsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get details of a specific Ansible Galaxy collection' }),
    ApiQuery({ type: CollectionQueryDto }),
    ApiResponse({
      status: 200,
      description: 'Collection details',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          namespace: { type: 'string' },
          version: { type: 'string' },
          description: { type: 'string' },
          // Add other collection properties as needed
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid query parameters',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Collection not found',
      type: ApiErrorResponse,
    }),
  );
}

export function InstallCollectionDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Install an Ansible Galaxy collection' }),
    ApiBody({ type: InstallCollectionDto }),
    ApiResponse({
      status: 201,
      description: 'Collection installed successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid collection data',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Installation failed',
      type: ApiErrorResponse,
    }),
  );
}
