import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';
import { UpdateDeviceAuthDto } from '../dtos/device-auth.dto';
import { UpdateDockerAuthDto } from '../dtos/update-docker-auth.dto';
import { UpdateProxmoxAuthDto } from '../dtos/update-proxmox-auth.dto';
import { DeviceAuthResponseDto } from '../dtos/device-auth-response.dto';

export const DEVICE_CREDENTIALS_TAG = 'DeviceCredentials';

export function GetDeviceAuthDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get device authentication details' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiResponse({
      status: 200,
      description: 'Device authentication details',
      type: DeviceAuthResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Device or device authentication not found',
      type: ApiErrorResponse,
    }),
  );
}

export function UpdateDeviceAuthDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update device authentication details' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiBody({
      type: UpdateDeviceAuthDto,
      description: 'Device authentication update data',
    }),
    ApiResponse({
      status: 200,
      description: 'Device authentication updated successfully',
      type: DeviceAuthResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Device or device authentication not found',
      type: ApiErrorResponse,
    }),
  );
}

export function DeleteDeviceAuthDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete device authentication' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiResponse({
      status: 200,
      description: 'Device authentication deleted successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Device or device authentication not found',
      type: ApiErrorResponse,
    }),
  );
}

export function UpdateDockerAuthDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Docker authentication details' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiBody({
      type: UpdateDockerAuthDto,
      description: 'Docker authentication update data',
    }),
    ApiResponse({
      status: 200,
      description: 'Docker authentication updated successfully',
      type: DeviceAuthResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Device or Docker authentication not found',
      type: ApiErrorResponse,
    }),
  );
}

export function UploadDockerAuthCertsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload Docker authentication certificates' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiParam({
      name: 'type',
      description: 'Certificate type',
      enum: ['ca', 'cert', 'key'],
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Certificate file (.pem, .crt, or .key)',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Docker certificate uploaded successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid file type or format',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Device or Docker authentication not found',
      type: ApiErrorResponse,
    }),
  );
}

export function DeleteDockerAuthCertsDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete Docker authentication certificates' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiParam({
      name: 'type',
      description: 'Certificate type',
      enum: ['ca', 'cert', 'key'],
    }),
    ApiResponse({
      status: 200,
      description: 'Docker certificate deleted successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Device, Docker authentication, or certificate not found',
      type: ApiErrorResponse,
    }),
  );
}

export function UpdateProxmoxAuthDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update Proxmox authentication details' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiBody({
      type: UpdateProxmoxAuthDto,
      description: 'Proxmox authentication update data',
    }),
    ApiResponse({
      status: 200,
      description: 'Proxmox authentication updated successfully',
      type: DeviceAuthResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Device or Proxmox authentication not found',
      type: ApiErrorResponse,
    }),
  );
}
