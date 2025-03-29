import { Injectable, OnModuleInit } from '@nestjs/common';
import { debounce } from 'lodash';
import { Logger } from 'pino';
import { SsmEvents } from 'ssm-shared-lib';
import { EventEmitterService } from '../../core/events/event-emitter.service';
import Events from '../../core/events/events';
import log from '../../logger';

const eventsToHandle = [
  {
    event: Events.UPDATED_CONTAINERS,
    ssmEvent: SsmEvents.Update.CONTAINER_CHANGE,
    logMessage: 'Containers updated',
    debounceTime: 5000,
  },
  {
    event: Events.UPDATED_NOTIFICATIONS,
    ssmEvent: SsmEvents.Update.NOTIFICATION_CHANGE,
    logMessage: 'Notifications updated',
  },
  {
    event: Events.ALERT,
    ssmEvent: SsmEvents.Alert.NEW_ALERT,
    logMessage: 'Alert sent',
  },
  {
    event: Events.VOLUME_BACKUP,
    ssmEvent: SsmEvents.VolumeBackup.PROGRESS,
    logMessage: 'Volume backup progress',
  },
  {
    event: Events.DIAGNOSTIC_CHECK,
    ssmEvent: SsmEvents.Diagnostic.PROGRESS,
    logMessage: 'Device Diagnostic progress',
  },
];

@Injectable()
export class RealTimeEngine implements OnModuleInit {
  private readonly childLogger: Logger<never>;

  constructor(private readonly eventEmitterService: EventEmitterService) {
    this.childLogger = log.child(
      { module: 'RealTimeEngine' },
      { msgPrefix: '[REALTIME_ENGINE] - ' },
    );
  }

  onModuleInit() {
    this.childLogger.info('Initialization....');
    this.eventEmitterService.on(Events.APP_STARTED, () => {
      this.init();
    });
  }

  private createDebouncedEmitter(eventName: string, logMessage: string, debounceTime: number) {
    return debounce(
      (payload: any) => {
        /* const io = App.getSocket().getIo();
      this.childLogger.debug(`${logMessage}`);
      io.emit(eventName, payload);*/
      },
      debounceTime,
    );
  }

  private createEmitter(eventName: string, logMessage: string) {
    return (payload: any) => {
      /* const io = App.getSocket().getIo();
      this.childLogger.debug(`${logMessage}`);
      io.emit(eventName, payload);*/
    };
  }

  public init() {
    try {
      this.childLogger.info('Init...');

      eventsToHandle.forEach(({ event, ssmEvent, logMessage, debounceTime }) => {
        this.childLogger.debug(
          `Registering event ${event} with ssmEvent ${ssmEvent} and debounceTime ${debounceTime}`,
        );
        const emitter =
          debounceTime !== undefined
            ? this.createDebouncedEmitter(ssmEvent, logMessage, debounceTime)
            : this.createEmitter(ssmEvent, logMessage);

        this.eventEmitterService.on(event, (payload: any) => emitter(payload));
      });
    } catch (error: any) {
      this.childLogger.error(error);
    }
  }
}
