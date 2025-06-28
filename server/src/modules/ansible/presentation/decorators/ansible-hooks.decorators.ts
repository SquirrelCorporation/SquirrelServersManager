import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';

export const ANSIBLE_HOOKS_TAG = 'AnsibleHooks';

export const AnsibleHooksControllerDocs = () => applyDecorators(ApiTags(ANSIBLE_HOOKS_TAG));

export function UpdateTaskStatusDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update Ansible task status',
      description: 'Webhook endpoint for updating the status of an Ansible task execution',
    }),
    ApiResponse({
      status: 201,
      description: 'Task status updated successfully',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the status was updated successfully',
          },
          taskId: {
            type: 'string',
            description: 'ID of the updated task',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid task hook data provided',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to update task status',
      type: ApiErrorResponse,
    }),
  );
}

export function CreateTaskEventDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create Ansible task event',
      description: 'Webhook endpoint for recording a new Ansible task execution event',
    }),
    ApiResponse({
      status: 201,
      description: 'Task event created successfully',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the event was created successfully',
          },
          eventId: {
            type: 'string',
            description: 'ID of the created event',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid task event data provided',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to create task event',
      type: ApiErrorResponse,
    }),
  );
}
