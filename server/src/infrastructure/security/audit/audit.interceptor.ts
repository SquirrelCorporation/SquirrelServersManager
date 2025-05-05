import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RESOURCE_ACTION_KEY } from '../roles/resource-action.decorator';
import { Role } from '../../../modules/users/domain/entities/user.entity';
import { findIpAddress } from '../../../infrastructure/common/utils/utils';
import { AuditAction, AuditLogService } from './audit-log.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const resourceAction = this.reflector.get(RESOURCE_ACTION_KEY, context.getHandler());
    if (!resourceAction) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const ipAddress = findIpAddress(request);

    // Convert resourceAction.action to AuditAction
    let auditAction: AuditAction;
    switch (resourceAction.action) {
      case 'create':
        auditAction = AuditAction.CREATE;
        break;
      case 'read':
        auditAction = AuditAction.READ;
        break;
      case 'update':
        auditAction = AuditAction.UPDATE;
        break;
      case 'delete':
        auditAction = AuditAction.DELETE;
        break;
      case 'execute':
        auditAction = AuditAction.EXECUTE;
        break;
      default:
        auditAction = AuditAction.READ;
    }

    // Extract resourceId from request params or body
    const resourceId = request.params?.id || request.body?.id;

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Log successful access
          if (user) {
            this.auditLogService.logResourceAccess(
              user._id,
              user.email,
              user.role as Role,
              resourceAction.resource,
              resourceId,
              auditAction,
              `User ${user.email} performed ${auditAction} on ${resourceAction.resource}${
                resourceId ? ` with ID ${resourceId}` : ''
              }`,
              ipAddress || 'unknown',
              true,
              200,
              { method: request.method, path: request.path },
            );
          }
        },
        error: (error) => {
          // Log failed access
          if (user) {
            this.auditLogService.logResourceAccess(
              user._id,
              user.email,
              user.role as Role,
              resourceAction.resource,
              resourceId,
              auditAction,
              `User ${user.email} failed to perform ${auditAction} on ${resourceAction.resource}${
                resourceId ? ` with ID ${resourceId}` : ''
              }`,
              ipAddress || 'unknown',
              false,
              error.status || 500,
              {
                method: request.method,
                path: request.path,
                errorMessage: error.message,
              },
            );
          }
        },
      }),
    );
  }
}
