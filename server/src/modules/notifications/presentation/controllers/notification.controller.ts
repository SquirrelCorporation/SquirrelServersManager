import { Controller, Get, Post } from '@nestjs/common';
import { NotificationService } from '../../application/services/notification.service';
import { Notification } from '../../domain/entities/notification.entity';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAllNotSeen(): Promise<Notification[]> {
    return this.notificationService.findAllNotSeen();
  }

  @Get('count')
  async countAllNotSeen(): Promise<{ count: number }> {
    const count = await this.notificationService.countAllNotSeen();
    return { count };
  }

  @Post('mark-seen')
  async markAllSeen(): Promise<void> {
    return this.notificationService.markAllSeen();
  }
}
