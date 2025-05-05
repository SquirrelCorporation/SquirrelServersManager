import { Notification } from '../entities/notification.entity';

export const NOTIFICATION_REPOSITORY = 'INotificationRepository';

export interface INotificationRepository {
  create(notification: Partial<Notification>): Promise<Notification>;
  findAllNotSeen(): Promise<Notification[]>;
  countAllNotSeen(): Promise<number>;
  markAllSeen(): Promise<void>;
}