import { DateTime } from 'luxon';
import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerLogsRepository } from '../../repositories/server-logs.repository';
import { ServerLog } from '../../schemas/server-log.schema';

describe('ServerLogsRepository', () => {
  let repository: ServerLogsRepository;
  let mockServerLogModel: any;

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

    mockFind.sort.mockReturnValue(mockFind);
    mockFind.limit.mockReturnValue(mockFind);
    mockFind.lean.mockReturnValue(mockFind);
    mockFind.exec.mockResolvedValue([]);

    mockDeleteMany.exec.mockResolvedValue({ deletedCount: 1 });

    repository = new ServerLogsRepository(mockServerLogModel as unknown as Model<ServerLog>);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all logs', async () => {
      const result = await repository.findAll();

      expect(mockServerLogModel.find).toHaveBeenCalled();
      expect(mockFind.sort).toHaveBeenCalledWith({ time: -1 });
      expect(mockFind.limit).toHaveBeenCalledWith(10000);
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('deleteAllOld', () => {
    it('should delete old logs', async () => {
      const ageInDays = 30;
      const date = DateTime.now().minus({ day: ageInDays }).toJSDate();

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
