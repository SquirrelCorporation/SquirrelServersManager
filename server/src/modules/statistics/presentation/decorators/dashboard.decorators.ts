import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';

export const DASHBOARD_TAG = 'DashboardStats';

export function GetDashboardPerformanceStatsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get system performance statistics for the dashboard',
      description: 'Retrieves aggregated system performance metrics for dashboard display',
    }),
    ApiResponse({
      status: 200,
      description: 'System performance statistics retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          cpu: { type: 'number' },
          memory: { type: 'number' },
          storage: { type: 'number' },
        },
      },
    }),
  );
}

export function GetDashboardAvailabilityStatsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get device availability statistics',
      description: 'Retrieves device availability metrics and historical data',
    }),
    ApiResponse({
      status: 200,
      description: 'Device availability statistics retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          availability: { type: 'number' },
          lastMonth: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                value: { type: 'number' },
              },
            },
          },
          byDevice: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                deviceId: { type: 'string' },
                availability: { type: 'number' },
              },
            },
          },
        },
      },
    }),
  );
}

export function GetSingleAveragedStatsByDevicesAndTypeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get averaged statistics by devices and type',
      description:
        'Retrieves averaged statistics for specified devices and metric type within a date range',
    }),
    ApiParam({
      name: 'type',
      description: 'Type of statistic to retrieve (e.g., cpu, memory, storage)',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'from',
      description: 'Start date for statistics (YYYY-MM-DD)',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'to',
      description: 'End date for statistics (YYYY-MM-DD)',
      required: true,
      type: 'string',
    }),
    ApiBody({
      description: 'List of device UUIDs to query',
      required: true,
      schema: {
        type: 'object',
        properties: {
          devices: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of device UUIDs',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Averaged statistics retrieved successfully',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            value: { type: 'number' },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Missing or invalid parameters',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - One or more devices not found',
      type: ApiErrorResponse,
    }),
  );
}

export function GetStatsByDevicesAndTypeDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get detailed statistics by devices and type',
      description:
        'Retrieves detailed statistics for specified devices and metric type within a date range',
    }),
    ApiParam({
      name: 'type',
      description: 'Type of statistic to retrieve (e.g., cpu, memory, storage)',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'from',
      description: 'Start date for statistics (YYYY-MM-DD)',
      required: true,
      type: 'string',
    }),
    ApiQuery({
      name: 'to',
      description: 'End date for statistics (YYYY-MM-DD)',
      required: true,
      type: 'string',
    }),
    ApiBody({
      description: 'List of device UUIDs to query',
      required: true,
      schema: {
        type: 'object',
        properties: {
          devices: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of device UUIDs',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Statistics retrieved successfully',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  value: { type: 'number' },
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Missing or invalid parameters',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - One or more devices not found',
      type: ApiErrorResponse,
    }),
  );
}
