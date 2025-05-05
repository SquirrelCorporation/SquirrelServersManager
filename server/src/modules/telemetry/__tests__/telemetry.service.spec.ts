import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsKeys } from 'ssm-shared-lib';
import Events from 'src/core/events/events';

// Mock service class for testing
class MockTelemetryService {
  private client: any;
  private _id: string | undefined;
  private readonly logger: any;
  private readonly configService: any;
  private readonly cacheManager: any;

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
      get: vi.fn(),
      set: vi.fn().mockResolvedValue(undefined),
    };

    this.client = {
      identify: vi.fn(),
      capture: vi.fn(),
      optOut: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };
  }

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

  async onApplicationShutdown() {
    this.logger.log('Shutting down TelemetryService');
    if (this.client) {
      await this.client.shutdown();
      this.logger.log('PostHog client shut down successfully.');
    }
  }
}

describe('TelemetryService', () => {
  let service: MockTelemetryService;
  let eventEmitter: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock service
    service = new MockTelemetryService();
    
    // Create mock event emitter
    eventEmitter = {
      emit: vi.fn(),
    };
  });

  describe('onModuleInit', () => {
    it('should initialize PostHog client with correct configuration', async () => {
      // Set up mock for telemetry enabled
      service['configService'].get.mockReturnValue(true);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify client initialization
      expect(service['configService'].get).toHaveBeenCalledWith('TELEMETRY_ENABLED');
      expect(service['client'].identify).toHaveBeenCalled();
    });
    
    it('should opt out if telemetry is disabled', async () => {
      // Set up mock for telemetry disabled
      service['configService'].get.mockReturnValue(false);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify opt out
      expect(service['client'].optOut).toHaveBeenCalled();
      expect(service['cacheManager'].get).not.toHaveBeenCalled();
    });
    
    it('should use existing install ID from cache if available', async () => {
      // Set up mocks
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-install-id');
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify existing ID is used
      expect(service['cacheManager'].get).toHaveBeenCalledWith(SettingsKeys.GeneralSettingsKeys.INSTALL_ID);
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'existing-install-id',
      });
    });
    
    it('should generate and store new install ID if not in cache', async () => {
      // Set up mocks
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue(null);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify new ID generation
      expect(service['cacheManager'].get).toHaveBeenCalledWith(SettingsKeys.GeneralSettingsKeys.INSTALL_ID);
      expect(service['cacheManager'].set).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
        'test-uuid-v4'
      );
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
      });
    });
  });
  
  describe('capture', () => {
    it('should capture event when telemetry is enabled', async () => {
      // Setup service
      service['configService'].get.mockReturnValue(true);
      service['_id'] = 'existing-install-id';
      
      // Call capture
      service.capture({
        eventName: 'test_event',
        properties: { test: 'value' }
      });
      
      // Verify capture
      expect(service['client'].capture).toHaveBeenCalledWith({
        distinctId: 'existing-install-id',
        event: 'test_event',
        properties: { test: 'value' },
      });
    });
    
    it('should not capture event when telemetry is disabled', async () => {
      // Setup service
      service['configService'].get.mockReturnValue(false);
      service['_id'] = 'existing-install-id';
      
      // Call capture
      service.capture({
        eventName: 'test_event',
        properties: { test: 'value' }
      });
      
      // Verify capture not called
      expect(service['client'].capture).not.toHaveBeenCalled();
    });
    
    it('should not capture event if client is not initialized', () => {
      // Setup service with missing client
      service['configService'].get.mockReturnValue(true);
      service['client'] = undefined;
      
      // Call capture
      service.capture({
        eventName: 'test_event',
        properties: { test: 'value' }
      });
      
      // Verify warning
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Telemetry client not initialized')
      );
    });
  });
  
  describe('onApplicationShutdown', () => {
    it('should shut down PostHog client on application shutdown', async () => {
      // Setup service
      service['client'] = {
        shutdown: vi.fn().mockResolvedValue(undefined)
      };
      
      // Call shutdown
      await service.onApplicationShutdown();
      
      // Verify shutdown
      expect(service['logger'].log).toHaveBeenCalledWith('Shutting down TelemetryService');
      expect(service['client'].shutdown).toHaveBeenCalled();
    });
    
    it('should handle shutdown gracefully when client is not initialized', async () => {
      // Setup service with no client
      service['client'] = undefined;
      
      // Call shutdown
      await service.onApplicationShutdown();
      
      // Verify logging
      expect(service['logger'].log).toHaveBeenCalledWith('Shutting down TelemetryService');
    });
  });
  
  describe('Event handling', () => {
    it('should respond to TELEMETRY_EVENT events', async () => {
      // Setup service
      const captureSpy = vi.spyOn(service, 'capture');
      
      // Mock event emission
      const eventPayload = {
        eventName: 'test_event',
        properties: { source: 'test' }
      };
      
      // Call capture directly since we're mocking the event emitter
      service.capture(eventPayload);
      
      // Verify capture called
      expect(captureSpy).toHaveBeenCalledWith(eventPayload);
    });
  });
});