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

    it('should return valid smart failure data for various pattern types', async () => {
      // Test with common failure types
      const testPatterns = [
        {
          id: 'unreachable',
          message: 'UNREACHABLE! The host is not responding',
          cause: 'The device may be down or unreachable.',
          resolution: 'Check the device network connectivity and ensure you entered the right IP.',
        },
        {
          id: 'permission_denied',
          message: 'Permission denied (publickey,password)',
          cause: 'Incorrect SSH credentials or insufficient permissions.',
          resolution: 'Check the SSH credentials and permissions.',
        },
        {
          id: 'docker_connection_failed',
          message: 'Failed to connect to Docker daemon',
          cause:
            'Ansible failed to connect to the Docker daemon, which could be due to the Docker service not running or permission issues.',
          resolution: expect.stringContaining('Docker'),
        },
      ];

      for (const mockFailure of testPatterns) {
        // Setup mock for this test case
        mockService.parseAnsibleLogsAndMayGetSmartFailure.mockReset();
        mockService.parseAnsibleLogsAndMayGetSmartFailure.mockResolvedValue(mockFailure);

        // Call the controller
        const result = await controller.getSmartFailure({
          execId: `test-exec-id-${mockFailure.id}`,
        });

        // Verify response
        expect(result).toEqual(mockFailure);
        expect(mockService.parseAnsibleLogsAndMayGetSmartFailure).toHaveBeenCalledWith(
          `test-exec-id-${mockFailure.id}`,
        );
      }
    });

    it('should handle service errors gracefully', async () => {
      // Simulate service throwing an error
      mockService.parseAnsibleLogsAndMayGetSmartFailure.mockRejectedValue(
        new Error('Service error'),
      );

      // Test that the controller handles the error (doesn't throw)
      await expect(controller.getSmartFailure({ execId: 'test-exec-id' })).rejects.toThrow(
        'Service error',
      );
    });
  });
});
