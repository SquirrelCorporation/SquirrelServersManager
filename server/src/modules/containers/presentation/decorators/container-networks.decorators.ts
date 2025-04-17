import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';

export const CONTAINER_NETWORKS_TAG = 'ContainerNetworks';

export function GetNetworksDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all container networks with pagination and filtering' }),
    ApiQuery({
      name: 'current',
      required: false,
      type: Number,
      description: 'Current page number',
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: Number,
      description: 'Number of items per page',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Filter by network name',
    }),
    ApiQuery({
      name: 'scope',
      required: false,
      type: String,
      description: 'Filter by network scope',
    }),
    ApiQuery({
      name: 'driver',
      required: false,
      type: String,
      description: 'Filter by network driver',
    }),
    ApiQuery({
      name: 'deviceUuid',
      required: false,
      type: String,
      description: 'Filter by device UUID',
    }),
    ApiResponse({
      status: 200,
      description: 'List of container networks with pagination',
      type: PaginatedResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid query parameters',
      type: ApiErrorResponse,
    }),
  );
}

export function CreateNetworkDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new container network' }),
    ApiParam({ name: 'deviceUuid', description: 'UUID of the device to create the network on' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['config', 'target'],
        properties: {
          config: {
            type: 'object',
            required: ['name', 'network', 'v4_subnet', 'v4_gateway', 'v4_range'],
            properties: {
              name: { type: 'string', description: 'Network name' },
              network: { type: 'string', description: 'Network identifier' },
              v4_subnet: { type: 'string', description: 'IPv4 subnet' },
              v4_gateway: { type: 'string', description: 'IPv4 gateway' },
              v4_range: { type: 'string', description: 'IPv4 range' },
              v6_subnet: { type: 'string', description: 'IPv6 subnet (optional)' },
              v6_gateway: { type: 'string', description: 'IPv6 gateway (optional)' },
              v6_range: { type: 'string', description: 'IPv6 range (optional)' },
              v4_excludedIps: {
                type: 'array',
                items: { type: 'string' },
                description: 'IPv4 addresses to exclude (optional)',
              },
              v6_excludedIps: {
                type: 'array',
                items: { type: 'string' },
                description: 'IPv6 addresses to exclude (optional)',
              },
              labels: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    value: { type: 'string' },
                  },
                },
                description: 'Network labels (optional)',
              },
            },
          },
          target: { type: 'string', description: 'Target device for network creation' },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Network creation initiated',
      schema: {
        type: 'object',
        properties: {
          execId: { type: 'string', description: 'Execution ID for tracking the creation process' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid network configuration',
      type: ApiErrorResponse,
    }),
  );
}

export function DeleteNetworkDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a container network' }),
    ApiParam({ name: 'uuid', description: 'UUID of the network to delete' }),
    ApiResponse({
      status: 200,
      description: 'Network deleted successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Network not found',
      type: ApiErrorResponse,
    }),
  );
}
