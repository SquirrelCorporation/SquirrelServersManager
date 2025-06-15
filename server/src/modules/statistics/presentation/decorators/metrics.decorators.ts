import { applyDecorators } from '@nestjs/common';
import { ApiBasicAuth, ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiErrorResponse } from '@infrastructure/models/api-response.model';

export const METRICS_TAG = 'Metrics';

export function GetMetricsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Prometheus metrics',
      description:
        'Retrieves Prometheus metrics in text format for monitoring and observability purposes. Requires basic authentication.',
    }),
    ApiBasicAuth(),
    ApiHeader({
      name: 'authorization',
      description: 'Basic auth header with Prometheus credentials',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Metrics retrieved successfully',
      schema: {
        type: 'string',
        format: 'text/plain',
        description: 'Prometheus metrics in text format',
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized access attempt',
      type: ApiErrorResponse,
    }),
  );
}
