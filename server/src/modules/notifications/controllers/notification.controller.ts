import { Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/strategies/jwt-auth.guard';
import { Notification } from '../entities/notification.entity';
import { NotificationService } from '../services/notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getAllNotifications(): Promise<Notification[]> {
    this.logger.log('Getting all unseen notifications');
    return this.notificationService.findAllNotSeen();
  }

  @Post()
  async markAllSeen(): Promise<void> {
    this.logger.log('Marking all notifications as seen');
    return this.notificationService.markAllSeen();
  }
}
