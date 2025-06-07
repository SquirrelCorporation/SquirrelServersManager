import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { TelemetryService } from '../telemetry.service';

describe('TelemetryService Network Error Handling', () => {
  let service: TelemetryService;
  let mockCacheManager: any;
  let mockConfigService: any;
  let mockPostHog: any;

  beforeEach(async () => {
    // Mock PostHog
    mockPostHog = {
      identify: vi.fn(),
      capture: vi.fn(),
      optOut: vi.fn(),
      shutdown: vi.fn(),
    };

    // Mock cache manager
    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
    };

    // Mock config service
    mockConfigService = {
      get: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);

    // Replace the PostHog client with our mock
    (service as any).client = mockPostHog;

    // Reset all mocks for each test
    vi.clearAllMocks();
  });

  describe('Network error resilience', () => {
    it('should not crash when PostHog client throws network error during initialization', async () => {
      // Setup
      mockConfigService.get.mockReturnValue(true);
      mockCacheManager.get.mockResolvedValue('test-id');
      mockPostHog.identify.mockRejectedValue(new Error('ENOTFOUND us.i.posthog.com'));

      // This should not throw
      await expect(service.onModuleInit()).resolves.not.toThrow();

      // Verify the service continues to function
      expect(service).toBeDefined();
    });

    it('should not crash when capture throws network error', async () => {
      // Setup
      mockConfigService.get.mockReturnValue(true);
      mockCacheManager.get.mockResolvedValue('test-id');
      (service as any)._id = 'test-id';
      mockPostHog.capture.mockImplementation(() => {
        throw new Error('Network error while fetching PostHog');
      });

      // This should not throw
      expect(() => {
        service.capture({
          eventName: 'test_event',
          properties: { test: 'value' },
        });
      }).not.toThrow();
    });

    it('should silently ignore capture failures without affecting subsequent calls', async () => {
      // Setup
      mockConfigService.get.mockReturnValue(true);
      (service as any)._id = 'test-id';

      // Mock multiple failures
      mockPostHog.capture.mockImplementation(() => {
        throw new Error('ENOTFOUND us.i.posthog.com');
      });

      // Multiple failures should not affect the service
      for (let i = 0; i < 10; i++) {
        expect(() => {
          service.capture({
            eventName: 'test_event',
            properties: { test: 'value' },
          });
        }).not.toThrow();
      }

      // Service should still be functional
      expect(service).toBeDefined();
    });

    it('should not crash during shutdown even with network errors', async () => {
      // Setup
      mockPostHog.shutdown.mockRejectedValue(new Error('Network timeout'));

      // This should not throw
      await expect(service.onApplicationShutdown('SIGTERM')).resolves.not.toThrow();
    });

    it('should continue application startup even if telemetry completely fails', async () => {
      // Setup - simulate complete telemetry failure
      mockConfigService.get.mockImplementation(() => {
        throw new Error('Config service failed');
      });

      // This should not throw and service should still be defined
      await expect(service.onModuleInit()).resolves.not.toThrow();
      expect(service).toBeDefined();

      // Verify client and ID are cleared
      expect((service as any).client).toBeUndefined();
      expect((service as any)._id).toBeUndefined();
    });

    it('should handle opt-out network failures gracefully', async () => {
      // Setup
      mockConfigService.get.mockReturnValue(false); // Telemetry disabled
      mockPostHog.optOut.mockRejectedValue(new Error('ENOTFOUND us.i.posthog.com'));

      // This should not throw
      await expect(service.onModuleInit()).resolves.not.toThrow();

      // Verify the service continues to function
      expect(service).toBeDefined();
    });
  });

  describe('Simplified telemetry behavior', () => {
    it('should handle all types of errors silently', async () => {
      // Setup
      mockConfigService.get.mockReturnValue(true);
      (service as any)._id = 'test-id';

      // Test various error types
      const errorTypes = [
        new Error('ENOTFOUND us.i.posthog.com'),
        new Error('Network timeout'),
        new Error('Connection refused'),
        new TypeError('Cannot read properties'),
      ];

      for (const error of errorTypes) {
        mockPostHog.capture.mockImplementation(() => {
          throw error;
        });

        // Should not throw regardless of error type
        expect(() => {
          service.capture({ eventName: 'test_event' });
        }).not.toThrow();
      }
    });
  });
});
