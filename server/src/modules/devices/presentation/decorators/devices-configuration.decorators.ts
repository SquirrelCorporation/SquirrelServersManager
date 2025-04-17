import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';
import { DockerConfigurationDto, ProxmoxConfigurationDto } from '../dtos/device-configuration.dto';

export const DEVICES_CONFIGURATION_TAG = 'DevicesConfiguration';

export function UpdateDockerConfigurationDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update device Docker configuration',
      description: 'Updates the Docker-specific configuration settings for a device',
    }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the device to update',
      type: 'string',
      required: true,
    }),
    ApiBody({ type: DockerConfigurationDto }),
    ApiResponse({
      status: 200,
      description: 'Docker configuration updated successfully',
      schema: {
        type: 'object',
        properties: {
          configuration: {
            type: 'object',
            properties: {
              containers: {
                type: 'object',
                properties: {
                  docker: { $ref: '#/components/schemas/DockerConfigurationDto' },
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Device not found',
      type: ApiErrorResponse,
    }),
  );
}

export function UpdateProxmoxConfigurationDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update device Proxmox configuration',
      description: 'Updates the Proxmox-specific configuration settings for a device',
    }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the device to update',
      type: 'string',
      required: true,
    }),
    ApiBody({ type: ProxmoxConfigurationDto }),
    ApiResponse({
      status: 200,
      description: 'Proxmox configuration updated successfully',
      schema: {
        type: 'object',
        properties: {
          configuration: {
            type: 'object',
            properties: {
              containers: {
                type: 'object',
                properties: {
                  proxmox: { $ref: '#/components/schemas/ProxmoxConfigurationDto' },
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Device not found',
      type: ApiErrorResponse,
    }),
  );
}

export function UpdateSystemInformationConfigurationDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update device system information configuration',
      description: 'Updates the system information and monitoring settings for a device',
    }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the device to update',
      type: 'string',
      required: true,
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['systemInformationConfiguration'],
        properties: {
          systemInformationConfiguration: {
            $ref: '#/components/schemas/SystemInformationConfigurationDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'System information configuration updated successfully',
      schema: {
        type: 'object',
        properties: {
          configuration: {
            type: 'object',
            properties: {
              systemInformation: { $ref: '#/components/schemas/SystemInformationConfigurationDto' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Device not found',
      type: ApiErrorResponse,
    }),
  );
}
