import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';
import { CreateVolumeDto } from '../dtos/create-volume.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';

export const CONTAINER_VOLUMES_TAG = 'ContainerVolumes';

export function GetVolumesDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all container volumes with pagination and filtering' }),
    ApiQuery({
      name: 'current',
      required: false,
      type: 'number',
      description: 'Current page number',
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: 'number',
      description: 'Number of items per page',
    }),
    ApiResponse({
      status: 200,
      description: 'List of volumes retrieved successfully',
      type: PaginatedResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function CreateVolumeDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new container volume' }),
    ApiBody({ type: CreateVolumeDto }),
    ApiResponse({
      status: 201,
      description: 'Volume created successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid input',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function GetVolumesByDeviceDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get container volumes by device UUID' }),
    ApiParam({
      name: 'deviceUuid',
      description: 'UUID of the device',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'List of volumes for the device',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            uuid: { type: 'string' },
            name: { type: 'string' },
            driver: { type: 'string' },
            scope: { type: 'string' },
            deviceUuid: { type: 'string' },
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

export function GetVolumeByUuidDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get container volume by UUID' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the volume',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Volume details retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          uuid: { type: 'string' },
          name: { type: 'string' },
          driver: { type: 'string' },
          scope: { type: 'string' },
          deviceUuid: { type: 'string' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Volume not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function DeleteVolumeDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a container volume' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the volume to delete',
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Volume deleted successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Volume not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function BackupVolumeDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a backup of a container volume' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the volume to backup',
      type: 'string',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            description: 'Backup mode',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Volume backup created successfully',
      schema: {
        type: 'object',
        properties: {
          filePath: { type: 'string' },
          fileName: { type: 'string' },
          mode: { type: 'string' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Volume not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}

export function DownloadBackupDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Download a container volume backup' }),
    ApiQuery({
      name: 'fileName',
      description: 'Name of the backup file to download',
      required: true,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'File download stream',
      schema: {
        type: 'string',
        format: 'binary',
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Backup file not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ApiErrorResponse,
    }),
  );
}
