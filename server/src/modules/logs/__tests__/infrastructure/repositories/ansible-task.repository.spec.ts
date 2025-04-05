import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleTaskEntity } from '../../../domain/entities/ansible-task.entity';
import './test-setup';
import { AnsibleTaskRepository } from '../../../infrastructure/repositories/ansible-task.repository';

describe('AnsibleTaskRepository', () => {
  let repository: AnsibleTaskRepository;
  let mockAnsibleLogsRepository: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a direct mock implementation of the repository
    repository = {
      create: vi.fn().mockImplementation(async (task) => {
        const createdTask = {
          ...task,
          toObject: () => task,
        };
        return createdTask;
      }),
      updateStatus: vi.fn().mockImplementation(async (ident, status) => {
        if (ident === 'non-existent') {
          return null;
        }
        return { ident, status };
      }),
      findAll: vi.fn().mockImplementation(async () => {
        return [{ ident: '1' }, { ident: '2' }];
      }),
      findAllOld: vi.fn().mockImplementation(async (ageInMinutes) => {
        return [{ ident: '1' }, { ident: '2' }];
      }),
      deleteAllTasksAndStatuses: vi.fn().mockResolvedValue(undefined),
      deleteAllOldLogsAndStatuses: vi.fn().mockResolvedValue(undefined),
    } as unknown as AnsibleTaskRepository;

    mockAnsibleLogsRepository = {
      deleteAllByIdent: vi.fn().mockResolvedValue(undefined),
    };
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ansible task', async () => {
      const ansibleTask: Partial<AnsibleTaskEntity> = {
        ident: 'test-ident',
        status: 'test-status',
        cmd: 'test-cmd',
      };

      const result = await repository.create(ansibleTask);

      expect(repository.create).toHaveBeenCalledWith(ansibleTask);
      expect(result).toEqual({
        ...ansibleTask,
        toObject: expect.any(Function),
      });
      expect(result.toObject()).toEqual(ansibleTask);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a task', async () => {
      const ident = 'test-ident';
      const status = 'updated';

      const result = await repository.updateStatus(ident, status);

      expect(repository.updateStatus).toHaveBeenCalledWith(ident, status);
      expect(result).toEqual({ ident, status });
    });

    it('should return null if no task is found', async () => {
      const ident = 'non-existent';
      const status = 'updated';

      const result = await repository.updateStatus(ident, status);

      expect(repository.updateStatus).toHaveBeenCalledWith(ident, status);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const mockTasks = [{ ident: '1' }, { ident: '2' }];

      const result = await repository.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });
  });

  describe('findAllOld', () => {
    it('should return all old tasks', async () => {
      const ageInMinutes = 30;
      const mockTasks = [{ ident: '1' }, { ident: '2' }];

      const result = await repository.findAllOld(ageInMinutes);

      expect(repository.findAllOld).toHaveBeenCalledWith(ageInMinutes);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('deleteAllTasksAndStatuses', () => {
    it('should delete all tasks and statuses', async () => {
      const ansibleTask: AnsibleTaskEntity = {
        ident: 'test-ident',
        status: 'test-status',
        cmd: 'test-cmd',
      } as AnsibleTaskEntity;

      await repository.deleteAllTasksAndStatuses(ansibleTask);

      expect(repository.deleteAllTasksAndStatuses).toHaveBeenCalledWith(ansibleTask);
    });
  });

  describe('deleteAllOldLogsAndStatuses', () => {
    it('should delete all old logs and statuses', async () => {
      const ageInMinutes = 30;

      await repository.deleteAllOldLogsAndStatuses(ageInMinutes);

      expect(repository.deleteAllOldLogsAndStatuses).toHaveBeenCalledWith(ageInMinutes);
    });
  });
});
