import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ContainerResponseDto } from '../dtos/container-response.dto';
import { ContainersQueryDto } from '../dtos/container-query.dto';
import { PaginatedResponseDto } from '../dtos/paginated-response.dto';

export const CONTAINER_TAG = 'Containers';

export function GetContainersDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all containers with pagination and filtering' }),
    ApiQuery({ type: ContainersQueryDto }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved containers',
      type: PaginatedResponseDto,
    }),
  );
}

export function GetContainerByIdDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get container by ID' }),
    ApiParam({
      name: 'id',
      description: 'Container ID',
      required: true,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved container',
      type: ContainerResponseDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Container not found',
    }),
  );
}

export function GetContainersByDeviceUuidDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Get containers by device UUID' }),
    ApiParam({
      name: 'deviceUuid',
      description: 'Device UUID',
      required: true,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved containers',
      type: [ContainerResponseDto],
    }),
    ApiResponse({
      status: 404,
      description: 'Device not found',
    }),
  );
}

export function UpdateContainerDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update container' }),
    ApiParam({
      name: 'id',
      description: 'Container ID',
      required: true,
      type: 'string',
    }),
    ApiBody({
      type: ContainerResponseDto,
      description: 'Container data to update',
    }),
    ApiResponse({
      status: 200,
      description: 'Container successfully updated',
    }),
    ApiResponse({
      status: 404,
      description: 'Container not found',
    }),
  );
}

export function UpdateContainerNameDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Update container name' }),
    ApiParam({
      name: 'id',
      description: 'Container ID',
      required: true,
      type: 'string',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'New container name',
          },
        },
        required: ['name'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Container name successfully updated',
    }),
    ApiResponse({
      status: 404,
      description: 'Container not found',
    }),
  );
}

export function DeleteContainerDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete container' }),
    ApiParam({
      name: 'id',
      description: 'Container ID',
      required: true,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Container successfully deleted',
    }),
    ApiResponse({
      status: 404,
      description: 'Container not found',
    }),
  );
}

export function ContainerActionDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Execute container action' }),
    ApiParam({
      name: 'id',
      description: 'Container ID',
      required: true,
      type: 'string',
    }),
    ApiParam({
      name: 'action',
      description: 'Action to execute (start, stop, restart, etc.)',
      required: true,
      type: 'string',
    }),
    ApiResponse({
      status: 200,
      description: 'Action executed successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Container not found',
    }),
  );
}

export function RefreshContainersDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh all containers' }),
    ApiResponse({
      status: 200,
      description: 'Containers refreshed successfully',
    }),
  );
}
