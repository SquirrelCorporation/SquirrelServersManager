import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SmartFailureController } from '../../controllers/smart-failure.controller';
import { SmartFailureService } from '../../services/smart-failure.service';

describe('SmartFailureController', () => {
  let controller: SmartFailureController;
  let mockService: { parseAnsibleLogsAndMayGetSmartFailure: any };

  beforeEach(() => {
    mockService = {
      parseAnsibleLogsAndMayGetSmartFailure: vi.fn(),
    };

    controller = new SmartFailureController(mockService as unknown as SmartFailureService);
  });

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

      expect(result).toEqual({
        status: 'success',
        message: 'May got Ansible SmartFailure',
        data: mockSmartFailure,
      });
      expect(mockService.parseAnsibleLogsAndMayGetSmartFailure).toHaveBeenCalledWith(
        'test-exec-id',
      );
    });

    it('should return a success response with undefined data when no smart failure is found', async () => {
      mockService.parseAnsibleLogsAndMayGetSmartFailure.mockResolvedValue(undefined);

      const result = await controller.getSmartFailure({ execId: 'test-exec-id' });

      expect(result).toEqual({
        status: 'success',
        message: 'May got Ansible SmartFailure',
        data: undefined,
      });
      expect(mockService.parseAnsibleLogsAndMayGetSmartFailure).toHaveBeenCalledWith(
        'test-exec-id',
      );
    });
  });
});
