import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const DEVICES_CAPABILITIES_TAG = 'DevicesCapabilities';

export function UpdateDeviceCapabilitiesDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update device capabilities' }),
    ApiParam({
      name: 'uuid',
      description: 'UUID of the device to update',
      type: 'string',
      required: true,
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          capabilities: {
            type: 'object',
            $ref: '#/components/schemas/UpdateDeviceCapabilitiesDto',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Device capabilities updated successfully',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          uuid: { type: 'string' },
          capabilities: { type: 'object' },
          // Other device properties would be included here
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Device not found',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Device with UUID {uuid} not found',
          },
          error: { type: 'string' },
          statusCode: { type: 'number', example: 404 },
        },
      },
    }),
  );
}
