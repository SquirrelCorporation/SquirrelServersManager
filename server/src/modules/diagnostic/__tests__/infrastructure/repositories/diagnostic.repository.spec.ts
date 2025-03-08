import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiagnosticReport } from '../../../domain/entities/diagnostic.entity';
import { DiagnosticRepository } from '../../../infrastructure/repositories/diagnostic.repository';

describe('DiagnosticRepository', () => {
  let repository: DiagnosticRepository;
  let mockDeviceRepository: any;
  let mockDeviceAuthRepository: any;

  beforeEach(async () => {
    mockDeviceRepository = {
      findByUuid: vi.fn(),
    };

    mockDeviceAuthRepository = {
      findByDevice: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DiagnosticRepository,
        {
          provide: 'IDeviceRepository',
          useValue: mockDeviceRepository,
        },
        {
          provide: 'IDeviceAuthRepository',
          useValue: mockDeviceAuthRepository,
        },
      ],
    }).compile();

    repository = moduleRef.get<DiagnosticRepository>(DiagnosticRepository);
  });

  describe('getDeviceById', () => {
    it('should call deviceRepository.findByUuid with the correct uuid', async () => {
      const uuid = 'test-uuid';
      const mockDevice = { uuid };
      
      mockDeviceRepository.findByUuid.mockResolvedValue(mockDevice);
      
      const result = await repository.getDeviceById(uuid);
      
      expect(mockDeviceRepository.findByUuid).toHaveBeenCalledWith(uuid);
      expect(result).toBe(mockDevice);
    });
  });

  describe('getDeviceAuthByDevice', () => {
    it('should call deviceAuthRepository.findByDevice with the correct device', async () => {
      const mockDevice = { uuid: 'test-uuid' };
      const mockDeviceAuth = { id: 'auth-id' };
      
      mockDeviceAuthRepository.findByDevice.mockResolvedValue(mockDeviceAuth);
      
      const result = await repository.getDeviceAuthByDevice(mockDevice as any);
      
      expect(mockDeviceAuthRepository.findByDevice).toHaveBeenCalledWith(mockDevice);
      expect(result).toBe(mockDeviceAuth);
    });
  });

  describe('saveDiagnosticReport', () => {
    it('should resolve without error', async () => {
      const mockReport: DiagnosticReport = {
        deviceId: 'test-device',
        timestamp: new Date(),
        results: {}
      };
      
      await expect(repository.saveDiagnosticReport(mockReport)).resolves.not.toThrow();
    });
  });
}); 