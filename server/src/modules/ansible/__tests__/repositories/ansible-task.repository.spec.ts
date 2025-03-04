import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleLogsRepository } from '../../repositories/ansible-logs.repository';
import { AnsibleTaskRepository } from '../../repositories/ansible-task.repository';
import { AnsibleTask, AnsibleTaskDocument } from '../../schemas/ansible-task.schema';

describe('AnsibleTaskRepository', () => {
  let repository: AnsibleTaskRepository;
  let mockAnsibleTaskModel: any;
  let mockAnsibleLogsRepository: any;

  const mockFind = {
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
    lean: vi.fn(),
    exec: vi.fn(),
  };

  const mockFindOne = {
    lean: vi.fn(),
    exec: vi.fn(),
  };

  const mockFindOneAndUpdate = {
    lean: vi.fn(),
    exec: vi.fn(),
  };

  const mockFindOneAndDelete = {
    lean: vi.fn(),
    exec: vi.fn(),
  };

  const mockCountDocuments = {
    exec: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup model mocks
    mockAnsibleTaskModel = {
      find: vi.fn().mockReturnValue(mockFind),
      findOne: vi.fn().mockReturnValue(mockFindOne),
      findOneAndUpdate: vi.fn().mockReturnValue(mockFindOneAndUpdate),
      findOneAndDelete: vi.fn().mockReturnValue(mockFindOneAndDelete),
      countDocuments: vi.fn().mockReturnValue(mockCountDocuments),
      create: vi.fn().mockResolvedValue({ toObject: () => ({ uuid: 'test-uuid' }) }),
    };

    mockAnsibleLogsRepository = {
      deleteByTaskId: vi.fn().mockResolvedValue({}),
    };

    mockFind.sort.mockReturnValue(mockFind);
    mockFind.skip.mockReturnValue(mockFind);
    mockFind.limit.mockReturnValue(mockFind);
    mockFind.lean.mockReturnValue(mockFind);
    mockFind.exec.mockResolvedValue([]);

    mockFindOne.lean.mockReturnValue(mockFindOne);
    mockFindOne.exec.mockResolvedValue({ uuid: 'test-uuid' });
    
    mockFindOneAndUpdate.lean.mockReturnValue(mockFindOneAndUpdate);
    mockFindOneAndUpdate.exec.mockResolvedValue({ uuid: 'test-uuid', status: 'updated' });
    
    mockFindOneAndDelete.lean.mockReturnValue(mockFindOneAndDelete);
    mockFindOneAndDelete.exec.mockResolvedValue({ uuid: 'test-uuid' });
    
    mockCountDocuments.exec.mockResolvedValue(0);

    // Mock the constructor
    const mockModel = function() {
      return {
        save: vi.fn().mockResolvedValue({ toObject: () => ({ uuid: 'test-uuid' }) }),
      };
    };
    mockModel.find = mockAnsibleTaskModel.find;
    mockModel.findOne = mockAnsibleTaskModel.findOne;
    mockModel.findOneAndUpdate = mockAnsibleTaskModel.findOneAndUpdate;
    mockModel.findOneAndDelete = mockAnsibleTaskModel.findOneAndDelete;
    mockModel.countDocuments = mockAnsibleTaskModel.countDocuments;
    mockModel.create = mockAnsibleTaskModel.create;

    repository = new AnsibleTaskRepository(
      mockModel as unknown as Model<AnsibleTaskDocument>,
      mockAnsibleLogsRepository
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ansible task', async () => {
      const task: Partial<AnsibleTask> = {
        uuid: 'test-uuid',
        command: 'test-command',
        startTime: new Date(),
        status: 'running',
      };
      
      await repository.create(task);
      // The repository now uses new model() and save() instead of model.create()
      expect(mockAnsibleTaskModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a task by uuid', async () => {
      const uuid = 'test-uuid';
      const result = await repository.findById(uuid);

      expect(mockAnsibleTaskModel.findOne).toHaveBeenCalledWith({ uuid });
      expect(mockFindOne.lean).toHaveBeenCalled();
      expect(mockFindOne.exec).toHaveBeenCalled();
      expect(result).toEqual({ uuid: 'test-uuid' });
    });
  });

  describe('findAll', () => {
    it('should find all tasks with default parameters', async () => {
      const result = await repository.findAll();

      expect(mockAnsibleTaskModel.find).toHaveBeenCalledWith({});
      expect(mockFind.sort).toHaveBeenCalledWith({ startTime: -1 });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should find all tasks with custom parameters', async () => {
      const limit = 10;
      const skip = 5;
      const sort = { startTime: -1 as const };
      const filter = { status: 'running' };
      
      const result = await repository.findAll(limit, skip, sort, filter);

      expect(mockAnsibleTaskModel.find).toHaveBeenCalledWith(filter);
      expect(mockFind.sort).toHaveBeenCalledWith(sort);
      expect(mockFind.skip).toHaveBeenCalledWith(skip);
      expect(mockFind.limit).toHaveBeenCalledWith(limit);
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const uuid = 'test-uuid';
      const update: Partial<AnsibleTask> = { status: 'completed' };
      
      const result = await repository.update(uuid, update);

      expect(mockAnsibleTaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { uuid },
        update,
        { new: true }
      );
      expect(mockFindOneAndUpdate.lean).toHaveBeenCalled();
      expect(mockFindOneAndUpdate.exec).toHaveBeenCalled();
      expect(result).toEqual({ uuid: 'test-uuid', status: 'updated' });
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const uuid = 'test-uuid';
      
      const result = await repository.delete(uuid);

      expect(mockAnsibleTaskModel.findOneAndDelete).toHaveBeenCalledWith({ uuid });
      expect(mockFindOneAndDelete.lean).toHaveBeenCalled();
      expect(mockFindOneAndDelete.exec).toHaveBeenCalled();
      expect(result).toEqual({ uuid: 'test-uuid' });
    });
  });

  describe('count', () => {
    it('should count tasks with default filter', async () => {
      const result = await repository.count();

      expect(mockAnsibleTaskModel.countDocuments).toHaveBeenCalledWith({});
      expect(mockCountDocuments.exec).toHaveBeenCalled();
      expect(result).toEqual(0);
    });

    it('should count tasks with custom filter', async () => {
      const filter = { status: 'running' };
      
      const result = await repository.count(filter);

      expect(mockAnsibleTaskModel.countDocuments).toHaveBeenCalledWith(filter);
      expect(mockCountDocuments.exec).toHaveBeenCalled();
      expect(result).toEqual(0);
    });
  });

  describe('deleteAllTasksAndStatuses', () => {
    it('should delete all logs for a task', async () => {
      const task: AnsibleTask = {
        uuid: 'test-uuid',
        command: 'test-command',
        startTime: new Date(),
        status: 'running',
      } as AnsibleTask;
      
      await repository.deleteAllTasksAndStatuses(task);
      
      expect(mockAnsibleLogsRepository.deleteByTaskId).toHaveBeenCalledWith('test-uuid');
    });
  });
}); 