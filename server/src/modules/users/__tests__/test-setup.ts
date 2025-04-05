import { vi } from 'vitest';

// Mock infrastructure exceptions
vi.mock('@infrastructure/exceptions/app-exceptions', () => {
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

// Mock the infrastructure exceptions index
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

// Mock the devices module
vi.mock('@modules/devices', () => {
  return {
    DEVICES_SERVICE: Symbol('DEVICES_SERVICE'),
    IDevicesService: class IDevicesService {},
    DeviceStatus: {
      ONLINE: 'online',
      OFFLINE: 'offline',
    },
  };
});

// Mock JWT service
vi.mock('@nestjs/jwt', () => {
  return {
    JwtService: class JwtService {
      sign = vi.fn().mockReturnValue('mock-jwt-token');
    },
  };
});

// Mock Express Response
vi.mock('express', () => {
  return {
    Response: class Response {
      cookie = vi.fn();
      status = vi.fn().mockReturnThis();
      json = vi.fn().mockReturnThis();
    },
  };
});