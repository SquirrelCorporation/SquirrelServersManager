import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';

export function CheckDockerConnectionDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Check Docker connection status for a device',
    }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the device to check Docker connection',
      type: 'string',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Docker connection check successful',
      schema: {
        type: 'object',
        properties: {
          connected: {
            type: 'boolean',
            description: 'Whether Docker is accessible on the device',
          },
          message: {
            type: 'string',
            description: 'Additional details about the connection status',
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Device not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to check Docker connection',
      type: ApiErrorResponse,
    }),
  );
}
