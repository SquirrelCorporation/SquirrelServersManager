import { Notification } from '../../domain/entities/notification.entity';

export const NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';

/**
 * Interface for the Notification Service
 */
export interface INotificationService {
  /**
   * Create a new notification
   * @param notification The notification to create
   * @returns The created notification
   */
  create(notification: Partial<Notification>): Promise<Notification>;

  /**
   * Find all unseen notifications
   * @returns Array of unseen notifications
   */
  findAllNotSeen(): Promise<Notification[]>;

  /**
   * Count all unseen notifications
   * @returns Number of unseen notifications
   */
  countAllNotSeen(): Promise<number>;

  /**
   * Mark all notifications as seen
   */
  markAllSeen(): Promise<void>;
}
