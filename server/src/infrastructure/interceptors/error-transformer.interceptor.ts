import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { InternalServerException } from '../exceptions/app-exceptions';

/**
 * Interceptor that ensures all errors are transformed to proper HTTP exceptions
 * Prevents unexpected errors from bypassing the exception filter
 * Truncates long messages for unexpected errors.
 */
@Injectable()
export class ErrorTransformerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // For existing HttpExceptions, just pass them through
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // For unexpected errors, wrap in InternalServerException after truncating the message if needed
        let message = error?.message || 'Internal server error';
        if (message.length > 150) {
          message = message.slice(0, 150) + '...';
        }

        return throwError(
          () =>
            new InternalServerException(message, {
              stack: error?.stack, // Preserve original stack if available
            }),
        );
      }),
    );
  }
}
