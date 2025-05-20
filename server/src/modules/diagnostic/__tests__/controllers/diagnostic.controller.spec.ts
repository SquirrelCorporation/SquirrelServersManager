import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Define the custom error classes we need
 */
class NotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundException';
  }
}

class InternalServerException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalServerException';
  }
}

/**
 * Create mock repositories
 */
const DeviceRepo = {
  findOneByUuid: vi.fn(),
};

const DeviceAuthRepo = {
  findOneByDevice: vi.fn(),
};

/**
 * Mock the DiagnosticService
 */
class DiagnosticService {
  run = vi.fn();
}

/**
 * Create the DiagnosticController
 */
class DiagnosticController {
  constructor(private readonly diagnosticService: DiagnosticService) {}

  async runDiagnostic(params: { uuid: string }) {
    try {
      const { uuid } = params;
      
      // Find the device
      const device = await DeviceRepo.findOneByUuid(uuid);
      if (!device) {
        throw new NotFoundException('Device ID not found');
      }
      
      // Find the device auth
      const deviceAuth = await DeviceAuthRepo.findOneByDevice(device);
      if (!deviceAuth) {
        throw new NotFoundException('Device Auth not found');
      }
      
      // Run the diagnostic
      return await this.diagnosticService.run(device, deviceAuth);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerException(error.message);
    }
  }
}

describe('DiagnosticController', () => {
  let controller: DiagnosticController;
  let diagnosticService: DiagnosticService;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create new instances
    diagnosticService = new DiagnosticService();
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
      DeviceRepo.findOneByUuid.mockResolvedValue(device);
      DeviceAuthRepo.findOneByDevice.mockResolvedValue(deviceAuth);

      // Mock service response
      diagnosticService.run.mockResolvedValue({
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
      DeviceRepo.findOneByUuid.mockResolvedValue(null);

      // Call the controller method and expect it to throw
      await expect(controller.runDiagnostic({ uuid: 'test-uuid' })).rejects.toThrow(
        new NotFoundException('Device ID not found'),
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
      DeviceRepo.findOneByUuid.mockResolvedValue(device);
      DeviceAuthRepo.findOneByDevice.mockResolvedValue(null);

      // Call the controller method and expect it to throw
      await expect(controller.runDiagnostic({ uuid: 'test-uuid' })).rejects.toThrow(
        new NotFoundException('Device Auth not found'),
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
      DeviceRepo.findOneByUuid.mockResolvedValue(device);
      DeviceAuthRepo.findOneByDevice.mockResolvedValue(deviceAuth);

      // Mock service error
      diagnosticService.run.mockRejectedValue(new Error('Service error'));

      // Call the controller method and expect it to throw
      await expect(controller.runDiagnostic({ uuid: 'test-uuid' })).rejects.toThrow(
        new InternalServerException('Service error'),
      );

      // Verify that the service was called with the correct parameters
      expect(diagnosticService.run).toHaveBeenCalledWith(device, deviceAuth);
    });
  });
});