import EventEmitter from 'events';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { Payload } from '../../../../core/events/EventManager';
import EventManager from '../../../../core/events/EventManager';

class EventManagerTest extends EventManager {
  constructor() {
    super();
  }
  public getListeners(event: string) {
    return this.eventListeners[event];
  }
}

const mockListener = () => {};

describe('EventManager Tests', () => {
  const eventManager = new EventManagerTest();
  const testEvent = 'event';
  const testPayload: Payload = {
    message: 'testMessage',
    severity: 'info',
    module: 'testModule',
  };

  test('on method registers a unique listener correctly.', async () => {
    expect(eventManager.getListeners(testEvent)).toBe(undefined);
    eventManager.on(testEvent, mockListener);
    expect(eventManager.getListeners(testEvent)).toContain(mockListener);
  });

  test('emit method sends the correct payload.', async () => {
    vi.spyOn(EventEmitter.prototype, 'emit');
    eventManager.emit(testEvent, testPayload);
    expect(EventEmitter.prototype.emit).toHaveBeenCalledWith(testEvent, testPayload);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
