import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';
import { ContainerTemplatesQueryDto } from '../dtos/container-templates.dto';

export const CONTAINER_TEMPLATES_TAG = 'ContainerTemplates';

export function GetTemplatesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all container templates with pagination, sorting, and filtering',
    }),
    ApiQuery({ type: ContainerTemplatesQueryDto }),
    ApiResponse({
      status: 200,
      description: 'Templates retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Unique identifier of the template' },
                name: { type: 'string', description: 'Name of the template' },
                description: { type: 'string', description: 'Description of the template' },
                version: { type: 'string', description: 'Version of the template' },
                image: { type: 'string', description: 'Docker image name and tag' },
                ports: {
                  type: 'array',
                  description: 'Port mappings for the container',
                  items: {
                    type: 'object',
                    properties: {
                      containerPort: { type: 'number', description: 'Port inside the container' },
                      hostPort: { type: 'number', description: 'Port on the host machine' },
                      protocol: { type: 'string', description: 'Protocol (tcp/udp)' },
                    },
                  },
                },
                volumes: {
                  type: 'array',
                  description: 'Volume mappings for the container',
                  items: {
                    type: 'object',
                    properties: {
                      containerPath: { type: 'string', description: 'Path inside the container' },
                      hostPath: { type: 'string', description: 'Path on the host machine' },
                    },
                  },
                },
                environment: {
                  type: 'array',
                  description: 'Environment variables',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Environment variable name' },
                      value: { type: 'string', description: 'Environment variable value' },
                    },
                  },
                },
              },
            },
          },
          total: { type: 'number', description: 'Total number of templates' },
          page: { type: 'number', description: 'Current page number' },
          pageSize: { type: 'number', description: 'Number of items per page' },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to get templates',
      type: ApiErrorResponse,
    }),
  );
}

export function DeployTemplateDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Deploy a container template to one or more devices' }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['template'],
        properties: {
          template: {
            type: 'object',
            required: ['id', 'targets'],
            properties: {
              id: { type: 'string', description: 'Template ID to deploy' },
              name: { type: 'string', description: 'Optional override for container name' },
              description: {
                type: 'string',
                description: 'Optional description for this deployment',
              },
              version: { type: 'string', description: 'Template version to deploy' },
              targets: {
                type: 'array',
                description: 'List of target devices for deployment',
                items: {
                  type: 'object',
                  required: ['deviceUuid'],
                  properties: {
                    deviceUuid: { type: 'string', description: 'UUID of the target device' },
                    containerName: {
                      type: 'string',
                      description: 'Optional custom container name for this device',
                    },
                    environment: {
                      type: 'array',
                      description: 'Device-specific environment variable overrides',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', description: 'Environment variable name' },
                          value: { type: 'string', description: 'Environment variable value' },
                        },
                      },
                    },
                    ports: {
                      type: 'array',
                      description: 'Device-specific port mapping overrides',
                      items: {
                        type: 'object',
                        properties: {
                          containerPort: {
                            type: 'number',
                            description: 'Port inside the container',
                          },
                          hostPort: { type: 'number', description: 'Port on the host machine' },
                          protocol: { type: 'string', description: 'Protocol (tcp/udp)' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Template deployment initiated successfully',
      schema: {
        type: 'object',
        properties: {
          execId: {
            type: 'string',
            description: 'Execution ID for tracking the deployment progress',
          },
          message: { type: 'string', description: 'Success message' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid template configuration',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 404,
      description: 'Template or target device not found',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to deploy template',
      type: ApiErrorResponse,
    }),
  );
}
