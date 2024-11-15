import { EventEmitter } from 'events';
import { Logger } from 'pino';
import log from '../../logger';
import Events from './events';

type Listener = (...args: any[]) => void;

export type Payload = {
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  module: string;
  moduleId?: string;
  success?: boolean;
  data?: any;
};

interface EventListeners {
  [eventName: string]: Listener[];
}

const eventEmitter = new EventEmitter();

abstract class EventManager {
  protected readonly eventListeners: EventListeners;
  protected currentEvent?: Events;
  private readonly logger: Logger<never>;

  protected constructor() {
    this.eventListeners = {};
    this.logger = log.child({ module: 'EventManager' }, { msgPrefix: '[EVENT_MANAGER] - ' });
  }

  private initializeEventListener(event: Events) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
  }

  private addUniqueListener(event: Events, listener: Listener) {
    if (!this.eventListeners[event].includes(listener)) {
      this.eventListeners[event].push(listener);
      eventEmitter.on(event, listener);
    }
  }

  on(event: Events, listener: Listener) {
    this.logger.debug(`on: ${event}`);
    this.currentEvent = event;

    this.initializeEventListener(event);
    this.addUniqueListener(event, listener);
  }

  emit(event: Events, payload?: Payload | string) {
    this.logger.debug(`emit: ${event}`, payload);
    eventEmitter.emit(event, payload);
  }
}

export default EventManager;
