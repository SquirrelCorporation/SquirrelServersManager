import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './application/services/notification.service';
import { NotificationComponentService } from './application/services/notification-component.service';
import { NOTIFICATION, NotificationSchema } from './infrastructure/schemas/notification.schema';
import { NotificationRepository } from './infrastructure/repositories/notification.repository';
import { NotificationController } from './presentation/controllers/notification.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: NOTIFICATION, schema: NotificationSchema }])],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationComponentService,
    {
      provide: 'INotificationRepository',
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
