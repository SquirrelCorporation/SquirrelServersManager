import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Events from '../../../../core/events/events';
import { Notification } from '../../domain/entities/notification.entity';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification-repository.interface';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Create a new notification
   * @param notification The notification to create
   * @returns The created notification
   */
  async create(notification: Partial<Notification>): Promise<Notification> {
    const created = await this.notificationRepository.create(notification);

    // Emit event to notify clients about the new notification
    this.eventEmitter.emit(Events.UPDATED_NOTIFICATIONS, 'Updated Notification');

    return created;
  }

  /**
   * Find all unseen notifications
   * @returns Array of unseen notifications
   */
  async findAllNotSeen(): Promise<Notification[]> {
    return this.notificationRepository.findAllNotSeen();
  }

  /**
   * Count all unseen notifications
   * @returns Number of unseen notifications
   */
  async countAllNotSeen(): Promise<number> {
    return this.notificationRepository.countAllNotSeen();
  }

  /**
   * Mark all notifications as seen
   */
  async markAllSeen(): Promise<void> {
    await this.notificationRepository.markAllSeen();

    // Emit event to notify clients that notifications have been updated
    this.eventEmitter.emit(Events.UPDATED_NOTIFICATIONS, 'Updated Notification');
  }
}
