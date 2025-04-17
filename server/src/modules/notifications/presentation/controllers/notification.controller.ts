import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from '../../application/services/notification.service';
import { Notification } from '../../domain/entities/notification.entity';
import {
  GetNotificationsCountDoc,
  GetNotificationsDoc,
  MarkNotificationsSeenDoc,
  NOTIFICATIONS_TAG,
  NotificationsCountDto,
} from '../decorators/notification.decorators';

@ApiTags(NOTIFICATIONS_TAG)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @GetNotificationsDoc()
  async findAllNotSeen(): Promise<Notification[]> {
    return this.notificationService.findAllNotSeen();
  }

  @Get('count')
  @GetNotificationsCountDoc()
  async countAllNotSeen(): Promise<NotificationsCountDto> {
    const count = await this.notificationService.countAllNotSeen();
    return { count };
  }

  @Post('mark-seen')
  @MarkNotificationsSeenDoc()
  async markAllSeen(): Promise<void> {
    return this.notificationService.markAllSeen();
  }
}
