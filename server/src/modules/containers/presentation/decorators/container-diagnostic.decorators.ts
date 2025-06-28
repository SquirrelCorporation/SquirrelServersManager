import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';
import { PreCheckDockerConnectionDto } from '../dtos/pre-check-docker-connection.dto';

export const CONTAINER_DIAGNOSTIC_TAG = 'ContainerDiagnostic';

export const ContainerDiagnosticControllerDocs = () =>
  applyDecorators(ApiTags(CONTAINER_DIAGNOSTIC_TAG));

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

export function PreCheckDockerConnectionDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Pre-check Docker connection with provided credentials',
      description:
        'Attempts to establish a connection using provided SSH/Docker details without relying on a saved device configuration. Useful for initial setup or testing connection parameters.',
    }),
    ApiBody({ type: PreCheckDockerConnectionDto }),
    ApiResponse({
      status: 200,
      description: 'Docker connection pre-check successful',
      schema: {
        type: 'object',
        properties: {
          connected: {
            type: 'boolean',
            description: 'Whether Docker connection could be established with provided details',
          },
          message: {
            type: 'string',
            description: 'Details about the connection attempt outcome',
          },
          dockerVersion: {
            type: 'string',
            description: 'Detected Docker version if connection successful',
            nullable: true,
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input parameters provided',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to perform Docker connection pre-check',
      type: ApiErrorResponse,
    }),
  );
}
