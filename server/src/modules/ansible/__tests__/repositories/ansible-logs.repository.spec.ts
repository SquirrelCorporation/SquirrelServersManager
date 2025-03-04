import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleLogsRepository } from '../../repositories/ansible-logs.repository';
import { AnsibleLog, AnsibleLogDocument } from '../../schemas/ansible-log.schema';

describe('AnsibleLogsRepository', () => {
  let repository: AnsibleLogsRepository;
  let mockAnsibleLogModel: any;

  const mockFind = {
    sort: vi.fn(),
    lean: vi.fn(),
    exec: vi.fn(),
  };

  const mockDeleteMany = {
    exec: vi.fn(),
  };

  const mockCountDocuments = {
    exec: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAnsibleLogModel = {
      find: vi.fn().mockReturnValue(mockFind),
      deleteMany: vi.fn().mockReturnValue(mockDeleteMany),
      countDocuments: vi.fn().mockReturnValue(mockCountDocuments),
      save: vi.fn().mockResolvedValue({ toObject: () => ({}) }),
    };

    mockFind.sort.mockReturnValue(mockFind);
    mockFind.lean.mockReturnValue(mockFind);
    mockFind.exec.mockResolvedValue([]);

    mockDeleteMany.exec.mockResolvedValue({ deletedCount: 1 });

    mockCountDocuments.exec.mockResolvedValue(0);

    // Mock the constructor
    const mockModel = function() {
      return {
        save: mockAnsibleLogModel.save,
      };
    };
    mockModel.find = mockAnsibleLogModel.find;
    mockModel.deleteMany = mockAnsibleLogModel.deleteMany;
    mockModel.countDocuments = mockAnsibleLogModel.countDocuments;

    repository = new AnsibleLogsRepository(mockModel as unknown as Model<AnsibleLogDocument>);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ansible log', async () => {
      const log: Partial<AnsibleLog> = { 
        ident: 'test-task-id', 
        content: 'test-event',
        stdout: 'test-stdout',
        logRunnerId: 'test-runner-id'
      };
      
      await repository.create(log);
      expect(mockAnsibleLogModel.save).toHaveBeenCalled();
    });
  });

  describe('findByTaskId', () => {
    it('should find logs by taskId', async () => {
      const taskId = 'test-task-id';
      const result = await repository.findByTaskId(taskId);

      expect(mockAnsibleLogModel.find).toHaveBeenCalledWith({ ident: taskId });
      expect(mockFind.sort).toHaveBeenCalledWith({ timestamp: 1 });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findByTaskIdAndEvent', () => {
    it('should find logs by taskId and event', async () => {
      const taskId = 'test-task-id';
      const event = 'test-event';
      const result = await repository.findByTaskIdAndEvent(taskId, event);

      expect(mockAnsibleLogModel.find).toHaveBeenCalledWith({ ident: taskId, content: event });
      expect(mockFind.sort).toHaveBeenCalledWith({ timestamp: 1 });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('deleteByTaskId', () => {
    it('should delete logs by taskId', async () => {
      const taskId = 'test-task-id';
      await repository.deleteByTaskId(taskId);

      expect(mockAnsibleLogModel.deleteMany).toHaveBeenCalledWith({ ident: taskId });
      expect(mockDeleteMany.exec).toHaveBeenCalled();
    });
  });

  describe('countByTaskId', () => {
    it('should count logs by taskId', async () => {
      const taskId = 'test-task-id';
      const result = await repository.countByTaskId(taskId);

      expect(mockAnsibleLogModel.countDocuments).toHaveBeenCalledWith({ ident: taskId });
      expect(mockCountDocuments.exec).toHaveBeenCalled();
      expect(result).toEqual(0);
    });
  });
}); 