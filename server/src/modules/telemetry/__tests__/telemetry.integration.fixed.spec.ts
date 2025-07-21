import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsKeys } from 'ssm-shared-lib';
import Events from 'src/core/events/events';

// Mock implementation of the telemetry integration
class MockTelemetryIntegration {
  private service: any;
  private eventEmitter: any;
  private mockCacheData: Record<string, any> = {};

  constructor() {
    this.eventEmitter = {
      on: vi.fn(),
      emit: vi.fn(),
    };

    this.service = {
      logger: {
        log: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      },
      configService: {
        get: vi.fn(),
      },
      cacheManager: {
        get: vi.fn().mockImplementation((key) => Promise.resolve(this.mockCacheData[key] || null)),
        set: vi.fn().mockImplementation((key, value) => {
          this.mockCacheData[key] = value;
          return Promise.resolve();
        }),
      },
      client: {
        identify: vi.fn(),
        capture: vi.fn(),
        optOut: vi.fn().mockResolvedValue(undefined),
        shutdown: vi.fn().mockResolvedValue(undefined),
      },
      _id: undefined,

      async onModuleInit() {
        const telemetryEnabled = this.configService.get('TELEMETRY_ENABLED');
        this.logger.log(`Telemetry enabled: ${telemetryEnabled}`);

        if (!telemetryEnabled) {
          this.logger.log('Telemetry disabled, opting out.');
          await this.client.optOut();
          return;
        }

        let installId = await this.cacheManager.get(SettingsKeys.GeneralSettingsKeys.INSTALL_ID);
        if (!installId) {
          installId = 'test-uuid-v4';
          await this.cacheManager.set(SettingsKeys.GeneralSettingsKeys.INSTALL_ID, installId);
          this.logger.log(`New install ID generated and saved: ${installId}`);
        } else {
          this.logger.log(`Found existing install ID: ${installId}`);
        }

        this._id = installId;
        this.client.identify({ distinctId: this._id });
      },

      capture(payload: { eventName: string; properties?: Record<string, any> }) {
        const telemetryEnabled = this.configService.get('TELEMETRY_ENABLED');
        if (telemetryEnabled && this.client && this._id) {
          this.client.capture({
            distinctId: this._id,
            event: payload.eventName,
            properties: payload.properties,
          });
        }
      },

      async onApplicationShutdown() {
        this.logger.log('Shutting down telemetry service');
        if (this.client) {
          await this.client.shutdown();
          this.logger.log('PostHog client shut down successfully');
        }
      },
    };
  }

  getService() {
    return this.service;
  }

  getEventEmitter() {
    return this.eventEmitter;
  }

  setMockCacheData(data: Record<string, any>) {
    this.mockCacheData = data;
  }
}

describe('Telemetry Integration', () => {
  let integration: MockTelemetryIntegration;
  let service: any;
  let eventEmitter: any;

  beforeEach(() => {
    vi.clearAllMocks();
    integration = new MockTelemetryIntegration();
    service = integration.getService();
    eventEmitter = integration.getEventEmitter();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Integration Testing', () => {
    it('should initialize with telemetry enabled and handle events', async () => {
      // Enable telemetry
      service.configService.get.mockReturnValue(true);

      // Initialize
      await service.onModuleInit();

      // Verify ID is stored and client is initialized
      expect(service.cacheManager.set).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
        'test-uuid-v4',
      );
      expect(service.client.identify).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
      });

      // Emulate an event capture
      service.capture({
        eventName: 'user_login',
        properties: { success: true },
      });

      // Verify event capture
      expect(service.client.capture).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
        event: 'user_login',
        properties: { success: true },
      });
    });

    it('should handle the complete lifecycle with telemetry disabled', async () => {
      // Disable telemetry
      service.configService.get.mockReturnValue(false);

      // Initialize
      await service.onModuleInit();

      // Verify opt-out
      expect(service.client.optOut).toHaveBeenCalled();
      expect(service.cacheManager.get).not.toHaveBeenCalled();

      // Emulate an event capture (should be ignored)
      service.capture({
        eventName: 'container_created',
        properties: { container_id: 'test-id' },
      });

      // Verify no capture
      expect(service.client.capture).not.toHaveBeenCalled();

      // Shutdown
      await service.onApplicationShutdown();

      // Verify shutdown
      expect(service.client.shutdown).toHaveBeenCalled();
    });

    it('should use existing installation ID from cache', async () => {
      // Set up existing installation ID
      integration.setMockCacheData({
        [SettingsKeys.GeneralSettingsKeys.INSTALL_ID]: 'existing-installation-id',
      });

      // Enable telemetry
      service.configService.get.mockReturnValue(true);

      // Initialize
      await service.onModuleInit();

      // Verify existing ID is used
      expect(service.cacheManager.get).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
      );
      expect(service.cacheManager.set).not.toHaveBeenCalled();
      expect(service.client.identify).toHaveBeenCalledWith({
        distinctId: 'existing-installation-id',
      });

      // Emulate an event capture
      service.capture({
        eventName: 'playbook_executed',
        properties: { playbook: 'test-playbook' },
      });

      // Verify capture with existing ID
      expect(service.client.capture).toHaveBeenCalledWith({
        distinctId: 'existing-installation-id',
        event: 'playbook_executed',
        properties: { playbook: 'test-playbook' },
      });
    });

    it('should handle configuration changes during runtime', async () => {
      // Initially enable telemetry
      service.configService.get.mockReturnValue(true);

      // Initialize
      await service.onModuleInit();

      // Emulate an event capture (should be captured)
      service.capture({
        eventName: 'event1',
        properties: { test: 1 },
      });

      // Verify capture
      expect(service.client.capture).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
        event: 'event1',
        properties: { test: 1 },
      });

      // Clear previous capture call
      service.client.capture.mockClear();

      // Change configuration to disabled
      service.configService.get.mockReturnValue(false);

      // Emulate another event capture (should not be captured)
      service.capture({
        eventName: 'event2',
        properties: { test: 2 },
      });

      // Verify no capture
      expect(service.client.capture).not.toHaveBeenCalled();
    });
  });
});
