import { vi } from 'vitest';

// Mock the infrastructure exceptions module specifically for the controller
vi.mock('@infrastructure/exceptions', () => {
  return {
    UnauthorizedException: class UnauthorizedException extends Error {
      constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedException';
      }
    },
    NotFoundException: class NotFoundException extends Error {
      constructor(message = 'Not Found') {
        super(message);
        this.name = 'NotFoundException';
      }
    },
    BadRequestException: class BadRequestException extends Error {
      constructor(message = 'Bad Request') {
        super(message);
        this.name = 'BadRequestException';
      }
    },
    ForbiddenException: class ForbiddenException extends Error {
      constructor(message = 'Forbidden') {
        super(message);
        this.name = 'ForbiddenException';
      }
    },
  };
});
