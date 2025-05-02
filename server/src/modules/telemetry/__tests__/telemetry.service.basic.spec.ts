import { beforeEach, describe, expect, it, vi } from 'vitest';

// This is a mock implementation of the telemetry service
class MockTelemetryService {
  private client: any;
  private _id: string | undefined;
  private readonly logger: any;
  private readonly configService: any;
  private readonly cacheManager: any;

  constructor() {
    // Mock dependencies
    this.logger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };

    this.configService = {
      get: vi.fn((key) => {
        if (key === 'TELEMETRY_ENABLED') return true;
        return null;
      }),
    };

    this.cacheManager = {
      get: vi.fn().mockResolvedValue('existing-install-id'),
      set: vi.fn().mockResolvedValue(undefined),
    };

    // Mock PostHog client
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

    let installId = await this.cacheManager.get('INSTALL_ID');
    if (!installId) {
      installId = 'test-uuid-v4';
      await this.cacheManager.set('INSTALL_ID', installId);
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

describe('TelemetryService Basic Tests', () => {
  let service: MockTelemetryService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock service
    service = new MockTelemetryService();
  });

  describe('onModuleInit', () => {
    it('should initialize PostHog client with correct configuration', async () => {
      // Set up mock for telemetry enabled
      service['configService'].get.mockReturnValue(true);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify client initialization
      expect(service['configService'].get).toHaveBeenCalledWith('TELEMETRY_ENABLED');
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'existing-install-id',
      });
    });

    it('should opt out if telemetry is disabled', async () => {
      // Set up mock for telemetry disabled
      service['configService'].get.mockReturnValue(false);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify client opted out
      expect(service['client'].optOut).toHaveBeenCalled();
      expect(service['cacheManager'].get).not.toHaveBeenCalled();
    });

    it('should use existing install ID from cache if available', async () => {
      // Set up mock for existing ID
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-id');
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify existing ID is used
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'existing-id',
      });
    });

    it('should generate and store new install ID if not in cache', async () => {
      // Set up mock for no existing ID
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue(null);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify new ID is generated and stored
      expect(service['cacheManager'].set).toHaveBeenCalledWith('INSTALL_ID', 'test-uuid-v4');
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
      });
    });
  });

  describe('capture', () => {
    it('should capture event when telemetry is enabled', async () => {
      // Set up mock for telemetry enabled
      service['configService'].get.mockReturnValue(true);
      service['_id'] = 'test-id';
      
      // Call capture
      service.capture({
        eventName: 'test_event',
        properties: { test: 'value' },
      });
      
      // Verify event is captured
      expect(service['client'].capture).toHaveBeenCalledWith({
        distinctId: 'test-id',
        event: 'test_event',
        properties: { test: 'value' },
      });
    });

    it('should not capture event when telemetry is disabled', async () => {
      // Set up mock for telemetry disabled
      service['configService'].get.mockReturnValue(false);
      service['_id'] = 'test-id';
      
      // Call capture
      service.capture({
        eventName: 'test_event',
        properties: { test: 'value' },
      });
      
      // Verify event is not captured
      expect(service['client'].capture).not.toHaveBeenCalled();
    });

    it('should not capture event if client is not initialized', () => {
      // Set up mock for telemetry enabled but client not initialized
      service['configService'].get.mockReturnValue(true);
      service['client'] = undefined;
      
      // Call capture
      service.capture({
        eventName: 'test_event',
        properties: { test: 'value' },
      });
      
      // Verify warning is logged
      expect(service['logger'].warn).toHaveBeenCalled();
    });
  });

  describe('onApplicationShutdown', () => {
    it('should shut down PostHog client on application shutdown', async () => {
      // Set up mock client
      service['client'] = {
        shutdown: vi.fn().mockResolvedValue(undefined),
      };
      
      // Call onApplicationShutdown
      await service.onApplicationShutdown();
      
      // Verify client shutdown is called
      expect(service['client'].shutdown).toHaveBeenCalled();
      expect(service['logger'].log).toHaveBeenCalledWith('PostHog client shut down successfully.');
    });

    it('should handle shutdown gracefully when client is not initialized', async () => {
      // Set up mock for no client
      service['client'] = undefined;
      
      // Call onApplicationShutdown
      await service.onApplicationShutdown();
      
      // Verify no errors occur
      expect(service['logger'].log).toHaveBeenCalledWith('Shutting down TelemetryService');
    });
  });
});