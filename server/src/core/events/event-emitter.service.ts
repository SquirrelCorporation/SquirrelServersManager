import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
    this.logger.debug(`emit: ${event}`, { payload });
    this.eventEmitter.emit(event, payload);
  }

  on(event: Events, listener: (...args: any[]) => void) {
    this.logger.debug(`on: ${event}`);
    this.eventEmitter.on(event, listener);
    return this;
  }

  once(event: Events, listener: (...args: any[]) => void) {
    this.logger.debug(`once: ${event}`);
    this.eventEmitter.once(event, listener);
    return this;
  }

  off(event: Events, listener: (...args: any[]) => void) {
    this.logger.debug(`off: ${event}`);
    this.eventEmitter.off(event, listener);
    return this;
  }
}
