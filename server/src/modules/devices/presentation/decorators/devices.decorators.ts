import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';
import { CreateDeviceDto, UpdateDeviceDto } from '../dtos/device.dto';

export const DEVICES_TAG = 'Devices';

export function CreateDeviceDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new device' }),
    ApiBody({ type: CreateDeviceDto }),
    ApiResponse({
      status: 201,
      description: 'Device created successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid device data',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Device already exists',
      type: ApiErrorResponse,
    }),
  );
}

export function GetDevicesDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get paginated list of devices' }),
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
    ApiQuery({ name: 'sorter', required: false, type: String, description: 'Sort criteria' }),
    ApiQuery({ name: 'filter', required: false, type: String, description: 'Filter criteria' }),
    ApiResponse({
      status: 200,
      description: 'List of devices with pagination metadata',
      schema: {
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/IDevice' },
          },
          metadata: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              current: { type: 'number' },
              pageSize: { type: 'number' },
            },
          },
        },
      },
    }),
  );
}

export function GetAllDevicesDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all devices without pagination' }),
    ApiResponse({
      status: 200,
      description: 'List of all devices',
      schema: {
        type: 'array',
        items: { $ref: '#/components/schemas/IDevice' },
      },
    }),
  );
}

export function GetDevicesWithFilterDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get devices with filter' }),
    ApiQuery({
      name: 'filter',
      required: true,
      description: 'Filter criteria for devices',
      type: 'object',
    }),
    ApiResponse({
      status: 200,
      description: 'List of filtered devices',
      schema: {
        type: 'array',
        items: { $ref: '#/components/schemas/IDevice' },
      },
    }),
  );
}

export function GetDeviceByUuidDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get device by UUID' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiResponse({
      status: 200,
      description: 'The device details',
      schema: { $ref: '#/components/schemas/IDevice' },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - UUID is required',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Device not found',
      type: ApiErrorResponse,
    }),
  );
}

export function UpdateDeviceDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update device by UUID' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiBody({ type: UpdateDeviceDto }),
    ApiResponse({
      status: 200,
      description: 'Device updated successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - Invalid update data',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Device not found',
      type: ApiErrorResponse,
    }),
  );
}

export function DeleteDeviceDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete device by UUID' }),
    ApiParam({ name: 'uuid', description: 'Device UUID' }),
    ApiResponse({
      status: 200,
      description: 'Device deleted successfully',
      type: ApiSuccessResponse,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - UUID is required',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Device not found',
      type: ApiErrorResponse,
    }),
  );
}
