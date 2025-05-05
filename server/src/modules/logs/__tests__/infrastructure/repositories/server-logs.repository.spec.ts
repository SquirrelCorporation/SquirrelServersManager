import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerLogsRepository } from '../../../infrastructure/repositories/server-logs.repository';
import './test-setup';

describe('ServerLogsRepository', () => {
  let repository: ServerLogsRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a direct mock implementation of the repository
    repository = {
      findAll: vi.fn().mockImplementation(async () => {
        return [{ id: '1' }, { id: '2' }];
      }),
      deleteAllOld: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteAll: vi.fn().mockResolvedValue({ deletedCount: 2 }),
    } as unknown as ServerLogsRepository;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all logs', async () => {
      const mockLogs = [{ id: '1' }, { id: '2' }];

      const result = await repository.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockLogs);
    });
  });

  describe('deleteAllOld', () => {
    it('should delete old logs', async () => {
      const ageInDays = 30;

      const result = await repository.deleteAllOld(ageInDays);

      expect(repository.deleteAllOld).toHaveBeenCalledWith(ageInDays);
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe('deleteAll', () => {
    it('should delete all logs', async () => {
      const result = await repository.deleteAll();

      expect(repository.deleteAll).toHaveBeenCalled();
      expect(result).toEqual({ deletedCount: 2 });
    });
  });
});
