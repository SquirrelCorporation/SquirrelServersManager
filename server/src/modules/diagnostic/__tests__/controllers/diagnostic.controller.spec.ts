import { beforeEach, describe, expect, it, vi } from 'vitest';
import DeviceAuthRepo from '../../../../data/database/repository/DeviceAuthRepo';
import DeviceRepo from '../../../../data/database/repository/DeviceRepo';
import { InternalError, NotFoundError } from '../../../../middlewares/api/ApiError';
import { DiagnosticController } from '../../controllers/diagnostic.controller';
import { DiagnosticService } from '../../services/diagnostic.service';

// Mock dependencies
vi.mock('../../../../data/database/repository/DeviceRepo', () => ({
  default: {
    findOneByUuid: vi.fn(),
  },
}));

vi.mock('../../../../data/database/repository/DeviceAuthRepo', () => ({
  default: {
    findOneByDevice: vi.fn(),
  },
}));

describe('DiagnosticController', () => {
  let controller: DiagnosticController;
  let diagnosticService: DiagnosticService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mock DiagnosticService
    diagnosticService = {
      run: vi.fn(),
    } as unknown as DiagnosticService;

    // Create the controller
    controller = new DiagnosticController(diagnosticService);
  });

  describe('runDiagnostic', () => {
    it('should run diagnostic checks successfully', async () => {
      // Mock device and deviceAuth
      const device = {
        uuid: 'test-uuid',
        name: 'test-device',
      };

      const deviceAuth = {
        authType: 'ssh',
        ssh: {
          username: 'test-user',
          password: 'test-password',
        },
      };

      // Mock repository responses
      vi.mocked(DeviceRepo.findOneByUuid).mockResolvedValue(device as any);
      vi.mocked(DeviceAuthRepo.findOneByDevice).mockResolvedValue(deviceAuth as any);

      // Mock service response
      vi.mocked(diagnosticService.run).mockResolvedValue({
        success: true,
        message: 'Diagnostic checks initiated',
      });

      // Call the controller method
      const result = await controller.runDiagnostic({ uuid: 'test-uuid' });

      // Verify the result
      expect(result).toEqual({
        success: true,
        message: 'Diagnostic checks initiated',
      });

      // Verify that the service was called with the correct parameters
      expect(diagnosticService.run).toHaveBeenCalledWith(device, deviceAuth);
    });

    it('should throw NotFoundError when device is not found', async () => {
      // Mock repository response
      vi.mocked(DeviceRepo.findOneByUuid).mockResolvedValue(null);

      // Call the controller method and expect it to throw
      await expect(controller.runDiagnostic({ uuid: 'test-uuid' })).rejects.toThrow(
        new NotFoundError('Device ID not found'),
      );

      // Verify that the service was not called
      expect(diagnosticService.run).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when device auth is not found', async () => {
      // Mock device
      const device = {
        uuid: 'test-uuid',
        name: 'test-device',
      };

      // Mock repository responses
      vi.mocked(DeviceRepo.findOneByUuid).mockResolvedValue(device as any);
      vi.mocked(DeviceAuthRepo.findOneByDevice).mockResolvedValue(null);

      // Call the controller method and expect it to throw
      await expect(controller.runDiagnostic({ uuid: 'test-uuid' })).rejects.toThrow(
        new NotFoundError('Device Auth not found'),
      );

      // Verify that the service was not called
      expect(diagnosticService.run).not.toHaveBeenCalled();
    });

    it('should throw InternalError when service throws an error', async () => {
      // Mock device and deviceAuth
      const device = {
        uuid: 'test-uuid',
        name: 'test-device',
      };

      const deviceAuth = {
        authType: 'ssh',
        ssh: {
          username: 'test-user',
          password: 'test-password',
        },
      };

      // Mock repository responses
      vi.mocked(DeviceRepo.findOneByUuid).mockResolvedValue(device as any);
      vi.mocked(DeviceAuthRepo.findOneByDevice).mockResolvedValue(deviceAuth as any);

      // Mock service error
      vi.mocked(diagnosticService.run).mockRejectedValue(new Error('Service error'));

      // Call the controller method and expect it to throw
      await expect(controller.runDiagnostic({ uuid: 'test-uuid' })).rejects.toThrow(
        new InternalError('Service error'),
      );

      // Verify that the service was called with the correct parameters
      expect(diagnosticService.run).toHaveBeenCalledWith(device, deviceAuth);
    });
  });
});
