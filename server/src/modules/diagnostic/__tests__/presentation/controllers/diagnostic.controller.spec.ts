import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InternalError, NotFoundError } from '../../../../../middlewares/api/ApiError';
import { DiagnosticService } from '../../../application/services/diagnostic.service';
import { IDiagnosticRepository } from '../../../domain/repositories/diagnostic-repository.interface';
import { DiagnosticController } from '../../../presentation/controllers/diagnostic.controller';
import { DiagnosticMapper } from '../../../presentation/mappers/diagnostic.mapper';

describe('DiagnosticController', () => {
  let controller: DiagnosticController;
  let diagnosticService: DiagnosticService;
  let diagnosticRepository: IDiagnosticRepository;
  let diagnosticMapper: DiagnosticMapper;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create mock DiagnosticService
    diagnosticService = {
      run: vi.fn(),
    } as unknown as DiagnosticService;

    // Create mock DiagnosticRepository
    diagnosticRepository = {
      getDeviceById: vi.fn(),
      getDeviceAuthByDevice: vi.fn(),
      saveDiagnosticReport: vi.fn(),
    } as unknown as IDiagnosticRepository;

    // Create mock DiagnosticMapper
    diagnosticMapper = {
      toDto: vi.fn(entity => entity),
      toEntity: vi.fn(dto => dto),
    } as unknown as DiagnosticMapper;

    // Create controller with mocked dependencies
    controller = new DiagnosticController(
      diagnosticService,
      diagnosticRepository,
      diagnosticMapper
    );
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
      vi.mocked(diagnosticRepository.getDeviceById).mockResolvedValue(device as any);
      vi.mocked(diagnosticRepository.getDeviceAuthByDevice).mockResolvedValue(deviceAuth as any);

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
      vi.mocked(diagnosticRepository.getDeviceById).mockResolvedValue(null);

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
      vi.mocked(diagnosticRepository.getDeviceById).mockResolvedValue(device as any);
      vi.mocked(diagnosticRepository.getDeviceAuthByDevice).mockResolvedValue(null);

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
      vi.mocked(diagnosticRepository.getDeviceById).mockResolvedValue(device as any);
      vi.mocked(diagnosticRepository.getDeviceAuthByDevice).mockResolvedValue(deviceAuth as any);

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
