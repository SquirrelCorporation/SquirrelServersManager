import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SmartFailureService } from '../../../application/services/smart-failure.service';

describe('SmartFailureService', () => {
  let service: SmartFailureService;
  let mockAnsibleLogsRepository: {
    findAllByIdent: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAnsibleLogsRepository = {
      findAllByIdent: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartFailureService,
        {
          provide: 'IAnsibleLogsRepository',
          useValue: mockAnsibleLogsRepository,
        },
      ],
    }).compile();

    service = module.get<SmartFailureService>(SmartFailureService);

    // Reset mocks before each test
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseAnsibleLogsAndMayGetSmartFailure', () => {
    it('should return undefined when no logs are found', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue(null);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeUndefined();
      expect(mockAnsibleLogsRepository.findAllByIdent).toHaveBeenCalledWith('test-exec-id');
    });

    it('should return undefined when logs have no matching patterns', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Everything is working fine\nNo errors here' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeUndefined();
    });

    it('should detect unreachable host pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nUNREACHABLE! The host is not responding\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('unreachable');
      expect(result?.message).toBe('UNREACHABLE! The host is not responding');
    });

    it('should detect permission denied pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nPermission denied (publickey,password)\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('permission_denied');
      expect(result?.message).toBe('Permission denied (publickey,password)');
    });

    it('should return only the first match when multiple patterns match', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        {
          stdout:
            'Permission denied (publickey,password)\nCommand not found: ansible\nFailed to connect to the host',
        },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      // The first pattern that matches in the array of patterns will be returned
      // This depends on the order of patterns in the constants.ts file
      expect(result?.id).toBe('permission_denied');
    });

    it('should handle multiple log entries', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nNo errors here' },
        { stdout: 'UNREACHABLE! The host is not responding\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('unreachable');
    });
  });
});
