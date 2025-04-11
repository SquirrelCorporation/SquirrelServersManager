import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WsAuthModule } from '@infrastructure/websocket-auth/ws-auth.module';
import { NotificationService } from './application/services/notification.service';
import { NotificationComponentService } from './application/services/notification-component.service';
import { NOTIFICATION, NotificationSchema } from './infrastructure/schemas/notification.schema';
import { NotificationRepository } from './infrastructure/repositories/notification.repository';
import { NotificationController } from './presentation/controllers/notification.controller';
import { NotificationsGateway } from './presentation/gateways/notifications.gateway';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification-repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NOTIFICATION, schema: NotificationSchema }]),
    WsAuthModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationComponentService,
    NotificationsGateway,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
