import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';
import { ContainerStatParamDto, ContainerStatsQueryDto } from '../dtos/container-stats.dto';

export const CONTAINER_STATS_TAG = 'ContainerStats';

export function GetContainerStatDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get container statistics by UUID' }),
    ApiParam({
      name: 'id',
      description: 'Container ID',
      type: 'string',
    }),
    ApiParam({
      name: 'type',
      description: 'Stat type',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Container stat retrieved successfully',
      type: ContainerStatParamDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Container not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function GetContainerStatsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get container statistics with pagination and filtering' }),
    ApiParam({
      name: 'id',
      description: 'Container ID',
      type: 'string',
    }),
    ApiParam({
      name: 'type',
      description: 'Stat type',
      type: 'string',
    }),
    ApiQuery({
      name: 'from',
      description: 'Time range in hours (default: 24)',
      required: false,
      type: 'number',
    }),
    ApiResponse({
      status: 200,
      description: 'Container stats retrieved successfully',
      type: [ContainerStatsQueryDto],
    }),
    ApiResponse({
      status: 404,
      description: 'Container not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function GetContainerCountDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get container count statistics' }),
    ApiParam({
      name: 'status',
      description: 'Container status (or "all")',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Container count retrieved successfully',
      schema: {
        type: 'number',
        description: 'Number of containers',
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function GetAveragedStatsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get averaged container statistics' }),
    ApiResponse({
      status: 200,
      description: 'Averaged stats retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          cpu: {
            type: 'number',
            description: 'Average CPU usage',
          },
          memory: {
            type: 'number',
            description: 'Average memory usage',
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
