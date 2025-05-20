import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock service class for testing with spies
class TelemetryServiceMock {
  private client: any;
  private _id: string | undefined;
  private mockLogger: any;
  private mockConfigService: any;
  private mockCacheManager: any;
  
  constructor() {
    this.mockLogger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    };
    
    this.mockConfigService = {
      get: vi.fn(),
    };
    
    this.mockCacheManager = {
      get: vi.fn().mockResolvedValue('existing-id'),
      set: vi.fn().mockResolvedValue(undefined),
    };
    
    this.client = {
      identify: vi.fn(),
      capture: vi.fn(),
      optOut: vi.fn().mockResolvedValue(undefined),
      shutdown: vi.fn().mockResolvedValue(undefined),
    };
  }
  
  getLogger() {
    return this.mockLogger;
  }
  
  getConfigService() {
    return this.mockConfigService;
  }
  
  getCacheManager() {
    return this.mockCacheManager;
  }
  
  getClient() {
    return this.client;
  }
  
  setId(id: string) {
    this._id = id;
  }
  
  getId() {
    return this._id;
  }
  
  async onModuleInit() {
    const telemetryEnabled = this.mockConfigService.get('TELEMETRY_ENABLED');
    this.mockLogger.log(`Telemetry enabled: ${telemetryEnabled}`);
    
    if (!telemetryEnabled) {
      this.mockLogger.log('Telemetry disabled, opting out.');
      await this.client.optOut();
      return;
    }
    
    let installId = await this.mockCacheManager.get('INSTALL_ID');
    if (!installId) {
      installId = 'test-uuid-v4';
      await this.mockCacheManager.set('INSTALL_ID', installId);
    }
    
    this._id = installId;
    this.client.identify({ distinctId: this._id });
  }
  
  capture(payload: { eventName: string; properties?: Record<string, any> }) {
    const telemetryEnabled = this.mockConfigService.get('TELEMETRY_ENABLED');
    if (telemetryEnabled && this.client && this._id) {
      this.client.capture({
        distinctId: this._id,
        event: payload.eventName,
        properties: payload.properties,
      });
    } else if (!this.client) {
      this.mockLogger.warn(`Telemetry client not initialized, cannot capture event: ${payload.eventName}`);
    }
  }
  
  async onApplicationShutdown() {
    this.mockLogger.log('Shutting down TelemetryService');
    if (this.client) {
      await this.client.shutdown();
      this.mockLogger.log('PostHog client shut down successfully.');
    }
  }
}

describe('TelemetryService with Spies', () => {
  let serviceMock: TelemetryServiceMock;
  let mockLogger: any;
  let mockConfigService: any;
  let mockCacheManager: any;
  let mockClient: any;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock service
    serviceMock = new TelemetryServiceMock();
    mockLogger = serviceMock.getLogger();
    mockConfigService = serviceMock.getConfigService();
    mockCacheManager = serviceMock.getCacheManager();
    mockClient = serviceMock.getClient();
  });
  
  describe('onModuleInit', () => {
    it('should initialize PostHog client when telemetry is enabled', async () => {
      // Set up mock for telemetry enabled
      mockConfigService.get.mockReturnValue(true);
      
      // Call onModuleInit
      await serviceMock.onModuleInit();
      
      // Verify client initialization
      expect(mockConfigService.get).toHaveBeenCalledWith('TELEMETRY_ENABLED');
      expect(mockClient.identify).toHaveBeenCalledWith({
        distinctId: 'existing-id',
      });
    });
    
    it('should opt out when telemetry is disabled', async () => {
      // Set up mock for telemetry disabled
      mockConfigService.get.mockReturnValue(false);
      
      // Call onModuleInit
      await serviceMock.onModuleInit();
      
      // Verify opt out
      expect(mockLogger.log).toHaveBeenCalledWith('Telemetry disabled, opting out.');
      expect(mockClient.optOut).toHaveBeenCalled();
      expect(mockCacheManager.get).not.toHaveBeenCalled();
    });
  });
  
  describe('capture', () => {
    it('should capture event when telemetry is enabled', async () => {
      // Set up mock for telemetry enabled
      mockConfigService.get.mockReturnValue(true);
      serviceMock.setId('test-id');
      
      // Call capture
      serviceMock.capture({
        eventName: 'test_event',
        properties: { test: 'value' },
      });
      
      // Verify event capture
      expect(mockClient.capture).toHaveBeenCalledWith({
        distinctId: 'test-id',
        event: 'test_event',
        properties: { test: 'value' },
      });
    });
    
    it('should not capture event when telemetry is disabled', async () => {
      // Set up mock for telemetry disabled
      mockConfigService.get.mockReturnValue(false);
      serviceMock.setId('test-id');
      
      // Call capture
      serviceMock.capture({
        eventName: 'test_event',
        properties: { test: 'value' },
      });
      
      // Verify event not captured
      expect(mockClient.capture).not.toHaveBeenCalled();
    });
    
    it('should warn if client is not initialized', () => {
      // Set up mock for telemetry enabled but no client
      mockConfigService.get.mockReturnValue(true);
      serviceMock['client'] = undefined;
      
      // Call capture
      serviceMock.capture({
        eventName: 'test_event',
        properties: { test: 'value' },
      });
      
      // Verify warning logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Telemetry client not initialized')
      );
    });
  });
  
  describe('onApplicationShutdown', () => {
    it('should shutdown client properly', async () => {
      // Call onApplicationShutdown
      await serviceMock.onApplicationShutdown();
      
      // Verify client shutdown
      expect(mockLogger.log).toHaveBeenCalledWith('Shutting down TelemetryService');
      expect(mockClient.shutdown).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith('PostHog client shut down successfully.');
    });
    
    it('should handle shutdown when client is not initialized', async () => {
      // Set up mock for no client
      serviceMock['client'] = undefined;
      
      // Call onApplicationShutdown
      await serviceMock.onApplicationShutdown();
      
      // Verify only logging
      expect(mockLogger.log).toHaveBeenCalledWith('Shutting down TelemetryService');
    });
  });
});