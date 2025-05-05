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
          provide: 'ISmartFailureRepository',
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

    // Test all failure patterns defined in the constants
    it('should detect unreachable host pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nUNREACHABLE! The host is not responding\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('unreachable');
      expect(result?.message).toBe('UNREACHABLE! The host is not responding');
      expect(result?.cause).toBeDefined();
      expect(result?.resolution).toBeDefined();
    });

    it('should detect unable to connect to port variation of unreachable pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nunable to connect to port 22\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('unreachable');
      expect(result?.message).toBe('unable to connect to port 22');
    });

    it('should detect failed to connect variation of unreachable pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nfailed to connect to the host 192.168.1.1\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('unreachable');
      expect(result?.message).toBe('failed to connect to the host 192.168.1.1');
    });

    it('should detect permission denied pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nPermission denied (publickey,password)\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('permission_denied');
      expect(result?.message).toBe('Permission denied (publickey,password)');
      expect(result?.cause).toBeDefined();
      expect(result?.resolution).toBeDefined();
    });

    it('should detect failed to authenticate variation of permission denied pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nFailed to authenticate with SSH key\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('permission_denied');
      expect(result?.message).toBe('Failed to authenticate with SSH key');
    });

    it('should detect no package matching pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nNo package matching apache2 is available\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('no_package');
      expect(result?.message).toBe('No package matching apache2 is available');
      expect(result?.cause).toBeDefined();
      expect(result?.resolution).toBeDefined();
    });

    it('should detect command not found pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\ncommand not found: ansible\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('command_not_found');
      expect(result?.message).toBe('command not found: ansible');
      expect(result?.cause).toBeDefined();
      expect(result?.resolution).toBeDefined();
    });

    it('should detect timeout pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nOperation timed out after 30 seconds\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('timeout');
      expect(result?.message).toBe('Operation timed out after 30 seconds');
      expect(result?.cause).toBeDefined();
      expect(result?.resolution).toBeDefined();
    });

    it('should detect disk space pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nNo space left on disk space\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('disk_space');
      expect(result?.message).toBe('No space left on disk space');
    });

    it('should detect syntax error pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nsyntax error near unexpected token\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('syntax_error');
      expect(result?.message).toBe('syntax error near unexpected token');
    });

    it('should detect docker connection failed pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nFailed to connect to Docker daemon\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('docker_connection_failed');
      expect(result?.message).toBe('Failed to connect to Docker daemon');
      expect(result?.cause).toContain('Docker');
      expect(result?.resolution).toContain('Docker');
    });

    it('should detect container not found pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nNo such container: web-server\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('container_not_found');
      expect(result?.message).toBe('No such container: web-server');
    });

    it('should detect image pull failed pattern', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: 'Some log line\nFailed to pull image nginx:latest\nAnother log line' },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeDefined();
      expect(result?.id).toBe('image_pull_failed');
      expect(result?.message).toBe('Failed to pull image nginx:latest');
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

    it('should handle empty stdout in log entries', async () => {
      mockAnsibleLogsRepository.findAllByIdent.mockResolvedValue([
        { stdout: '' },
        { stdout: null },
        { stdout: undefined },
      ]);

      const result = await service.parseAnsibleLogsAndMayGetSmartFailure('test-exec-id');

      expect(result).toBeUndefined();
    });
  });
});
