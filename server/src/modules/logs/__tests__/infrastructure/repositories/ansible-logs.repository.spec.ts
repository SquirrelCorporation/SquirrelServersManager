import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleLogsRepository } from '../../../infrastructure/repositories/ansible-logs.repository';
import { AnsibleLog } from '../../../infrastructure/schemas/ansible-log.schema';
import { AnsibleLogMapper } from '../../../infrastructure/mappers/ansible-log.mapper';
import { AnsibleLogEntity } from '../../../domain/entities/ansible-log.entity';

describe('AnsibleLogsRepository', () => {
  let repository: AnsibleLogsRepository;
  let mockAnsibleLogModel: any;
  let mockAnsibleLogMapper: any;

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
      find: vi.fn().mockReturnValue(mockFind),
      deleteMany: vi.fn().mockReturnValue(mockDeleteMany),
      create: vi.fn(),
    };

    mockAnsibleLogMapper = {
      toDomain: vi.fn().mockImplementation(log => log),
      toPersistence: vi.fn().mockImplementation(entity => entity),
    };

    mockFind.sort.mockReturnValue(mockFind);
    mockFind.lean.mockReturnValue(mockFind);
    mockFind.exec.mockResolvedValue([]);

    mockDeleteMany.lean.mockReturnValue(mockDeleteMany);
    mockDeleteMany.exec.mockResolvedValue({ deletedCount: 1 });

    repository = new AnsibleLogsRepository(
      mockAnsibleLogModel as unknown as Model<AnsibleLog>,
      mockAnsibleLogMapper as unknown as AnsibleLogMapper
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ansible log', async () => {
      const ansibleLog: Partial<AnsibleLogEntity> = {
        ident: 'test-ident',
        content: 'test-content',
      };

      const createdLog = {
        ident: 'test-ident',
        content: 'test-content',
        toObject: () => ({
          ident: 'test-ident',
          content: 'test-content',
        }),
      };

      mockAnsibleLogModel.create.mockResolvedValue(createdLog);

      const result = await repository.create(ansibleLog);

      expect(mockAnsibleLogMapper.toPersistence).toHaveBeenCalledWith(ansibleLog);
      expect(mockAnsibleLogModel.create).toHaveBeenCalled();
      expect(mockAnsibleLogMapper.toDomain).toHaveBeenCalledWith(createdLog.toObject());
      expect(result).toEqual(createdLog.toObject());
    });
  });

  describe('findAllByIdent', () => {
    it('should return all logs by ident', async () => {
      const ident = 'test-ident';
      const mockLogs = [{ ident }, { ident }];
      mockFind.exec.mockResolvedValue(mockLogs);

      const result = await repository.findAllByIdent(ident);

      expect(mockAnsibleLogModel.find).toHaveBeenCalledWith({ ident: { $eq: ident } });
      expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(mockAnsibleLogMapper.toDomain).toHaveBeenCalledTimes(mockLogs.length);
      expect(result).toEqual(mockLogs);
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
