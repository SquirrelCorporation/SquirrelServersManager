import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';

export const CONTAINER_STACKS_TAG = 'ContainerStacks';

export const GetAllStacksDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all container stacks' }),
    ApiResponse({
      status: 200,
      description: 'List of all container stacks',
      isArray: true,
      schema: { $ref: '#/components/schemas/ContainerCustomStack' },
    }),
  );

export const CreateStackDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new container stack' }),
    ApiResponse({
      status: 201,
      description: 'Container stack created successfully',
      schema: { $ref: '#/components/schemas/ContainerCustomStack' },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid stack configuration',
      type: ApiErrorResponse,
    }),
  );

export const UpdateStackDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update an existing container stack' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the container stack',
      required: true,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Container stack updated successfully',
      schema: { $ref: '#/components/schemas/ContainerCustomStack' },
    }),
    ApiResponse({
      status: 404,
      description: 'Container stack not found',
      type: ApiErrorResponse,
    }),
  );

export const DeleteStackDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a container stack' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the container stack',
      required: true,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Container stack deleted successfully',
      type: Boolean,
    }),
    ApiResponse({
      status: 404,
      description: 'Container stack not found',
      type: ApiErrorResponse,
    }),
  );

export const DeployStackDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Deploy a container stack to a target device' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the container stack',
      required: true,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Stack deployment initiated successfully',
      schema: {
        type: 'object',
        properties: {
          execId: {
            type: 'string',
            description: 'Execution ID for tracking the deployment',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Container stack or target device not found',
      type: ApiErrorResponse,
    }),
  );

export const TransformStackDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Transform a container stack configuration to YAML' }),
    ApiResponse({
      status: 200,
      description: 'Stack configuration transformed successfully',
      schema: {
        type: 'object',
        properties: {
          yaml: {
            type: 'string',
            description: 'YAML representation of the stack',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid stack configuration',
      type: ApiErrorResponse,
    }),
  );

export const DryRunStackDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Validate a container stack configuration' }),
    ApiResponse({
      status: 200,
      description: 'Stack validation result',
      schema: {
        type: 'object',
        properties: {
          validating: {
            type: 'boolean',
            description: 'Whether the validation is successful',
          },
          message: {
            type: 'string',
            description: 'Optional validation message',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid stack configuration',
      type: ApiErrorResponse,
    }),
  );
