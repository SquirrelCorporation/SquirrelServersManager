import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import EventManager from './EventManager';
import Events from './events';

export type Payload = {
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  module: string;
  moduleId?: string;
  success?: boolean;
  data?: any;
};

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);

  constructor(private eventEmitter: EventEmitter2) {}

  emit(event: Events, payload?: Payload | string) {
    this.logger.debug(`emit: ${event}`);

    // Emit event using NestJS EventEmitter2
    this.eventEmitter.emit(event, payload);

    // Also emit event using the legacy EventManager system
    // This ensures both event systems receive the event
    try {
      const eventManager = new LegacyEventEmitterBridge();
      eventManager.emit(event, payload);
    } catch (error) {
      this.logger.error(`Failed to emit event to legacy system: ${error}`);
    }
  }

  on(event: Events, listener: (...args: any[]) => void) {
    this.logger.debug(`on: ${event}`);
    this.eventEmitter.on(event, listener);
    return this;
  }
}

// Bridge class to access the legacy event system
class LegacyEventEmitterBridge extends EventManager {
  constructor() {
    super();
  }
}
