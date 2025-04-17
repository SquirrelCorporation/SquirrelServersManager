# Swagger Documentation Guide

This guide explains how to use Swagger in the Squirrel Servers Manager project.

## Overview

We use Swagger/OpenAPI for API documentation. The setup includes:
- Base configuration in `App.ts`
- Standard response models in `infrastructure/models/api-response.model.ts`
- Reusable decorators in `infrastructure/decorators/swagger.decorators.ts`

## Accessing Swagger UI

The Swagger UI is available at `/api/docs` when the server is running.

## Standard Response Models

We have three standard response models:

1. `ApiSuccessResponse<T>`:
   ```typescript
   {
     statusCode: number;    // HTTP status code
     message: string;       // Success message
     data?: T;             // Optional response data
   }
   ```

2. `ApiErrorResponse`:
   ```typescript
   {
     statusCode: number;    // HTTP status code
     message: string;       // Error message
     errors?: string[];    // Optional error details
     code?: string;        // Optional error code
   }
   ```

3. `PaginatedResponse<T>`:
   ```typescript
   {
     statusCode: number;    // HTTP status code
     message: string;       // Success message
     data: T[];            // Array of items
     total: number;        // Total number of items
     page: number;         // Current page
     limit: number;        // Items per page
     totalPages: number;   // Total number of pages
     hasNextPage: boolean;    // Whether there's a next page
     hasPreviousPage: boolean; // Whether there's a previous page
   }
   ```

## Decorator Usage

We provide several decorators to standardize API documentation:

1. Basic endpoint documentation:
   ```typescript
   @ApiEndpoint('users', {
     summary: 'Get user profile',
     description: 'Retrieves the profile of the authenticated user'
   }, {
     type: UserProfileDto,
     description: 'User profile retrieved successfully'
   })
   ```

2. Standard CRUD operations:
   ```typescript
   @ApiCreate('users', CreateUserDto, UserDto)
   @ApiList('users', UserDto)
   @ApiGet('users', UserDto)
   @ApiUpdate('users', UpdateUserDto, UserDto)
   @ApiDelete('users')
   ```

## Best Practices

1. Always use the standard response models for consistency
2. Group related endpoints using appropriate tags
3. Include detailed descriptions for all parameters
4. Document all possible response scenarios
5. Use examples where helpful
6. Keep documentation up to date with code changes

## Example Controller

```typescript
@Controller('users')
@ApiTags('users')
export class UsersController {
  @Post()
  @ApiCreate('users', CreateUserDto, UserDto)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<ApiSuccessResponse<UserDto>> {
    // Implementation
  }

  @Get()
  @ApiList('users', UserDto)
  async getUsers(): Promise<PaginatedResponse<UserDto>> {
    // Implementation
  }

  @Get(':id')
  @ApiGet('users', UserDto)
  async getUser(@Param('id') id: string): Promise<ApiSuccessResponse<UserDto>> {
    // Implementation
  }
}
```

## Security Documentation

Bearer token authentication is configured globally. Protected endpoints are automatically marked as requiring authentication in the Swagger UI.

To mark an endpoint as public:
```typescript
@Public()
@Get('health')
@ApiEndpoint('system', {
  summary: 'Health check',
  description: 'Check if the API is running'
})
async healthCheck() {
  // Implementation
}
```

## Maintenance

When adding new endpoints:
1. Use appropriate decorators from `swagger.decorators.ts`
2. Document all parameters and response types
3. Include meaningful descriptions
4. Add examples for complex request/response bodies
5. Group related endpoints under the same tag

## Testing Documentation

1. Verify that all endpoints appear in Swagger UI
2. Test that the "Try it out" feature works correctly
3. Validate that authentication works as expected
4. Check that response examples are accurate
5. Ensure all parameters are properly documented 