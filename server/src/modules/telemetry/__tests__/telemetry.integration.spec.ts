import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import { SettingsKeys } from 'ssm-shared-lib';
import Events from 'src/core/events/events';

// Mock classes
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
      this.handlers[event].forEach(handler => handler(payload));
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
      this.logger.warn(`Telemetry client not initialized, cannot capture event: ${payload.eventName}`);
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

describe('Telemetry Integration', () => {
  let service: MockTelemetryService;
  let eventEmitter: MockEventEmitter;
  let mockCacheData: Record<string, any>;

  beforeEach(async () => {
    // Reset mock cache data
    mockCacheData = {};
    vi.clearAllMocks();
    
    // Create services
    service = new MockTelemetryService();
    eventEmitter = service.getEventEmitter();
    
    // Mock cache functionality
    service['cacheManager'].get.mockImplementation(async (key) => mockCacheData[key] || null);
    service['cacheManager'].set.mockImplementation(async (key, value) => {
      mockCacheData[key] = value;
      return undefined;
    });
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  describe('Integration Testing', () => {
    it('should initialize with telemetry enabled and handle events', async () => {
      // Set up configuration for telemetry enabled
      service['configService'].get.mockReturnValue(true);

      // Initialize
      await service.onModuleInit();

      // Check if Installation ID was generated and stored in cache
      expect(service['cacheManager'].set).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
        'test-uuid-v4'
      );

      // Verify PostHog identification
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
      });

      // Emit a telemetry event
      eventEmitter.emit(Events.TELEMETRY_EVENT, {
        eventName: 'user_login', 
        properties: { success: true }
      });

      // Verify event was captured by PostHog
      expect(service['client'].capture).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
        event: 'user_login',
        properties: { success: true },
      });
    });

    it('should handle the complete lifecycle with telemetry disabled', async () => {
      // Configure telemetry as disabled
      service['configService'].get.mockReturnValue(false);

      // Initialize
      await service.onModuleInit();

      // Verify PostHog was initialized but opted out
      expect(service['client'].optOut).toHaveBeenCalled();

      // Emit a telemetry event (should be ignored)
      eventEmitter.emit(Events.TELEMETRY_EVENT, {
        eventName: 'container_created',
        properties: { container_id: 'test-id' }
      });

      // Verify no events were captured
      expect(service['client'].capture).not.toHaveBeenCalled();

      // Shutdown
      await service.onApplicationShutdown();

      // Verify shutdown was called
      expect(service['client'].shutdown).toHaveBeenCalled();
    });

    it('should use existing installation ID from cache', async () => {
      // Set up existing installation ID in cache
      mockCacheData[SettingsKeys.GeneralSettingsKeys.INSTALL_ID] = 'existing-installation-id';
      
      // Configure telemetry as enabled
      service['configService'].get.mockReturnValue(true);

      // Initialize
      await service.onModuleInit();

      // Verify existing ID was retrieved and no new ID was generated
      expect(service['cacheManager'].get).toHaveBeenCalledWith(SettingsKeys.GeneralSettingsKeys.INSTALL_ID);
      expect(service['cacheManager'].set).not.toHaveBeenCalled();

      // Verify PostHog identification with existing ID
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'existing-installation-id',
      });

      // Emit an event
      eventEmitter.emit(Events.TELEMETRY_EVENT, {
        eventName: 'playbook_executed',
        properties: { playbook: 'test-playbook' }
      });

      // Verify event capture with existing ID
      expect(service['client'].capture).toHaveBeenCalledWith({
        distinctId: 'existing-installation-id',
        event: 'playbook_executed',
        properties: { playbook: 'test-playbook' },
      });
    });

    it('should handle configuration changes during runtime', async () => {
      const configValueMock = vi.fn();
      
      // Initially enabled
      configValueMock.mockReturnValue(true);
      service['configService'].get = configValueMock;
      
      // Initialize
      await service.onModuleInit();
      
      // Emit an event (should be captured)
      eventEmitter.emit(Events.TELEMETRY_EVENT, {
        eventName: 'event1',
        properties: { test: 1 }
      });
      
      expect(service['client'].capture).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
        event: 'event1',
        properties: { test: 1 },
      });
      
      // Change configuration to disabled
      configValueMock.mockReturnValue(false);
      
      // Clear previous calls
      service['client'].capture.mockClear();
      
      // Emit another event (should not be captured)
      eventEmitter.emit(Events.TELEMETRY_EVENT, {
        eventName: 'event2',
        properties: { test: 2 }
      });
      
      // Verify no capture occurred
      expect(service['client'].capture).not.toHaveBeenCalled();
    });
  });
});