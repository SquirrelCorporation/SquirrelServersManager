import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';

export function GetSmartFailureDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get smart failure analysis for an Ansible execution',
      description: 'Analyzes Ansible execution logs to detect and explain smart failures',
    }),
    ApiQuery({
      name: 'execId',
      required: true,
      type: 'string',
      description: 'Execution ID of the Ansible run to analyze',
    }),
    ApiResponse({
      status: 200,
      description: 'Smart failure analysis retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          taskName: {
            type: 'string',
            description: 'Name of the Ansible task that failed',
          },
          error: {
            type: 'string',
            description: 'Error message from the failure',
          },
          suggestion: {
            type: 'string',
            description: 'AI-generated suggestion for resolving the failure',
          },
          context: {
            type: 'object',
            description: 'Additional context about the failure',
            properties: {
              host: {
                type: 'string',
                description: 'Host where the failure occurred',
              },
              module: {
                type: 'string',
                description: 'Ansible module that failed',
              },
              taskPath: {
                type: 'string',
                description: 'Path to the task in the playbook',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'No smart failure analysis found for the given execution ID',
      type: ApiErrorResponse,
    }),
    ApiResponse({
      status: 500,
      description: 'Failed to analyze execution logs',
      type: ApiErrorResponse,
    }),
  );
}
