import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Events from '../../../core/events/events';
import { Notification, NotificationDocument } from '../entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new notification
   * @param notification The notification to create
   * @returns The created notification
   */
  async create(notification: Partial<Notification>): Promise<Notification> {
    this.logger.log(`Creating notification - (event: ${notification.event})`);
    const created = await this.notificationModel.create(notification);

    // Emit event to notify clients about the new notification
    this.eventEmitter.emit(Events.UPDATED_NOTIFICATIONS, 'Updated Notification');

    return created.toObject();
  }

  /**
   * Find all unseen notifications
   * @returns Array of unseen notifications
   */
  async findAllNotSeen(): Promise<Notification[]> {
    return this.notificationModel
      .find({ seen: false })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec();
  }

  /**
   * Count all unseen notifications
   * @returns Number of unseen notifications
   */
  async countAllNotSeen(): Promise<number> {
    return this.notificationModel.countDocuments({ seen: false }).lean().exec();
  }

  /**
   * Mark all notifications as seen
   */
  async markAllSeen(): Promise<void> {
    await this.notificationModel.updateMany({ seen: false }, { seen: true }).lean().exec();

    // Emit event to notify clients that notifications have been updated
    this.eventEmitter.emit(Events.UPDATED_NOTIFICATIONS, 'Updated Notification');
  }
}
