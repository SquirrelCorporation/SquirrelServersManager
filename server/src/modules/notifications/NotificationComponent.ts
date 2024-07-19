import InAppNotification from '../../data/database/model/InAppNotification';
import InAppNotificationRepo from '../../data/database/repository/InAppNotificationRepo';
import EventManager, { Payload } from '../../helpers/events/EventManager';
import Events from '../../helpers/events/events';
import pinoLogger from '../../logger';

class NotificationComponent extends EventManager {
  private childLogger = pinoLogger.child(
    { module: `Notification` },
    { msgPrefix: '[NOTIFICATION-COMPONENT] - ' },
  );
  private eventsToListen = [
    Events.AUTOMATION_FAILED,
    Events.DOCKER_STAT_FAILED,
    Events.DOCKER_WATCH_FAILED,
  ];

  constructor() {
    super();
  }

  async init() {
    this.childLogger.info('init');
    this.eventsToListen.map((e) => {
      this.on(e, (playload: Payload) => this.onNotification(e, playload));
    });
  }

  private async onNotification(event: string, playload: Payload) {
    try {
      const { message, severity, module, moduleId } = playload;
      this.childLogger.info('Notification received');
      await InAppNotificationRepo.create({
        event,
        message,
        severity,
        module,
        moduleId,
      } as InAppNotification);
    } catch (e) {
      if (this?.childLogger) {
        this.childLogger.error(e);
      }
    }
  }
}

export default new NotificationComponent();
