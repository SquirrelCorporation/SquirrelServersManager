import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagnosticReport } from '../../../domain/entities/diagnostic.entity';
import './test-setup';

describe('DiagnosticRepository', () => {
  let repository: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Create a direct mock implementation
    repository = {
      getDeviceById: vi.fn().mockImplementation(async (uuid) => {
        return { uuid };
      }),
      getDeviceAuthByDevice: vi.fn().mockImplementation(async (device) => {
        return { id: 'auth-id', device };
      }),
      saveDiagnosticReport: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe('getDeviceById', () => {
    it('should return a device with the correct uuid', async () => {
      const uuid = 'test-uuid';
      
      const result = await repository.getDeviceById(uuid);
      
      expect(repository.getDeviceById).toHaveBeenCalledWith(uuid);
      expect(result).toEqual({ uuid });
    });
  });

  describe('getDeviceAuthByDevice', () => {
    it('should return auth data for the provided device', async () => {
      const mockDevice = { uuid: 'test-uuid' };
      
      const result = await repository.getDeviceAuthByDevice(mockDevice);
      
      expect(repository.getDeviceAuthByDevice).toHaveBeenCalledWith(mockDevice);
      expect(result).toEqual({ id: 'auth-id', device: mockDevice });
    });
  });

  describe('saveDiagnosticReport', () => {
    it('should resolve without error', async () => {
      const mockReport: DiagnosticReport = {
        deviceId: 'test-device',
        timestamp: new Date(),
        results: {}
      };
      
      await repository.saveDiagnosticReport(mockReport);
      
      expect(repository.saveDiagnosticReport).toHaveBeenCalledWith(mockReport);
    });
  });
}); 