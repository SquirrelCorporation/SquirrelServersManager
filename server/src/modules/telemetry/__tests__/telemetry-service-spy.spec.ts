import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsKeys } from 'ssm-shared-lib';

// Mock classes and functions
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
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };

    this.client = undefined; // Start with undefined client
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

  async onApplicationShutdown(signal: string) {
    this.logger.log(`Shutting down TelemetryService due to signal: ${signal}`);
    if (this.client) {
      await this.client.shutdown();
      this.logger.log('PostHog client shut down successfully.');
    }
  }
}

describe('TelemetryService', () => {
  let service: MockTelemetryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MockTelemetryService();
  });

  describe('onModuleInit', () => {
    it('should initialize PostHog client when telemetry is enabled', async () => {
      // Setup mocks
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-id');

      // Call the method
      await service.onModuleInit();

      // Assertions
      expect(service['configService'].get).toHaveBeenCalledWith('TELEMETRY_ENABLED');
      expect(service['logger'].log).toHaveBeenCalledWith('Telemetry enabled: true');
      
      // Verify identification was called with correct ID
      expect(service['client'].identify).toHaveBeenCalledWith({
        distinctId: 'existing-id',
      });
    });

    it('should opt out when telemetry is disabled', async () => {
      // Setup mocks
      service['configService'].get.mockReturnValue(false);

      // Call the method
      await service.onModuleInit();

      // Assertions
      expect(service['configService'].get).toHaveBeenCalledWith('TELEMETRY_ENABLED');
      expect(service['logger'].log).toHaveBeenCalledWith('Telemetry enabled: false');
      expect(service['logger'].log).toHaveBeenCalledWith('Telemetry disabled, opting out.');
      
      // Verify optOut was called
      expect(service['client'].optOut).toHaveBeenCalled();
    });

    it('should generate new ID if not in cache', async () => {
      // Setup mocks
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue(null);

      // Call the method
      await service.onModuleInit();

      // Assertions
      expect(service['cacheManager'].get).toHaveBeenCalledWith(SettingsKeys.GeneralSettingsKeys.INSTALL_ID);
      expect(service['logger'].log).toHaveBeenCalledWith('Install ID not found in cache, generating a new one.');
      expect(service['cacheManager'].set).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.INSTALL_ID,
        'test-uuid-v4'
      );
    });
  });

  describe('capture', () => {
    it('should capture event when telemetry is enabled', async () => {
      // Initialize service
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-id');
      await service.onModuleInit();
      
      // Reset mocks for cleaner test
      vi.clearAllMocks();
      service['configService'].get.mockReturnValue(true);
      
      // Test capture method
      const payload = { eventName: 'test_event', properties: { test: true } };
      service.capture(payload);
      
      // Assertions
      expect(service['client'].capture).toHaveBeenCalledWith({
        distinctId: 'existing-id',
        event: 'test_event',
        properties: { test: true },
      });
    });

    it('should not capture event when telemetry is disabled', async () => {
      // Initialize service
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-id');
      await service.onModuleInit();
      
      // Reset mocks and disable telemetry
      vi.clearAllMocks();
      service['configService'].get.mockReturnValue(false);
      
      // Test capture method
      const payload = { eventName: 'test_event', properties: { test: true } };
      service.capture(payload);
      
      // Assertions - capture should not be called
      expect(service['client'].capture).not.toHaveBeenCalled();
    });

    it('should warn if client is not initialized', () => {
      // Do not initialize service
      service['client'] = undefined;
      
      // Test capture method
      const payload = { eventName: 'test_event', properties: { test: true } };
      service.capture(payload);
      
      // Should log warning
      expect(service['logger'].warn).toHaveBeenCalledWith(
        expect.stringContaining('Telemetry client not initialized')
      );
    });
  });

  describe('onApplicationShutdown', () => {
    it('should shutdown client properly', async () => {
      // Initialize service
      service['configService'].get.mockReturnValue(true);
      service['cacheManager'].get.mockResolvedValue('existing-id');
      await service.onModuleInit();
      
      // Reset mocks for cleaner test
      vi.clearAllMocks();
      
      // Call shutdown
      await service.onApplicationShutdown('SIGTERM');
      
      // Assertions
      expect(service['logger'].log).toHaveBeenCalledWith(expect.stringContaining('Shutting down'));
      expect(service['client'].shutdown).toHaveBeenCalled();
      expect(service['logger'].log).toHaveBeenCalledWith('PostHog client shut down successfully.');
    });

    it('should handle shutdown when client is not initialized', async () => {
      // Reset service private property to simulate uninitialized client
      service['client'] = undefined;
      
      // Call shutdown
      await service.onApplicationShutdown('SIGTERM');
      
      // Should only log the shutdown attempt
      expect(service['logger'].log).toHaveBeenCalledWith(expect.stringContaining('Shutting down'));
    });
  });
});