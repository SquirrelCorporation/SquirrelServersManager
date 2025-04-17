import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export interface ApiErrorResponseOptions {
  status: number;
  description: string;
}

export function ApiErrorResponse(options: ApiErrorResponseOptions) {
  return applyDecorators(
    ApiResponse({
      status: options.status,
      description: options.description,
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: options.status,
          },
          message: {
            type: 'string',
            example: options.description,
          },
          error: {
            type: 'string',
            example: options.description,
          },
        },
      },
    }),
  );
}
