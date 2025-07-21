import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse, ApiSuccessResponse } from '@infrastructure/models/api-response.model';
import { SsmStatus } from 'ssm-shared-lib';
import { CreateDeviceDto, UpdateDeviceDto } from '../dtos/device.dto';

export const DEVICES_TAG = 'Devices';

// Response schemas
const DeviceSystemInformationSchema = {
  type: 'object',
  properties: {
    system: {
      type: 'object',
      description: 'System information',
      properties: {
        manufacturer: { type: 'string' },
        model: { type: 'string' },
        version: { type: 'string' },
        serial: { type: 'string' },
        uuid: { type: 'string' },
      },
    },
    os: {
      type: 'object',
      description: 'Operating system information',
      properties: {
        platform: { type: 'string' },
        distro: { type: 'string' },
        release: { type: 'string' },
        kernel: { type: 'string' },
        arch: { type: 'string' },
      },
    },
    cpu: {
      type: 'object',
      description: 'CPU information',
      properties: {
        manufacturer: { type: 'string' },
        brand: { type: 'string' },
        speed: { type: 'number' },
        cores: { type: 'number' },
        physicalCores: { type: 'number' },
      },
    },
    mem: {
      type: 'object',
      description: 'Memory information',
      properties: {
        total: { type: 'number' },
        free: { type: 'number' },
        used: { type: 'number' },
        active: { type: 'number' },
        available: { type: 'number' },
      },
    },
    networkInterfaces: {
      type: 'array',
      description: 'Network interfaces information',
      items: {
        type: 'object',
        properties: {
          iface: { type: 'string' },
          ip4: { type: 'string' },
          ip6: { type: 'string' },
          mac: { type: 'string' },
          speed: { type: 'number' },
        },
      },
    },
  },
};

const DeviceCapabilitiesSchema = {
  type: 'object',
  properties: {
    containers: {
      type: 'object',
      properties: {
        docker: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
          },
        },
        proxmox: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
          },
        },
        lxd: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
          },
        },
      },
    },
  },
};

const DeviceConfigurationSchema = {
  type: 'object',
  properties: {
    containers: {
      type: 'object',
      properties: {
        docker: {
          type: 'object',
          properties: {
            watchContainers: { type: 'boolean' },
            watchContainersCron: { type: 'string' },
            watchContainersStats: { type: 'boolean' },
            watchContainersStatsCron: { type: 'string' },
            watchEvents: { type: 'boolean' },
            watchAll: { type: 'boolean' },
          },
        },
      },
    },
  },
};

const DeviceSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    uuid: { type: 'string' },
    disabled: { type: 'boolean' },
    capabilities: DeviceCapabilitiesSchema,
    configuration: DeviceConfigurationSchema,
    dockerVersion: { type: 'string' },
    dockerId: { type: 'string' },
    hostname: { type: 'string' },
    fqdn: { type: 'string' },
    status: {
      type: 'string',
      enum: Object.values(SsmStatus.DeviceStatus),
      description: 'Device status (ONLINE, OFFLINE, etc.)',
    },
    uptime: { type: 'number' },
    systemInformation: DeviceSystemInformationSchema,
    ip: { type: 'string' },
    agentVersion: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    agentLogPath: { type: 'string' },
    agentType: { type: 'string' },
  },
};

const PaginatedDeviceResponseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: DeviceSchema,
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
};

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
    ApiOperation({ summary: 'Get paginated list of devices with sorting and filtering' }),
    ApiQuery({
      name: 'current',
      required: false,
      type: 'number',
      description: 'Current page number',
      example: 1,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      type: 'number',
      description: 'Number of items per page',
      example: 10,
    }),
    ApiQuery({
      name: 'sorter',
      required: false,
      type: 'string',
      description: 'Sort field and order (e.g., "hostname,ascend" or "createdAt,descend")',
    }),
    ApiQuery({
      name: 'filter',
      required: false,
      type: 'string',
      description: 'Filter criteria in JSON format',
    }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of devices',
      schema: PaginatedDeviceResponseSchema,
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
        items: DeviceSchema,
      },
    }),
  );
}

export function GetDevicesWithFilterDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get devices with custom filter' }),
    ApiQuery({
      name: 'status',
      required: false,
      type: 'string',
      enum: Object.values(SsmStatus.DeviceStatus),
      description: 'Filter by device status',
    }),
    ApiQuery({
      name: 'hostname',
      required: false,
      type: 'string',
      description: 'Filter by hostname (supports partial match)',
    }),
    ApiQuery({
      name: 'ip',
      required: false,
      type: 'string',
      description: 'Filter by IP address',
    }),
    ApiQuery({
      name: 'uuid',
      required: false,
      type: 'string',
      description: 'Filter by device UUID',
    }),
    ApiResponse({
      status: 200,
      description: 'List of filtered devices',
      schema: {
        type: 'array',
        items: DeviceSchema,
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
      schema: DeviceSchema,
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
