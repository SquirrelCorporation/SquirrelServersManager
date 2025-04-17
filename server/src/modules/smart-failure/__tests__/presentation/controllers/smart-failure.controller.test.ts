import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ISmartFailureService } from '../../../domain/interfaces/smart-failure.service.interface';
import { SmartFailureController } from '../../../presentation/controllers/smart-failure.controller';

describe('SmartFailureController', () => {
  let controller: SmartFailureController;
  let mockService: { parseAnsibleLogsAndMayGetSmartFailure: any };

  beforeEach(() => {
    mockService = {
      parseAnsibleLogsAndMayGetSmartFailure: vi.fn(),
    };

    controller = new SmartFailureController(mockService as unknown as ISmartFailureService);
  });

  vi.mock('@infrastructure/models/api-response.model', () => ({
    ApiSuccessResponse: vi.fn(),
    ApiErrorResponse: vi.fn(),
  }));

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSmartFailure', () => {
    it('should return a success response with smart failure data', async () => {
      const mockSmartFailure = {
        id: 'test_pattern',
        message: 'Error message',
        cause: 'Test cause',
        resolution: 'Test resolution',
      };

      mockService.parseAnsibleLogsAndMayGetSmartFailure.mockResolvedValue(mockSmartFailure);

      const result = await controller.getSmartFailure({ execId: 'test-exec-id' });

      expect(result).toEqual(mockSmartFailure);
      expect(mockService.parseAnsibleLogsAndMayGetSmartFailure).toHaveBeenCalledWith(
        'test-exec-id',
      );
    });

    it('should return a success response with undefined data when no smart failure is found', async () => {
      mockService.parseAnsibleLogsAndMayGetSmartFailure.mockResolvedValue(undefined);

      const result = await controller.getSmartFailure({ execId: 'test-exec-id' });

      expect(result).toEqual(undefined);
      expect(mockService.parseAnsibleLogsAndMayGetSmartFailure).toHaveBeenCalledWith(
        'test-exec-id',
      );
    });
  });
});
