import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';

export const CONTAINER_IMAGES_TAG = 'ContainerImages';

export const ContainerImagesControllerDocs = () => applyDecorators(ApiTags(CONTAINER_IMAGES_TAG));

export function GetImagesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all container images with pagination, sorting, and filtering',
    }),
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
    ApiQuery({
      name: 'deviceUuid',
      required: false,
      type: 'string',
      description: 'Filter images by device UUID',
    }),
    ApiQuery({
      name: 'id',
      required: false,
      type: 'string',
      description: 'Filter images by ID',
    }),
    ApiQuery({
      name: 'parentId',
      required: false,
      type: 'string',
      description: 'Filter images by parent ID',
    }),
    ApiResponse({
      status: 200,
      description: 'Container images retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Image ID' },
                parentId: { type: 'string', description: 'Parent image ID' },
                deviceUuid: {
                  type: 'string',
                  description: 'Device UUID where the image is stored',
                },
                repoTags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of repository tags for this image',
                },
                repoDigests: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of repository digests',
                },
                created: { type: 'number', description: 'Image creation timestamp' },
                size: { type: 'number', description: 'Image size in bytes' },
                sharedSize: { type: 'number', description: 'Shared size of image layers' },
                virtualSize: { type: 'number', description: 'Virtual size of the image' },
                containers: {
                  type: 'number',
                  description: 'Number of containers using this image',
                },
              },
            },
          },
          total: { type: 'number', description: 'Total number of images' },
          pageSize: { type: 'number', description: 'Number of items per page' },
          current: { type: 'number', description: 'Current page number' },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to retrieve container images',
      type: ApiErrorResponse,
    }),
  );
}
