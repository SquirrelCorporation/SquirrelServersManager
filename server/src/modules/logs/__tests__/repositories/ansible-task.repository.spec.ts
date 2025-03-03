import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleLogsRepository } from '../../repositories/ansible-logs.repository';
import { AnsibleTaskRepository } from '../../repositories/ansible-task.repository';
import { AnsibleTask } from '../../schemas/ansible-task.schema';

describe('AnsibleTaskRepository', () => {
  let repository: AnsibleTaskRepository;
  let mockAnsibleTaskModel: any;
  let mockAnsibleLogsRepository: any;

  const mockFind = {
    sort: vi.fn(),
    lean: vi.fn(),
    exec: vi.fn(),
  };

  const mockFindOneAndUpdate = {
    lean: vi.fn(),
    exec: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup model mocks
    mockAnsibleTaskModel = {
      create: vi.fn().mockResolvedValue({
        toObject: () => ({ ident: 'test-ident', status: 'pending', cmd: 'test-cmd' }),
      }),
      findOneAndUpdate: vi.fn().mockReturnValue(mockFindOneAndUpdate),
      find: vi.fn().mockReturnValue(mockFind),
    };

    mockFindOneAndUpdate.lean.mockReturnValue(mockFindOneAndUpdate);
    mockFindOneAndUpdate.exec.mockResolvedValue({ ident: 'test-ident', status: 'updated' });

    mockFind.sort.mockReturnValue(mockFind);
    mockFind.lean.mockReturnValue(mockFind);
    mockFind.exec.mockResolvedValue([]);

    // Create mock for AnsibleLogsRepository
    mockAnsibleLogsRepository = {
      deleteAllByIdent: vi.fn().mockResolvedValue({ deletedCount: 1 }),
    };

    // Manually create repository instance
    repository = new AnsibleTaskRepository(
      mockAnsibleTaskModel as unknown as Model<AnsibleTask>,
      mockAnsibleLogsRepository as unknown as AnsibleLogsRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ansible task', async () => {
      const ansibleTask = { ident: 'test-ident', status: 'pending', cmd: 'test-cmd' };
      const result = await repository.create(ansibleTask);

      expect(mockAnsibleTaskModel.create).toHaveBeenCalledWith(ansibleTask);
      expect(result).toEqual(ansibleTask);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a task', async () => {
      const ident = 'test-ident';
      const status = 'completed';
      const result = await repository.updateStatus(ident, status);

      expect(mockAnsibleTaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { ident: { $eq: ident } },
        { status: status },
      );
      expect(mockFindOneAndUpdate.lean).toHaveBeenCalled();
      expect(mockFindOneAndUpdate.exec).toHaveBeenCalled();
      expect(result).toEqual({ ident: 'test-ident', status: 'updated' });
    });
  });

  describe('findAll', () => {
    it('should find all tasks', async () => {
      const result = await repository.findAll();

      expect(mockAnsibleTaskModel.find).toHaveBeenCalled();
      expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findAllOld', () => {
    it('should find all old tasks', async () => {
      const ageInMinutes = 30;
      const result = await repository.findAllOld(ageInMinutes);

      expect(mockAnsibleTaskModel.find).toHaveBeenCalledWith({
        createdAt: { $lt: expect.any(Date) },
      });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('deleteAllTasksAndStatuses', () => {
    it('should delete all statuses for a task', async () => {
      const ansibleTask = { ident: 'test-ident' } as AnsibleTask;
      await repository.deleteAllTasksAndStatuses(ansibleTask);

      expect(mockAnsibleLogsRepository.deleteAllByIdent).toHaveBeenCalledWith('test-ident');
    });
  });

  describe('deleteAllOldLogsAndStatuses', () => {
    it('should delete all old logs and statuses', async () => {
      const ageInMinutes = 30;
      const mockTasks = [{ ident: 'task-1' }, { ident: 'task-2' }] as AnsibleTask[];

      vi.spyOn(repository, 'findAllOld').mockResolvedValue(mockTasks);
      vi.spyOn(repository, 'deleteAllTasksAndStatuses').mockResolvedValue(undefined);

      await repository.deleteAllOldLogsAndStatuses(ageInMinutes);

      expect(repository.findAllOld).toHaveBeenCalledWith(ageInMinutes);
      expect(repository.deleteAllTasksAndStatuses).toHaveBeenCalledTimes(2);
      expect(repository.deleteAllTasksAndStatuses).toHaveBeenCalledWith(mockTasks[0]);
      expect(repository.deleteAllTasksAndStatuses).toHaveBeenCalledWith(mockTasks[1]);
    });

    it('should handle empty task list', async () => {
      const ageInMinutes = 30;

      vi.spyOn(repository, 'findAllOld').mockResolvedValue([]);
      vi.spyOn(repository, 'deleteAllTasksAndStatuses').mockResolvedValue(undefined);

      await repository.deleteAllOldLogsAndStatuses(ageInMinutes);

      expect(repository.findAllOld).toHaveBeenCalledWith(ageInMinutes);
      expect(repository.deleteAllTasksAndStatuses).not.toHaveBeenCalled();
    });
  });
});
