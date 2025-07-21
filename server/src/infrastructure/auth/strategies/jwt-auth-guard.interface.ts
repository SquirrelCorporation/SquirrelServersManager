import { ExecutionContext } from '@nestjs/common';

export const JWT_AUTH_GUARD = 'JWT_AUTH_GUARD';

/**
 * Interface for the JWT Auth Guard
 */
export interface IJwtAuthGuard {
  /**
   * Determine if a request can activate the route
   * @param context Execution context
   * @returns Boolean indicating if the request can activate the route
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
