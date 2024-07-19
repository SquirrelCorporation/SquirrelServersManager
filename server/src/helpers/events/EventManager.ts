import { EventEmitter } from 'events';
import logger from '../../logger';

type Listener = (...args: any[]) => void;
export type Payload = {
  message: string;
  severity: 'info' | 'warning' | 'error';
  module: string;
  moduleId?: string;
};
const _eventEmitter = new EventEmitter();

abstract class EventManager {
  private readonly _eventListeners: { [eventName: string]: Listener[] };
  protected currentEvent?: string;
  private logger = logger.child(
    {
      module: `EventManager`,
    },
    { msgPrefix: '[EVENT-MANAGER] - ' },
  );

  protected constructor() {
    this._eventListeners = {};
  }

  on(event: string, listener: Listener) {
    this.logger.debug('[EVENT-MANAGER] - on: ' + event);
    this.currentEvent = event;
    // Initialize the listeners array for the event if it doesn't exist
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    // Only add the listener if it hasn't already been added
    if (!this._eventListeners[event].includes(listener)) {
      this._eventListeners[event].push(listener);
      _eventEmitter.on(event, listener);
    }
  }

  emit(event: string, payload: Payload) {
    this.logger.debug('[EVENT-MANAGER] - emit: ' + event, payload);
    _eventEmitter.emit(event, payload);
  }
}

export default EventManager;
