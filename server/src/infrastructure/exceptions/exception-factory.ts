import {
  BadRequestException,
  ConflictException,
  EntityNotFoundException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
  ValidationException,
} from './app-exceptions';

/**
 * Factory class for creating standardized exceptions throughout the application
 */
export class ExceptionFactory {
  /**
   * Create an entity not found exception
   */
  static entityNotFound(entityName: string, identifier?: string | number): EntityNotFoundException {
    return new EntityNotFoundException(entityName, identifier);
  }

  /**
   * Create a validation exception with field errors
   */
  static validationFailed(
    validationErrors: Record<string, string[]>,
    message = 'Validation failed',
  ): ValidationException {
    return new ValidationException(message, validationErrors);
  }

  /**
   * Create a conflict exception for duplicate entities
   */
  static duplicateEntity(entityName: string, identifier?: string): ConflictException {
    const message = `${entityName}${identifier ? ` with identifier ${identifier}` : ''} already exists`;
    return new ConflictException(message, { entityName, identifier });
  }

  /**
   * Create an exception for invalid credentials
   */
  static invalidCredentials(message = 'Invalid credentials'): UnauthorizedException {
    return new UnauthorizedException(message);
  }

  /**
   * Create an exception for insufficient permissions
   */
  static insufficientPermissions(
    action: string,
    resource: string,
    message?: string,
  ): ForbiddenException {
    return new ForbiddenException(
      message || `You don't have permission to ${action} this ${resource}`,
      { action, resource },
    );
  }
}
