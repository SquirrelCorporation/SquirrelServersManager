import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleLogsRepository } from '../../repositories/ansible-logs.repository';
import { AnsibleLog } from '../../schemas/ansible-log.schema';

describe('AnsibleLogsRepository', () => {
  let repository: AnsibleLogsRepository;
  let mockAnsibleLogModel: any;

  const mockFind = {
    sort: vi.fn(),
    lean: vi.fn(),
    exec: vi.fn(),
  };

  const mockDeleteMany = {
    lean: vi.fn(),
    exec: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAnsibleLogModel = {
      create: vi.fn().mockResolvedValue({
        toObject: () => ({ ident: 'test-ident', content: 'test-content' }),
      }),
      find: vi.fn().mockReturnValue(mockFind),
      deleteMany: vi.fn().mockReturnValue(mockDeleteMany),
    };

    mockFind.sort.mockReturnValue(mockFind);
    mockFind.lean.mockReturnValue(mockFind);
    mockFind.exec.mockResolvedValue([]);

    mockDeleteMany.lean.mockReturnValue(mockDeleteMany);
    mockDeleteMany.exec.mockResolvedValue({ deletedCount: 1 });

    repository = new AnsibleLogsRepository(mockAnsibleLogModel as unknown as Model<AnsibleLog>);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ansible log', async () => {
      const ansibleLog = { ident: 'test-ident', content: 'test-content' };
      const result = await repository.create(ansibleLog);

      expect(mockAnsibleLogModel.create).toHaveBeenCalledWith(ansibleLog);
      expect(result).toEqual(ansibleLog);
    });
  });

  describe('findAllByIdent', () => {
    it('should find all logs by ident with default sort direction', async () => {
      const ident = 'test-ident';
      const result = await repository.findAllByIdent(ident);

      expect(mockAnsibleLogModel.find).toHaveBeenCalledWith({ ident: { $eq: ident } });
      expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should find all logs by ident with specified sort direction', async () => {
      const ident = 'test-ident';
      const sortDirection = 1;
      const result = await repository.findAllByIdent(ident, sortDirection);

      expect(mockAnsibleLogModel.find).toHaveBeenCalledWith({ ident: { $eq: ident } });
      expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: sortDirection });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('deleteAllByIdent', () => {
    it('should delete all logs by ident', async () => {
      const ident = 'test-ident';
      await repository.deleteAllByIdent(ident);

      expect(mockAnsibleLogModel.deleteMany).toHaveBeenCalledWith({ ident: { $eq: ident } });
      expect(mockDeleteMany.lean).toHaveBeenCalled();
      expect(mockDeleteMany.exec).toHaveBeenCalled();
    });
  });

  describe('deleteAll', () => {
    it('should delete all logs', async () => {
      await repository.deleteAll();

      expect(mockAnsibleLogModel.deleteMany).toHaveBeenCalled();
      expect(mockDeleteMany.exec).toHaveBeenCalled();
    });
  });
});
