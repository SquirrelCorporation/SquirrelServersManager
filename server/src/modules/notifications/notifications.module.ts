import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './controllers/notification.controller';
import { Notification, NotificationSchema } from './entities/notification.entity';
import NotificationBridge from './Notification';
import { NotificationComponentService } from './services/notification-component.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationComponentService],
  exports: [NotificationService],
})
export class NotificationsModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  /**
   * Initialize the bridge class with the ModuleRef
   * to allow it to access the NestJS dependency injection container
   */
  onModuleInit() {
    NotificationBridge.setModuleRef(this.moduleRef);
  }
}

// Export the bridge class for backward compatibility
export { default as Notification } from './Notification';
