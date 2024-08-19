import { EventEmitter } from 'events';
import { Logger } from 'pino';
import log from '../../logger';

type Listener = (...args: any[]) => void;

export type Payload = {
  message: string;
  severity: 'info' | 'warning' | 'error';
  module: string;
  moduleId?: string;
};

interface EventListeners {
  [eventName: string]: Listener[];
}

const eventEmitter = new EventEmitter();

abstract class EventManager {
  protected readonly eventListeners: EventListeners;
  protected currentEvent?: string;
  private readonly logger: Logger<never>;

  protected constructor() {
    this.eventListeners = {};
    this.logger = log.child({ module: 'EventManager' }, { msgPrefix: '[EVENT-MANAGER] - ' });
  }

  private initializeEventListener(event: string) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
  }

  private addUniqueListener(event: string, listener: Listener) {
    if (!this.eventListeners[event].includes(listener)) {
      this.eventListeners[event].push(listener);
      eventEmitter.on(event, listener);
    }
  }

  on(event: string, listener: Listener) {
    this.logger.debug(`on: ${event}`);
    this.currentEvent = event;

    this.initializeEventListener(event);
    this.addUniqueListener(event, listener);
  }

  emit(event: string, payload: Payload) {
    this.logger.debug(`emit: ${event}`, payload);
    eventEmitter.emit(event, payload);
  }
}

export default EventManager;
