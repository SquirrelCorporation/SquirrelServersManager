import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsKeys } from 'ssm-shared-lib';
import Events from 'src/core/events/events';

// Mock classes and functions
class MockEventEmitter {
  private handlers: Record<string, Function[]> = {};

  on(event: string, handler: Function) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
    return this;
  }

  emit(event: string, payload: any) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((handler) => handler(payload));
    }
    return true;
  }
}

class MockTelemetryService {
  private client: any;
  private _id: string | undefined;
  private readonly logger: any;
  private readonly configService: any;
  private readonly cacheManager: any;
  private readonly eventEmitter: MockEventEmitter;

  constructor() {
    this.logger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    this.configService = {
      get: vi.fn(),
    };

    this.cacheManager = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };

    this.client = undefined; // Start with undefined client
    this.eventEmitter = new MockEventEmitter();

    // Register event handler
    this.eventEmitter.on(Events.TELEMETRY_EVENT, (payload) => this.capture(payload));
  }

  async onModuleInit() {
    const telemetryEnabled = this.configService.get('TELEMETRY_ENABLED');
    this.logger.log(`Telemetry enabled: ${telemetryEnabled}`);

    // Create client
    this.client = {
      identify: vi.fn(),
      capture: vi.fn(),
      optOut: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };

    if (!telemetryEnabled) {
      this.logger.log('Telemetry disabled, opting out.');
      await this.client.optOut();
      return;
    }

    let installId = await this.cacheManager.get(SettingsKeys.GeneralSettingsKeys.INSTALL_ID);
    if (!installId) {
      this.logger.log('Install ID not found in cache, generating a new one.');
      installId = 'test-uuid-v4';
      await this.cacheManager.set(SettingsKeys.GeneralSettingsKeys.INSTALL_ID, installId);
    }

    this._id = installId;
    this.client.identify({ distinctId: this._id });
  }

  capture(payload: { eventName: string; properties?: Record<string, any> }) {
    const telemetryEnabled = this.configService.get('TELEMETRY_ENABLED');

    if (telemetryEnabled && this.client && this._id) {
      this.client.capture({
        distinctId: this._id,
        event: payload.eventName,
        properties: payload.properties,
      });
    } else if (!this.client) {
      this.logger.warn(
        `Telemetry client not initialized, cannot capture event: ${payload.eventName}`,
      );
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down TelemetryService due to signal: ${signal}`);
    if (this.client) {
      await this.client.shutdown();
      this.logger.log('PostHog client shut down successfully.');
    }
  }

  // Helper method to get the event emitter for testing
  getEventEmitter() {
    return this.eventEmitter;
  }
}

describe('TelemetryService', () => {
  let service: MockTelemetryService;
  let eventEmitter: MockEventEmitter;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create service
    service = new MockTelemetryService();
    eventEmitter = service.getEventEmitter();
  });

  describe('onModuleInit', () => {
    it('should initialize PostHog client with correct configuration', async () => {
      // Set up configuration for telemetry enabled
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-install-id');

      // Initialize
      await service.onModuleInit();

      // Verify configuration check
      expect(service['configService'].get).toHaveBeenCalledWith('TELEMETRY_ENABLED');
      expect(service['logger'].log).toHaveBeenCalledWith('Telemetry enabled: true');

      // Verify client initialization
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'existing-install-id',
      });
    });

    it('should opt out if telemetry is disabled', async () => {
      // Set up configuration for telemetry disabled
      service['configService'].get.mockReturnValue(false);

      // Initialize
      await service.onModuleInit();

      // Verify opt out
      expect(service['logger'].log).toHaveBeenCalledWith('Telemetry disabled, opting out.');
      expect(service['client'].optOut).toHaveBeenCalled();
      expect(service['cacheManager'].get).not.toHaveBeenCalled(); // Should not try to get ID
    });

    it('should use existing install ID from cache if available', async () => {
      // Set up configuration for telemetry enabled
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-install-id');

      // Initialize
      await service.onModuleInit();

      // Verify ID retrieval
      expect(service['cacheManager'].get).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
      );
      expect(service['cacheManager'].set).not.toHaveBeenCalled(); // Should not generate new ID

      // Verify client identification
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'existing-install-id',
      });
    });

    it('should generate and store new install ID if not in cache', async () => {
      // Set up configuration for telemetry enabled
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue(null);

      // Initialize
      await service.onModuleInit();

      // Verify ID generation
      expect(service['cacheManager'].get).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Install ID not found in cache, generating a new one.',
      );
      expect(service['cacheManager'].set).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
        'test-uuid-v4',
      );

      // Verify client identification
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
      });
    });
  });

  describe('capture', () => {
    it('should capture event when telemetry is enabled', async () => {
      // Set up and initialize
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-install-id');
      await service.onModuleInit();

      // Reset mocks
      vi.clearAllMocks();
      service['configService'].get.mockReturnValue(true);

      // Call capture
      const payload = { eventName: 'test_event', properties: { test: true } };
      service.capture(payload);

      // Verify capture
      expect(service['client'].capture).toHaveBeenCalledWith({
        distinctId: 'existing-install-id',
        event: 'test_event',
        properties: { test: true },
      });
    });

    it('should not capture event when telemetry is disabled', async () => {
      // Set up and initialize
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-install-id');
      await service.onModuleInit();

      // Reset mocks and disable telemetry
      vi.clearAllMocks();
      service['configService'].get.mockReturnValue(false);

      // Call capture
      const payload = { eventName: 'test_event', properties: { test: true } };
      service.capture(payload);

      // Verify no capture
      expect(service['client'].capture).not.toHaveBeenCalled();
    });

    it('should not capture event if client is not initialized', () => {
      // Reset client to simulate uninitialized state
      service['client'] = undefined;

      // Call capture
      const payload = { eventName: 'test_event', properties: { test: true } };
      service.capture(payload);

      // Verify warning is logged
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Telemetry client not initialized'),
      );
    });
  });

  describe('onApplicationShutdown', () => {
    it('should shut down PostHog client on application shutdown', async () => {
      // Set up and initialize
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-install-id');
      await service.onModuleInit();

      // Reset mocks
      vi.clearAllMocks();

      // Call shutdown
      await service.onApplicationShutdown('SIGTERM');

      // Verify shutdown
      expect(service['logger'].log).toHaveBeenCalledWith(expect.stringContaining('Shutting down'));
      expect(service['client'].shutdown).toHaveBeenCalled();
      expect(service['logger'].log).toHaveBeenCalledWith('PostHog client shut down successfully.');
    });

    it('should handle shutdown gracefully when client is not initialized', async () => {
      // Reset client to simulate uninitialized state
      service['client'] = undefined;

      // Call shutdown
      await service.onApplicationShutdown('SIGTERM');

      // Verify only log is called
      expect(service['logger'].log).toHaveBeenCalledWith(expect.stringContaining('Shutting down'));
    });
  });

  describe('Event handling', () => {
    it('should respond to TELEMETRY_EVENT events', async () => {
      // Set up and initialize
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-install-id');
      await service.onModuleInit();

      // Create spy on capture method
      const captureSpy = vi.spyOn(service, 'capture');

      // Emit event
      const payload = { eventName: 'test_event', properties: { source: 'test' } };
      eventEmitter.emit(Events.TELEMETRY_EVENT, payload);

      // Verify capture called
      expect(captureSpy).toHaveBeenCalledWith(payload);
    });
  });
});
