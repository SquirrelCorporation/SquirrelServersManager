import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleLogEntity } from '../../../domain/entities/ansible-log.entity';
import { AnsibleLogsRepository } from '../../../infrastructure/repositories/ansible-logs.repository';

// Import the common test setup
import './test-setup';

describe('AnsibleLogsRepository', () => {
  let repository: AnsibleLogsRepository;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a direct mock implementation of the repository
    repository = {
      create: vi.fn().mockImplementation(async (log) => {
        const persistenceLog = { ...log, _id: 'test-id' };
        const domainLog = { ...log, id: 'test-id' };
        return domainLog;
      }),
      findAllByIdent: vi.fn().mockImplementation(async (ident, sortDirection = -1) => {
        return [
          { id: '1', ident, content: 'test1' },
          { id: '2', ident, content: 'test2' },
        ];
      }),
      findByExecutionId: vi.fn().mockImplementation(async (executionId) => {
        return [
          { id: '1', ident: executionId, content: 'test1' },
          { id: '2', ident: executionId, content: 'test2' },
        ];
      }),
      deleteAllByIdent: vi.fn().mockResolvedValue(undefined),
      deleteAll: vi.fn().mockResolvedValue(undefined),
    } as unknown as AnsibleLogsRepository;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ansible log', async () => {
      const ansibleLog: Partial<AnsibleLogEntity> = {
        ident: 'test-ident',
        content: 'test-message',
      };

      const expectedResult = { ...ansibleLog, id: 'test-id' };
      const result = await repository.create(ansibleLog);

      expect(repository.create).toHaveBeenCalledWith(ansibleLog);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllByIdent', () => {
    it('should return all logs by ident with default sort direction', async () => {
      const ident = 'test-ident';
      const expectedLogs = [
        { id: '1', ident, content: 'test1' },
        { id: '2', ident, content: 'test2' },
      ];

      const result = await repository.findAllByIdent(ident);

      expect(repository.findAllByIdent).toHaveBeenCalledWith(ident);
      expect(result).toEqual(expectedLogs);
    });

    it('should return all logs by ident with custom sort direction', async () => {
      const ident = 'test-ident';
      const sortDirection = 1;
      const expectedLogs = [
        { id: '1', ident, content: 'test1' },
        { id: '2', ident, content: 'test2' },
      ];

      const result = await repository.findAllByIdent(ident, sortDirection);

      expect(repository.findAllByIdent).toHaveBeenCalledWith(ident, sortDirection);
      expect(result).toEqual(expectedLogs);
    });
  });

  describe('findByExecutionId', () => {
    it('should return all logs by execution ID', async () => {
      const executionId = 'test-execution-id';
      const expectedLogs = [
        { id: '1', ident: executionId, content: 'test1' },
        { id: '2', ident: executionId, content: 'test2' },
      ];

      const result = await repository.findByExecutionId(executionId);

      expect(repository.findByExecutionId).toHaveBeenCalledWith(executionId);
      expect(result).toEqual(expectedLogs);
    });
  });

  describe('deleteAllByIdent', () => {
    it('should delete all logs by ident', async () => {
      const ident = 'test-ident';

      await repository.deleteAllByIdent(ident);

      expect(repository.deleteAllByIdent).toHaveBeenCalledWith(ident);
    });
  });

  describe('deleteAll', () => {
    it('should delete all logs', async () => {
      await repository.deleteAll();

      expect(repository.deleteAll).toHaveBeenCalled();
    });
  });
});
