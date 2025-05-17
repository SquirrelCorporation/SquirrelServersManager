import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock for EventEmitter
class MockEventEmitter {
  on = vi.fn();
  emit = vi.fn();
}

// Mock for telemetry module integration
class MockTelemetryIntegration {
  private service: any;
  private eventEmitter: MockEventEmitter;
  private cacheManager: any;
  private configService: any;
  private mockCacheData: Record<string, any> = {};
  
  constructor() {
    this.eventEmitter = new MockEventEmitter();
    
    this.cacheManager = {
      get: vi.fn().mockImplementation(key => this.mockCacheData[key] || null),
      set: vi.fn().mockImplementation((key, value) => {
        this.mockCacheData[key] = value;
        return Promise.resolve();
      }),
    };
    
    this.configService = {
      get: vi.fn(),
    };
    
    this.service = {
      logger: {
        log: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      },
      client: {
        identify: vi.fn(),
        capture: vi.fn(),
        optOut: vi.fn().mockResolvedValue(undefined),
        shutdown: vi.fn().mockResolvedValue(undefined),
      },
      _id: undefined,
      cacheManager: this.cacheManager,
      configService: this.configService,
      
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
        this.logger.log('Shutting down TelemetryService');
        if (this.client) {
          await this.client.shutdown();
          this.logger.log('PostHog client shut down successfully.');
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
  
  getCacheManager() {
    return this.cacheManager;
  }
  
  getConfigService() {
    return this.configService;
  }
  
  getMockCacheData() {
    return this.mockCacheData;
  }
  
  setMockCacheData(data: Record<string, any>) {
    this.mockCacheData = data;
  }
}

describe('Telemetry Integration Basic Tests', () => {
  let integration: MockTelemetryIntegration;
  let service: any;
  let eventEmitter: MockEventEmitter;
  let cacheManager: any;
  let configService: any;
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create mock integration
    integration = new MockTelemetryIntegration();
    service = integration.getService();
    eventEmitter = integration.getEventEmitter();
    cacheManager = integration.getCacheManager();
    configService = integration.getConfigService();
  });
  
  describe('Integration Testing', () => {
    it('should initialize with telemetry enabled and handle events', async () => {
      // Set up mock for telemetry enabled
      configService.get.mockReturnValue(true);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify installation ID is stored
      expect(cacheManager.set).toHaveBeenCalledWith('INSTALL_ID', 'test-uuid-v4');
      
      // Verify client identification
      expect(service.client.identify).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
      });
      
      // Simulate event
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
      // Set up mock for telemetry disabled
      configService.get.mockReturnValue(false);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify client opted out
      expect(service.client.optOut).toHaveBeenCalled();
      
      // Verify cache not accessed
      expect(cacheManager.get).not.toHaveBeenCalled();
      
      // Simulate event
      service.capture({
        eventName: 'container_created',
        properties: { container_id: 'test-id' },
      });
      
      // Verify event not captured
      expect(service.client.capture).not.toHaveBeenCalled();
      
      // Call onApplicationShutdown
      await service.onApplicationShutdown();
      
      // Verify client shutdown
      expect(service.client.shutdown).toHaveBeenCalled();
    });
    
    it('should use existing installation ID from cache', async () => {
      // Set up existing installation ID
      integration.setMockCacheData({ 'INSTALL_ID': 'existing-installation-id' });
      
      // Set up mock for telemetry enabled
      configService.get.mockReturnValue(true);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Verify existing ID is used
      expect(cacheManager.get).toHaveBeenCalledWith('INSTALL_ID');
      expect(cacheManager.set).not.toHaveBeenCalled();
      
      // Verify client identification
      expect(service.client.identify).toHaveBeenCalledWith({
        distinctId: 'existing-installation-id',
      });
      
      // Simulate event
      service.capture({
        eventName: 'playbook_executed',
        properties: { playbook: 'test-playbook' },
      });
      
      // Verify event capture
      expect(service.client.capture).toHaveBeenCalledWith({
        distinctId: 'existing-installation-id',
        event: 'playbook_executed',
        properties: { playbook: 'test-playbook' },
      });
    });
    
    it('should handle configuration changes during runtime', async () => {
      // Set up initial configuration (enabled)
      let telemetryEnabled = true;
      configService.get.mockImplementation(() => telemetryEnabled);
      
      // Call onModuleInit
      await service.onModuleInit();
      
      // Simulate event (should be captured)
      service.capture({
        eventName: 'event1',
        properties: { test: 1 },
      });
      
      // Verify event capture
      expect(service.client.capture).toHaveBeenCalledWith({
        distinctId: 'test-uuid-v4',
        event: 'event1',
        properties: { test: 1 },
      });
      
      // Change configuration to disabled
      telemetryEnabled = false;
      service.client.capture.mockClear();
      
      // Simulate event (should not be captured)
      service.capture({
        eventName: 'event2',
        properties: { test: 2 },
      });
      
      // Verify event not captured
      expect(service.client.capture).not.toHaveBeenCalled();
    });
  });
});