import { Type, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';

export interface ApiOperationOptions {
  summary: string;
  description?: string;
}

export interface ApiResponseOptions {
  type?: Type<any>;
  isArray?: boolean;
  description?: string;
}

/**
 * Standard decorator for API endpoints
 * @param tag - The tag/category for the endpoint
 * @param operation - Operation details (summary and description)
 * @param response - Response type and format
 */
export function ApiEndpoint(
  tag: string,
  operation: ApiOperationOptions,
  response?: ApiResponseOptions,
) {
  const decorators = [
    ApiTags(tag),
    ApiOperation({
      summary: operation.summary,
      description: operation.description,
    }),
  ];

  if (response?.type) {
    decorators.push(
      ApiResponse({
        status: 200,
        description: response.description || 'Successful operation',
        schema: {
          type: response.isArray ? 'array' : 'object',
          items: response.isArray ? { $ref: getSchemaPath(response.type) } : undefined,
          $ref: !response.isArray ? getSchemaPath(response.type) : undefined,
        },
      }),
    );
  }

  // Standard error responses
  decorators.push(
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid input parameters',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found - Resource not found',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
    }),
  );

  return applyDecorators(...decorators);
}

/**
 * Decorator for endpoints that create resources
 * @param tag - The tag/category for the endpoint
 * @param requestType - The DTO type for the request body
 * @param responseType - The type of the response data
 */
export function ApiCreate(tag: string, requestType: Type<any>, responseType: Type<any>) {
  return ApiEndpoint(
    tag,
    {
      summary: 'Create a new resource',
      description: 'Creates a new resource with the provided data',
    },
    {
      type: responseType,
      description: 'Resource created successfully',
    },
  );
}

/**
 * Decorator for endpoints that retrieve a list of resources
 * @param tag - The tag/category for the endpoint
 * @param responseType - The type of items in the response array
 */
export function ApiList(tag: string, responseType: Type<any>) {
  return ApiEndpoint(
    tag,
    {
      summary: 'List all resources',
      description: 'Retrieves a list of all available resources',
    },
    {
      type: responseType,
      isArray: true,
      description: 'List retrieved successfully',
    },
  );
}

/**
 * Decorator for endpoints that retrieve a single resource
 * @param tag - The tag/category for the endpoint
 * @param responseType - The type of the response data
 */
export function ApiGet(tag: string, responseType: Type<any>) {
  return ApiEndpoint(
    tag,
    {
      summary: 'Get a resource by ID',
      description: 'Retrieves a specific resource by its identifier',
    },
    {
      type: responseType,
      description: 'Resource retrieved successfully',
    },
  );
}

/**
 * Decorator for endpoints that update resources
 * @param tag - The tag/category for the endpoint
 * @param requestType - The DTO type for the request body
 * @param responseType - The type of the response data
 */
export function ApiUpdate(tag: string, requestType: Type<any>, responseType: Type<any>) {
  return ApiEndpoint(
    tag,
    {
      summary: 'Update a resource',
      description: 'Updates an existing resource with the provided data',
    },
    {
      type: responseType,
      description: 'Resource updated successfully',
    },
  );
}

/**
 * Decorator for endpoints that delete resources
 * @param tag - The tag/category for the endpoint
 */
export function ApiDelete(tag: string) {
  return ApiEndpoint(tag, {
    summary: 'Delete a resource',
    description: 'Permanently removes the specified resource',
  });
}
