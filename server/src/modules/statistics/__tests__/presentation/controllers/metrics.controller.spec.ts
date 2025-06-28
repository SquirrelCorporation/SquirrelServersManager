import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Response } from 'express';
import { MetricsController } from '../../../presentation/controllers/metrics.controller';
import { METRICS_SERVICE } from '../../../domain/interfaces/metrics-service.interface';

// Mock config
vi.mock('src/config', () => ({
  prometheusConf: {
    user: 'prometheus',
    password: 'password',
  },
}));

// Mock logger
vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    Logger: vi.fn().mockImplementation(() => ({
      error: vi.fn(),
      debug: vi.fn(),
    })),
  };
});

describe('MetricsController', () => {
  let controller: MetricsController;
  let mockMetricsService: any;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock metrics service
    mockMetricsService = {
      getRegistry: vi.fn().mockReturnValue({
        contentType: 'text/plain; version=0.0.4',
        metrics: vi.fn().mockResolvedValue('metrics data'),
      }),
    };

    // Mock Express response
    mockResponse = {
      setHeader: vi.fn(),
      send: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };

    // Create controller with mocked dependencies
    controller = new MetricsController(mockMetricsService);
  });

  describe('getMetrics', () => {
    it('should return metrics with valid auth header', async () => {
      // Create base64 auth string: prometheus:password
      const authHeader = 'Basic ' + Buffer.from('prometheus:password').toString('base64');

      await controller.getMetrics(authHeader, mockResponse as Response);

      expect(mockMetricsService.getRegistry).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/plain; version=0.0.4',
      );
      expect(mockResponse.send).toHaveBeenCalledWith('metrics data');
    });

    it('should return 401 with invalid auth header', async () => {
      // Invalid auth header
      const authHeader = 'Basic ' + Buffer.from('wrong:credentials').toString('base64');

      await controller.getMetrics(authHeader, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith('Unauthorized');
      expect(mockMetricsService.getRegistry).not.toHaveBeenCalled();
    });

    it('should return 401 with missing auth header', async () => {
      await controller.getMetrics(undefined, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.send).toHaveBeenCalledWith('Unauthorized');
      expect(mockMetricsService.getRegistry).not.toHaveBeenCalled();
    });

    it('should handle errors from metrics service', async () => {
      // Create valid auth header
      const authHeader = 'Basic ' + Buffer.from('prometheus:password').toString('base64');

      // Mock registry.metrics() to throw an error
      mockMetricsService.getRegistry.mockReturnValue({
        contentType: 'text/plain; version=0.0.4',
        metrics: vi.fn().mockRejectedValue(new Error('Metrics retrieval failed')),
      });

      // This should not throw, as controller handles the error
      await expect(controller.getMetrics(authHeader, mockResponse as Response)).rejects.toThrow(
        'Metrics retrieval failed',
      );

      expect(mockMetricsService.getRegistry).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/plain; version=0.0.4',
      );
    });
  });
});
