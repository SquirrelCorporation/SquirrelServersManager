import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';
import { GetContainerRegistryDto } from '../dtos/container-registry.dto';

export const CONTAINER_REGISTRIES_TAG = 'ContainerRegistries';

export function GetRegistriesDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all container registries' }),
    ApiResponse({
      status: 200,
      description: 'List of container registries',
      schema: {
        properties: {
          registries: {
            type: 'array',
            items: { $ref: '#/components/schemas/GetContainerRegistryDto' },
          },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function UpdateRegistryDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update registry authentication' }),
    ApiParam({
      name: 'name',
      description: 'Registry name',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Registry authentication updated successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Registry not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function CreateCustomRegistryDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a custom registry' }),
    ApiParam({
      name: 'name',
      description: 'Registry name',
      type: 'string',
    }),
    ApiResponse({
      status: 201,
      description: 'Custom registry created successfully',
      type: GetContainerRegistryDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Registry already exists',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function ResetRegistryDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Reset registry authentication' }),
    ApiParam({
      name: 'name',
      description: 'Registry name',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Registry authentication reset successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Registry not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function RemoveRegistryDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a custom registry' }),
    ApiParam({
      name: 'name',
      description: 'Registry name',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Registry removed successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Cannot remove non-custom registry',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Cannot delete non-custom registry provider',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Registry not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}
