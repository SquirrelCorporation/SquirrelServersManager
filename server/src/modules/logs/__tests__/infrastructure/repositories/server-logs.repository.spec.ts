import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerLogsRepository } from '../../../infrastructure/repositories/server-logs.repository';
import { ServerLog } from '../../../infrastructure/schemas/server-log.schema';
import { ServerLogMapper } from '../../../infrastructure/mappers/server-log.mapper';

describe('ServerLogsRepository', () => {
  let repository: ServerLogsRepository;
  let mockServerLogModel: any;
  let mockServerLogMapper: any;

  const mockFind = {
    sort: vi.fn(),
    limit: vi.fn(),
    lean: vi.fn(),
    exec: vi.fn(),
  };

  const mockDeleteMany = {
    exec: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockServerLogModel = {
      find: vi.fn().mockReturnValue(mockFind),
      deleteMany: vi.fn().mockReturnValue(mockDeleteMany),
    };

    mockServerLogMapper = {
      toDomain: vi.fn().mockImplementation(log => log),
    };

    mockFind.sort.mockReturnValue(mockFind);
    mockFind.limit.mockReturnValue(mockFind);
    mockFind.lean.mockReturnValue(mockFind);
    mockFind.exec.mockResolvedValue([]);

    mockDeleteMany.exec.mockResolvedValue({ deletedCount: 1 });

    repository = new ServerLogsRepository(
      mockServerLogModel as unknown as Model<ServerLog>,
      mockServerLogMapper as unknown as ServerLogMapper
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all logs', async () => {
      const mockLogs = [{ id: '1' }, { id: '2' }];
      mockFind.exec.mockResolvedValue(mockLogs);

      const result = await repository.findAll();

      expect(mockServerLogModel.find).toHaveBeenCalled();
      expect(mockFind.sort).toHaveBeenCalledWith({ time: -1 });
      expect(mockFind.limit).toHaveBeenCalledWith(10000);
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(mockServerLogMapper.toDomain).toHaveBeenCalledTimes(mockLogs.length);
      expect(result).toEqual(mockLogs);
    });
  });

  describe('deleteAllOld', () => {
    it('should delete old logs', async () => {
      const ageInDays = 30;

      await repository.deleteAllOld(ageInDays);

      expect(mockServerLogModel.deleteMany).toHaveBeenCalledWith({
        time: { $lt: expect.any(Date) },
      });
      expect(mockDeleteMany.exec).toHaveBeenCalled();
    });
  });

  describe('deleteAll', () => {
    it('should delete all logs', async () => {
      await repository.deleteAll();

      expect(mockServerLogModel.deleteMany).toHaveBeenCalled();
      expect(mockDeleteMany.exec).toHaveBeenCalled();
    });
  });
});
