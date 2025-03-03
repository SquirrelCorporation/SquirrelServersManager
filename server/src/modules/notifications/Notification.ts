import { ModuleRef } from '@nestjs/core';
import { Notification as NotificationEntity } from './entities/notification.entity';
import { NotificationService } from './services/notification.service';

/**
 * Bridge class for backward compatibility with the old notification system
 */
export default class Notification {
  private static moduleRef: ModuleRef;
  private static service: NotificationService;

  /**
   * Set the ModuleRef to allow access to the NestJS dependency injection container
   * @param moduleRef The ModuleRef instance
   */
  static setModuleRef(moduleRef: ModuleRef): void {
    Notification.moduleRef = moduleRef;
  }

  /**
   * Get the NotificationService instance
   * @returns The NotificationService instance
   */
  private static getService(): NotificationService {
    if (!Notification.service) {
      if (!Notification.moduleRef) {
        throw new Error('ModuleRef not set. Call Notification.setModuleRef() first.');
      }
      Notification.service = Notification.moduleRef.get(NotificationService, { strict: false });
    }
    return Notification.service;
  }

  /**
   * Create a new notification
   * @param notification The notification to create
   * @returns The created notification
   */
  static async create(notification: Partial<NotificationEntity>): Promise<NotificationEntity> {
    return Notification.getService().create(notification);
  }

  /**
   * Find all unseen notifications
   * @returns Array of unseen notifications
   */
  static async findAllNotSeen(): Promise<NotificationEntity[]> {
    return Notification.getService().findAllNotSeen();
  }

  /**
   * Count all unseen notifications
   * @returns Number of unseen notifications
   */
  static async countAllNotSeen(): Promise<number> {
    return Notification.getService().countAllNotSeen();
  }

  /**
   * Mark all notifications as seen
   */
  static async markAllSeen(): Promise<void> {
    return Notification.getService().markAllSeen();
  }
}
