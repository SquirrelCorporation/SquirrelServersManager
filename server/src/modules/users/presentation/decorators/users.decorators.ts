import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../../../infrastructure/models/api-response.model';
import { Public } from '../../../../decorators/public.decorator';
import { ResourceAction } from '../../../../infrastructure/security/roles/resource-action.decorator';
import {
  ACTIONS,
  RESOURCES,
} from '../../../../infrastructure/security/roles/resource-action.decorator';

export const USERS_TAG = 'Users';

export const UsersControllerDocs = () => applyDecorators(ApiTags(USERS_TAG));

export function CheckUsersExistenceDoc() {
  return applyDecorators(
    Public(),
    ApiOperation({
      summary: 'Check user existence',
      description:
        'Check if any users exist in the system. Used during initial setup to determine if admin user needs to be created.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved user existence status',
      type: ApiSuccessResponse,
      schema: {
        example: {
          statusCode: 200,
          data: { hasUsers: true },
        },
      },
    }),
  );
}

export function LoginDoc() {
  return applyDecorators(
    Public(),
    ResourceAction(RESOURCES.USER, ACTIONS.EXECUTE),
    ApiOperation({
      summary: 'User authentication',
      description:
        'Authenticate user with username/email and password to receive a JWT token. The token is set as an HTTP-only cookie.',
    }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Successfully authenticated',
      type: ApiSuccessResponse,
      schema: {
        example: {
          statusCode: 200,
          data: { currentAuthority: 'admin' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid credentials or missing required fields',
      type: ApiErrorResponse,
      schema: {
        example: {
          statusCode: 401,
          message: 'Identification is incorrect!',
          errors: ['Invalid username or password'],
        },
      },
    }),
  );
}

export function CreateUserDoc() {
  return applyDecorators(
    Public(),
    ResourceAction(RESOURCES.USER, ACTIONS.CREATE),
    ApiOperation({
      summary: 'Create admin user',
      description:
        'Create the initial admin user. This endpoint can only be used once, as the system is designed for single-user operation.',
    }),
    ApiBody({ type: Object, description: 'User creation data including email and password' }),
    ApiResponse({
      status: 201,
      description: 'User successfully created',
      type: ApiSuccessResponse,
      schema: {
        example: {
          statusCode: 201,
          data: {
            email: 'admin@example.com',
            role: 'admin',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request or user limit reached',
      type: ApiErrorResponse,
      schema: {
        example: {
          statusCode: 400,
          message: 'Only one user is allowed to be created',
          errors: ['User limit reached'],
        },
      },
    }),
  );
}

export function RegenerateApiKeyDoc() {
  return applyDecorators(
    ResourceAction(RESOURCES.USER, ACTIONS.UPDATE),
    ApiOperation({
      summary: 'Regenerate API key',
      description:
        'Generate a new API key for the authenticated user. The previous API key will be invalidated.',
    }),
    ApiResponse({
      status: 200,
      description: 'API key successfully regenerated',
      type: ApiSuccessResponse,
      schema: {
        example: {
          statusCode: 200,
          data: { apiKey: 'new-api-key-value' },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
      type: ApiErrorResponse,
      schema: {
        example: {
          statusCode: 404,
          message: 'User not found',
        },
      },
    }),
  );
}

export function UpdateLogsLevelDoc() {
  return applyDecorators(
    ResourceAction(RESOURCES.USER, ACTIONS.UPDATE),
    ApiOperation({
      summary: 'Update logs level',
      description:
        'Update the logging level for terminal output. This operation requires admin privileges.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          terminal: {
            type: 'string',
            enum: ['debug', 'info', 'warn', 'error'],
            description: 'The desired logging level',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Logs level successfully updated',
      type: ApiSuccessResponse,
      schema: {
        example: {
          statusCode: 200,
          data: { message: 'Logs level updated successfully' },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Unauthorized - Admin privileges required',
      type: ApiErrorResponse,
      schema: {
        example: {
          statusCode: 403,
          message: 'Unauthorized - Admin privileges required',
        },
      },
    }),
  );
}

export function GetCurrentUserDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get current user',
      description: 'Retrieve information about the currently authenticated user.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved current user information',
      type: ApiSuccessResponse,
      schema: {
        example: {
          statusCode: 200,
          data: {
            email: 'admin@example.com',
            role: 'admin',
          },
        },
      },
    }),
  );
}

export function LogoutDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Logout user',
      description: 'Clear the authentication cookie to log out the current user.',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully logged out',
      type: ApiSuccessResponse,
      schema: {
        example: {
          statusCode: 200,
          data: { message: 'Logged out successfully' },
        },
      },
    }),
  );
}
