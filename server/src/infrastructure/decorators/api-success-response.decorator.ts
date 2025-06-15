import { Type, applyDecorators } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';

export interface ApiSuccessResponseOptions {
  status: number;
  type?: Type<unknown>;
  description: string;
  isArray?: boolean;
}

export function ApiSuccessResponse(options: ApiSuccessResponseOptions) {
  const { status, type, description, isArray = false } = options;

  if (!type) {
    return applyDecorators(
      ApiResponse({
        status,
        description,
      }),
    );
  }

  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: isArray
        ? {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
            },
          }
        : {
            $ref: getSchemaPath(type),
          },
    }),
  );
}
