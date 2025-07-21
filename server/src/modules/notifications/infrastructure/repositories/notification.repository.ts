import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INotificationRepository } from '../../domain/repositories/notification-repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NOTIFICATION, NotificationDocument } from '../schemas/notification.schema';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(@InjectModel(NOTIFICATION) private notificationModel: Model<NotificationDocument>) {}

  async create(notification: Partial<Notification>): Promise<Notification> {
    this.logger.log(`Creating notification - (event: ${notification.event})`);
    const created = await this.notificationModel.create(notification);
    return created.toObject();
  }

  async findAllNotSeen(): Promise<Notification[]> {
    return this.notificationModel
      .find({ seen: false })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
      .exec();
  }

  async countAllNotSeen(): Promise<number> {
    return this.notificationModel.countDocuments({ seen: false }).lean().exec();
  }

  async markAllSeen(): Promise<void> {
    await this.notificationModel.updateMany({ seen: false }, { seen: true }).lean().exec();
  }
}
