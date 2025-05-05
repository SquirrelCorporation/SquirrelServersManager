import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StatisticsMicroserviceController } from '../../../presentation/controllers/statistics-microservice.controller';
import { DEVICE_STATS_SERVICE } from '../../../domain/interfaces/device-stats-service.interface';

// Mock logger
vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    Logger: vi.fn().mockImplementation(() => ({
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })),
  };
});

describe('StatisticsMicroserviceController', () => {
  let controller: StatisticsMicroserviceController;
  let mockStatsService: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock stats service
    mockStatsService = {
      getAveragedStatsByType: vi.fn(),
    };
    
    // Create controller with mocked dependencies
    controller = new StatisticsMicroserviceController(mockStatsService);
  });
  
  describe('getTimeseriesStats', () => {
    it('should return timeseries stats for valid payload', async () => {
      // Sample payload
      const payload = {
        metricName: 'cpu_usage',
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-01-07T00:00:00Z'
      };
      
      // Sample response data
      const expectedData = [
        { date: '2023-01-01T00:00:00Z', value: 42 },
        { date: '2023-01-02T00:00:00Z', value: 45 }
      ];
      
      // Mock the service method
      mockStatsService.getAveragedStatsByType.mockResolvedValue(expectedData);
      
      // Call the controller method
      const result = await controller.getTimeseriesStats(payload);
      
      // Verify the service method was called with correct parameters
      expect(mockStatsService.getAveragedStatsByType).toHaveBeenCalledWith(
        new Date(payload.startTime),
        new Date(payload.endTime),
        payload.metricName
      );
      
      // Verify the result matches expected data
      expect(result).toEqual(expectedData);
    });
    
    it('should throw error for missing metricName', async () => {
      // Missing metricName
      const payload = {
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-01-07T00:00:00Z'
      };
      
      // Expect the method to throw
      await expect(controller.getTimeseriesStats(payload as any)).rejects.toThrow(
        'Missing required parameters: metricName, startTime, endTime'
      );
      
      // Verify service method was not called
      expect(mockStatsService.getAveragedStatsByType).not.toHaveBeenCalled();
    });
    
    it('should throw error for missing startTime', async () => {
      // Missing startTime
      const payload = {
        metricName: 'cpu_usage',
        endTime: '2023-01-07T00:00:00Z'
      };
      
      // Expect the method to throw
      await expect(controller.getTimeseriesStats(payload as any)).rejects.toThrow(
        'Missing required parameters: metricName, startTime, endTime'
      );
      
      // Verify service method was not called
      expect(mockStatsService.getAveragedStatsByType).not.toHaveBeenCalled();
    });
    
    it('should throw error for missing endTime', async () => {
      // Missing endTime
      const payload = {
        metricName: 'cpu_usage',
        startTime: '2023-01-01T00:00:00Z'
      };
      
      // Expect the method to throw
      await expect(controller.getTimeseriesStats(payload as any)).rejects.toThrow(
        'Missing required parameters: metricName, startTime, endTime'
      );
      
      // Verify service method was not called
      expect(mockStatsService.getAveragedStatsByType).not.toHaveBeenCalled();
    });
    
    it('should propagate service errors', async () => {
      const payload = {
        metricName: 'cpu_usage',
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-01-07T00:00:00Z'
      };
      
      const error = new Error('Service error');
      mockStatsService.getAveragedStatsByType.mockRejectedValue(error);
      
      await expect(controller.getTimeseriesStats(payload)).rejects.toThrow(error);
    });
  });
});