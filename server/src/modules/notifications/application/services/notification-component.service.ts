import { Injectable, OnModuleInit } from '@nestjs/common';
import EventManager, { Payload } from '../../../../core/events/EventManager';
import Events from '../../../../core/events/events';
import pinoLogger from '../../../../logger';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationComponentService extends EventManager implements OnModuleInit {
  private childLogger = pinoLogger.child(
    { module: `Notification` },
    { msgPrefix: '[NOTIFICATION] - ' },
  );

  private eventsToListen = [
    Events.AUTOMATION_FAILED,
    Events.DOCKER_STAT_FAILED,
    Events.DOCKER_WATCH_FAILED,
  ];

  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  onModuleInit() {
    this.childLogger.info('Initialization....');
    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    this.eventsToListen.forEach((event) => {
      this.on(event, (payload: Payload) => this.handleNotificationEvent(event, payload));
    });
  }

  private async handleNotificationEvent(event: Events, payload: Payload) {
    try {
      const { message, severity, module, moduleId } = payload;
      this.childLogger.info(`handleNotificationEvent - Notification received - (event: ${event})`);

      await this.notificationService.create({
        event,
        message,
        severity: severity as 'info' | 'warning' | 'error',
        module,
        moduleId,
        seen: false,
      });
    } catch (error) {
      this.childLogger?.error(error);
    }
  }
}
