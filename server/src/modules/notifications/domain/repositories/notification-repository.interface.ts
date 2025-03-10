import { Notification } from '../entities/notification.entity';

export interface INotificationRepository {
  create(notification: Partial<Notification>): Promise<Notification>;
  findAllNotSeen(): Promise<Notification[]>;
  countAllNotSeen(): Promise<number>;
  markAllSeen(): Promise<void>;
}