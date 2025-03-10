import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleLogsRepository } from '../../../infrastructure/repositories/ansible-logs.repository';
import { AnsibleLogsRepository as LogsModuleAnsibleLogsRepository } from '../../../../logs/infrastructure/repositories/ansible-logs.repository';

describe('AnsibleLogsRepository', () => {
  let repository: AnsibleLogsRepository;
  let mockLogsRepository: {
    findAllByIdent: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockLogsRepository = {
      findAllByIdent: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnsibleLogsRepository,
        {
          provide: LogsModuleAnsibleLogsRepository,
          useValue: mockLogsRepository,
        },
      ],
    }).compile();

    repository = module.get<AnsibleLogsRepository>(AnsibleLogsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAllByIdent', () => {
    it('should return logs when found', async () => {
      const mockLogs = [{ id: '1', stdout: 'test log' }];
      mockLogsRepository.findAllByIdent.mockResolvedValue(mockLogs);

      const result = await repository.findAllByIdent('test-exec-id');

      expect(result).toEqual(mockLogs);
      expect(mockLogsRepository.findAllByIdent).toHaveBeenCalledWith('test-exec-id');
    });

    it('should return undefined when no logs are found', async () => {
      mockLogsRepository.findAllByIdent.mockResolvedValue(null);

      const result = await repository.findAllByIdent('test-exec-id');

      expect(result).toBeUndefined();
      expect(mockLogsRepository.findAllByIdent).toHaveBeenCalledWith('test-exec-id');
    });
  });
});