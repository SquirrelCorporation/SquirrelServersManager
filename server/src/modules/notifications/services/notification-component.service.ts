import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import Events from '../../../core/events/events';
import { Notification } from '../entities/notification.entity';
import { NotificationService } from './notification.service';

interface Payload {
  message: string;
  severity: 'info' | 'warning' | 'error';
  module: string;
  moduleId?: string;
}

@Injectable()
export class NotificationComponentService implements OnModuleInit {
  private readonly logger = new Logger(NotificationComponentService.name);

  private eventsToListen = [
    Events.AUTOMATION_FAILED,
    Events.DOCKER_STAT_FAILED,
    Events.DOCKER_WATCH_FAILED,
  ];

  constructor(
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.logger.log('Initialization....');
    // No need to manually subscribe to events as we're using @OnEvent decorators
  }

  /**
   * Handle notification events
   * @param event The event name
   * @param payload The event payload
   */
  @OnEvent(Events.AUTOMATION_FAILED)
  @OnEvent(Events.DOCKER_STAT_FAILED)
  @OnEvent(Events.DOCKER_WATCH_FAILED)
  async handleNotificationEvent(event: string, payload: Payload) {
    try {
      const { message, severity, module, moduleId } = payload;
      this.logger.log(`Notification received - (event: ${event})`);

      await this.notificationService.create({
        event,
        message,
        severity,
        module,
        moduleId,
      } as Notification);

      // No need to emit event here as it's already done in the notification service
    } catch (error) {
      this.logger.error(`Error handling notification event: ${error}`);
    }
  }
}
