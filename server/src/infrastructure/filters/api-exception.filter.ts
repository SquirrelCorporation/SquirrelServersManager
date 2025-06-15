import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { findIpAddress } from '../common/utils/utils';
import logger from '../../logger';

/**
 * Global exception filter that handles all exceptions in the application
 * providing standardized error response format
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Get info for logging
    const ip = findIpAddress(request);
    const url = request.originalUrl;
    const method = request.method;

    // Default error response structure
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorType = 'InternalError';
    let errorData = null;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      // Handle NestJS HTTP exceptions
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errorData = (exceptionResponse as any).data;
      } else {
        message = exception.message;
      }

      errorType = exception.constructor.name;
    } else if (exception instanceof Error) {
      // Handle standard JavaScript errors
      message = exception.message;
      errorType = exception.constructor.name;
    }

    // Log the error
    logger
      .child({ module: 'ApiExceptionFilter' }, { msgPrefix: '[ERROR] - ' })
      .error(`${errorType} - ${message} - ${url} - ${method} - ${ip} - ${statusCode}`, {
        error: exception instanceof Error ? exception.stack : String(exception),
      });

    // Send standardized response
    response.status(statusCode).json({
      success: false,
      message: message,
      error: errorType,
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: url,
      data: errorData,
    });
  }
}
