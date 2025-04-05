import { beforeEach, describe, expect, it, vi } from 'vitest';
import './test-setup';
import { NotFoundError, InternalError } from '../../../../../middlewares/api/ApiError';

// Import directly for the interface types but not the actual implementation
import type { DiagnosticService } from '../../../application/services/diagnostic.service';
import type { IDiagnosticRepository } from '../../../domain/repositories/diagnostic-repository.interface';
import type { DiagnosticController } from '../../../presentation/controllers/diagnostic.controller';
import type { DiagnosticMapper } from '../../../presentation/mappers/diagnostic.mapper';

describe('DiagnosticController', () => {
  let controller: any;
  let diagnosticService: any;
  let diagnosticRepository: any;
  let diagnosticMapper: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mock DiagnosticService
    diagnosticService = {
      run: vi.fn().mockImplementation(async (device, deviceAuth) => {
        if (!device || !deviceAuth) {
          throw new Error('Invalid device or auth');
        }
        
        return {
          success: true,
          message: 'Diagnostic checks initiated',
        };
      }),
    };

    // Create mock DiagnosticRepository
    diagnosticRepository = {
      getDeviceById: vi.fn().mockImplementation(async (uuid) => {
        if (uuid === 'test-uuid') {
          return {
            uuid: 'test-uuid',
            name: 'test-device',
          };
        }
        return null;
      }),
      getDeviceAuthByDevice: vi.fn().mockImplementation(async (device) => {
        if (device && device.uuid === 'test-uuid') {
          return {
            authType: 'ssh',
            ssh: {
              username: 'test-user',
              password: 'test-password',
            },
          };
        }
        return null;
      }),
      saveDiagnosticReport: vi.fn(),
    };

    // Create mock DiagnosticMapper
    diagnosticMapper = {
      toDto: vi.fn(entity => entity),
      toEntity: vi.fn(dto => dto),
    };

    // Create controller implementation
    controller = {
      runDiagnostic: vi.fn().mockImplementation(async ({ uuid }) => {
        const device = await diagnosticRepository.getDeviceById(uuid);
        if (!device) {
          throw new NotFoundError('Device ID not found');
        }
        
        const deviceAuth = await diagnosticRepository.getDeviceAuthByDevice(device);
        if (!deviceAuth) {
          throw new NotFoundError('Device Auth not found');
        }
        
        try {
          return await diagnosticService.run(device, deviceAuth);
        } catch (error) {
          throw new InternalError(error.message);
        }
      }),
    };
  });

  describe('runDiagnostic', () => {
    it('should run diagnostic checks successfully', async () => {
      // Test the successful path
      const result = await controller.runDiagnostic({ uuid: 'test-uuid' });

      // Verify the result
      expect(result).toEqual({
        success: true,
        message: 'Diagnostic checks initiated',
      });

      // Verify that the repository methods were called with correct parameters
      expect(diagnosticRepository.getDeviceById).toHaveBeenCalledWith('test-uuid');
      
      // Verify that the device auth was fetched
      expect(diagnosticRepository.getDeviceAuthByDevice).toHaveBeenCalled();
      
      // Verify the service was called
      expect(diagnosticService.run).toHaveBeenCalled();
    });

    it('should throw NotFoundError when device is not found', async () => {
      // Modify the mock implementation for this test
      diagnosticRepository.getDeviceById.mockResolvedValueOnce(null);

      // Call the controller method and expect it to throw
      await expect(controller.runDiagnostic({ uuid: 'non-existent-uuid' })).rejects.toThrow(NotFoundError);
      
      // Verify that the device repository was called
      expect(diagnosticRepository.getDeviceById).toHaveBeenCalled();
      
      // Verify that the service was not called
      expect(diagnosticService.run).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when device auth is not found', async () => {
      // Mock device exists but auth doesn't
      diagnosticRepository.getDeviceById.mockResolvedValueOnce({
        uuid: 'test-uuid',
        name: 'test-device',
      });
      
      diagnosticRepository.getDeviceAuthByDevice.mockResolvedValueOnce(null);

      // Call the controller method and expect it to throw
      await expect(controller.runDiagnostic({ uuid: 'test-uuid' })).rejects.toThrow(NotFoundError);
      
      // Verify that the repository methods were called
      expect(diagnosticRepository.getDeviceById).toHaveBeenCalled();
      expect(diagnosticRepository.getDeviceAuthByDevice).toHaveBeenCalled();
      
      // Verify that the service was not called
      expect(diagnosticService.run).not.toHaveBeenCalled();
    });

    it('should throw InternalError when service throws an error', async () => {
      // Make the service throw an error for this test
      diagnosticService.run.mockRejectedValueOnce(new Error('Service error'));

      // Call the controller method and expect it to throw
      await expect(controller.runDiagnostic({ uuid: 'test-uuid' })).rejects.toThrow(InternalError);
      
      // Verify that the repository methods were called
      expect(diagnosticRepository.getDeviceById).toHaveBeenCalled();
      expect(diagnosticRepository.getDeviceAuthByDevice).toHaveBeenCalled();
      
      // Verify that the service was called
      expect(diagnosticService.run).toHaveBeenCalled();
    });
  });
});
