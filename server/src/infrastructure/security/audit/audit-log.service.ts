import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../../modules/users/domain/entities/user.entity';

// Define audit log schema
export interface AuditLog {
  action: string;
  userId: string;
  userEmail: string;
  userRole: Role;
  resourceType: string;
  resourceId?: string;
  description: string;
  ipAddress: string;
  statusCode?: number;
  success: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Define audit log schema name
export const AUDIT_LOG_SCHEMA = 'AuditLog';

// Define audit log actions
export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE',
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AUDIT_LOG_SCHEMA)
    private readonly auditLogModel: Model<AuditLog>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Listen for audit events
    this.eventEmitter.on('audit.*', (payload) => {
      this.logAuditEvent(payload);
    });
  }

  /**
   * Create an audit log entry
   */
  async createAuditLog(auditLog: Omit<AuditLog, 'timestamp'>): Promise<AuditLog> {
    const log = new this.auditLogModel({
      ...auditLog,
      timestamp: new Date(),
    });
    return log.save();
  }

  /**
   * Log an authentication attempt
   */
  async logAuthAttempt(
    userEmail: string,
    ipAddress: string,
    success: boolean,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const action = AuditAction.LOGIN;
    this.eventEmitter.emit('audit.auth', {
      action,
      userEmail,
      ipAddress,
      success,
      description: `Authentication attempt for user ${userEmail}`,
      resourceType: 'auth',
      metadata,
    });
  }

  /**
   * Log resource access
   */
  async logResourceAccess(
    userId: string,
    userEmail: string,
    userRole: Role,
    resourceType: string,
    resourceId: string,
    action: AuditAction,
    description: string,
    ipAddress: string,
    success: boolean,
    statusCode?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    this.eventEmitter.emit('audit.resource', {
      action,
      userId,
      userEmail,
      userRole,
      resourceType,
      resourceId,
      description,
      ipAddress,
      statusCode,
      success,
      metadata,
    });
  }

  /**
   * Handle audit events
   */
  private async logAuditEvent(payload: any): Promise<void> {
    try {
      await this.createAuditLog(payload);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }
}
