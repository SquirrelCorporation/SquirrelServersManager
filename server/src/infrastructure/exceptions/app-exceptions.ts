import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception class for application-specific errors
 * Extends NestJS HttpException for compatibility with the framework
 */
export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public readonly errorType: string,
    public readonly errorData?: any,
  ) {
    super(
      {
        message,
        error: errorType,
        statusCode,
        data: errorData,
      },
      statusCode,
    );
  }
}

/**
 * Unauthorized exception - used for authentication failures
 */
export class UnauthorizedException extends AppException {
  constructor(message = 'Invalid credentials', errorData?: any) {
    super(message, HttpStatus.UNAUTHORIZED, 'UnauthorizedException', errorData);
  }
}

/**
 * Forbidden exception - used for authorization failures
 */
export class ForbiddenException extends AppException {
  constructor(message = 'Permission denied', errorData?: any) {
    super(message, HttpStatus.FORBIDDEN, 'ForbiddenException', errorData);
  }
}

/**
 * Not found exception - used when a requested resource doesn't exist
 */
export class NotFoundException extends AppException {
  constructor(message = 'Resource not found', errorData?: any) {
    super(message, HttpStatus.NOT_FOUND, 'NotFoundException', errorData);
  }
}

/**
 * Bad request exception - used for validation failures
 */
export class BadRequestException extends AppException {
  constructor(message = 'Invalid request data', errorData?: any) {
    super(message, HttpStatus.BAD_REQUEST, 'BadRequestException', errorData);
  }
}

/**
 * Conflict exception - used when a request conflicts with the current state
 */
export class ConflictException extends AppException {
  constructor(message = 'Resource conflict', errorData?: any) {
    super(message, HttpStatus.CONFLICT, 'ConflictException', errorData);
  }
}

/**
 * Internal server error - used for unexpected failures
 */
export class InternalServerException extends AppException {
  constructor(message = 'Internal server error', errorData?: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'InternalServerException', errorData);
  }
}

/**
 * Service unavailable exception - used when a service dependency is unavailable
 */
export class ServiceUnavailableException extends AppException {
  constructor(message = 'Service unavailable', errorData?: any) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, 'ServiceUnavailableException', errorData);
  }
}

/**
 * Entity not found exception - specific version of NotFoundException for ORM/database entities
 */
export class EntityNotFoundException extends NotFoundException {
  constructor(entityName: string, identifier?: string | number) {
    const message = `${entityName}${identifier ? ` with ID ${identifier}` : ''} not found`;
    super(message, { entityName, identifier });
  }
}

/**
 * Validation exception - used for validation errors with field-specific details
 */
export class ValidationException extends BadRequestException {
  constructor(message = 'Validation failed', public readonly validationErrors?: Record<string, string[]>) {
    super(message, { validationErrors });
  }
}