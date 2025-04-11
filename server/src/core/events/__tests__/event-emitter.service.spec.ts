import { EventEmitter2 } from '@nestjs/event-emitter';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitterService } from '../event-emitter.service';
import Events from '../events';

describe('EventEmitterService', () => {
  let service: EventEmitterService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mock EventEmitter2
    eventEmitter = {
      emit: vi.fn(),
      on: vi.fn(),
    } as unknown as EventEmitter2;

    // Create the service
    service = new EventEmitterService(eventEmitter);
  });

  describe('emit', () => {
    it('should emit an event with payload', () => {
      // Create a test payload
      const payload = {
        message: 'Test message',
        severity: 'info' as const,
        module: 'TestModule',
        success: true,
        data: { test: 'data' },
      };

      // Call the emit method
      service.emit(Events.DIAGNOSTIC_CHECK, payload);

      // Verify that the event was emitted with the correct parameters
      expect(eventEmitter.emit).toHaveBeenCalledWith(Events.DIAGNOSTIC_CHECK, payload);
    });

    it('should emit an event with string payload', () => {
      // Call the emit method with a string payload
      service.emit(Events.DIAGNOSTIC_CHECK, 'Test message');

      // Verify that the event was emitted with the correct parameters
      expect(eventEmitter.emit).toHaveBeenCalledWith(Events.DIAGNOSTIC_CHECK, 'Test message');
    });
  });

  describe('on', () => {
    it('should register an event listener', () => {
      // Create a test listener
      const listener = vi.fn();

      // Call the on method
      const result = service.on(Events.DIAGNOSTIC_CHECK, listener);

      // Verify that the listener was registered
      expect(eventEmitter.on).toHaveBeenCalledWith(Events.DIAGNOSTIC_CHECK, listener);

      // Verify that the method returns the service instance for chaining
      expect(result).toBe(service);
    });
  });
});
