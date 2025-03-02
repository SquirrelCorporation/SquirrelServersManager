import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AnsibleLogsRepo from '../../../../data/database/repository/AnsibleLogsRepo';
import { SmartFailureService } from '../../services/smart-failure.service';

// Mock the AnsibleLogsRepo
vi.mock('../../../../data/database/repository/AnsibleLogsRepo', () => {
  return {
    default: {
      findAllByIdent: vi.fn(),
    },
  };
});

describe('SmartFailureService', () => {
  let service: SmartFailureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmartFailureService],
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
      AnsibleLogsRepo.findAllByIdent.mockResolvedValue(null);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeUndefined();
      expect(AnsibleLogsRepo.findAllByIdent).toHaveBeenCalledWith('test-exec-id');
    });

    it('should return undefined when logs have no matching patterns', async () => {
      AnsibleLogsRepo.findAllByIdent.mockResolvedValue([
        { stdout: 'Everything is working fine\nNo errors here' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeUndefined();
    });

    it('should detect unreachable host pattern', async () => {
      AnsibleLogsRepo.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nUNREACHABLE! The host is not responding\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('unreachable');
      expect(result?.message).toBe('UNREACHABLE! The host is not responding');
    });

    it('should detect permission denied pattern', async () => {
      AnsibleLogsRepo.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nPermission denied (publickey,password)\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('permission_denied');
      expect(result?.message).toBe('Permission denied (publickey,password)');
    });

    it('should return only the first match when multiple patterns match', async () => {
      AnsibleLogsRepo.findAllByIdent.mockResolvedValue([
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
      AnsibleLogsRepo.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nNo errors here' },
        { stdout: 'UNREACHABLE! The host is not responding\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('unreachable');
    });
  });
});
