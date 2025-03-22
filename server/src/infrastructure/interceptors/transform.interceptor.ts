import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
  metadata?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((result) => {
        // Check if result contains metadata and data separately
        if (result && typeof result === 'object' && 'data' in result && 'metadata' in result) {
          const { data, metadata, ...rest } = result;
          return {
            success: true,
            message: 'Operation successful',
            data,
            metadata,
            ...rest,
          };
        }

        // Standard response without metadata
        return {
          success: true,
          message: 'Operation successful',
          data: result,
        };
      }),
    );
  }
}
