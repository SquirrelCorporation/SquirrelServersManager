import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleTaskRepository } from '../../../infrastructure/repositories/ansible-task.repository';
import { AnsibleTask } from '../../../infrastructure/schemas/ansible-task.schema';
import { AnsibleTaskMapper } from '../../../infrastructure/mappers/ansible-task.mapper';
import { AnsibleLogsRepository } from '../../../infrastructure/repositories/ansible-logs.repository';
import { AnsibleTaskEntity } from '../../../domain/entities/ansible-task.entity';

describe('AnsibleTaskRepository', () => {
  let repository: AnsibleTaskRepository;
  let mockAnsibleTaskModel: any;
  let mockAnsibleTaskMapper: any;
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

    mockAnsibleTaskModel = {
      find: vi.fn().mockReturnValue(mockFind),
      findOneAndUpdate: vi.fn().mockReturnValue(mockFindOneAndUpdate),
      create: vi.fn(),
    };

    mockAnsibleTaskMapper = {
      toDomain: vi.fn().mockImplementation(task => task),
      toPersistence: vi.fn().mockImplementation(entity => entity),
    };

    mockAnsibleLogsRepository = {
      deleteAllByIdent: vi.fn().mockResolvedValue(undefined),
    };

    mockFind.sort.mockReturnValue(mockFind);
    mockFind.lean.mockReturnValue(mockFind);
    mockFind.exec.mockResolvedValue([]);

    mockFindOneAndUpdate.lean.mockReturnValue(mockFindOneAndUpdate);
    mockFindOneAndUpdate.exec.mockResolvedValue({ ident: 'test-ident', status: 'updated' });

    repository = new AnsibleTaskRepository(
      mockAnsibleTaskModel as unknown as Model<AnsibleTask>,
      mockAnsibleTaskMapper as unknown as AnsibleTaskMapper,
      mockAnsibleLogsRepository as unknown as AnsibleLogsRepository
    );
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

      const createdTask = {
        ident: 'test-ident',
        status: 'test-status',
        cmd: 'test-cmd',
        toObject: () => ({
          ident: 'test-ident',
          status: 'test-status',
          cmd: 'test-cmd',
        }),
      };

      mockAnsibleTaskModel.create.mockResolvedValue(createdTask);

      const result = await repository.create(ansibleTask);

      expect(mockAnsibleTaskMapper.toPersistence).toHaveBeenCalledWith(ansibleTask);
      expect(mockAnsibleTaskModel.create).toHaveBeenCalled();
      expect(mockAnsibleTaskMapper.toDomain).toHaveBeenCalledWith(createdTask.toObject());
      expect(result).toEqual(createdTask.toObject());
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a task', async () => {
      const ident = 'test-ident';
      const status = 'updated';
      const updatedTask = { ident, status };

      mockFindOneAndUpdate.exec.mockResolvedValue(updatedTask);

      const result = await repository.updateStatus(ident, status);

      expect(mockAnsibleTaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { ident: { $eq: ident } },
        { status }
      );
      expect(mockFindOneAndUpdate.lean).toHaveBeenCalled();
      expect(mockFindOneAndUpdate.exec).toHaveBeenCalled();
      expect(mockAnsibleTaskMapper.toDomain).toHaveBeenCalledWith(updatedTask);
      expect(result).toEqual(updatedTask);
    });

    it('should return null if no task is found', async () => {
      const ident = 'non-existent';
      const status = 'updated';

      mockFindOneAndUpdate.exec.mockResolvedValue(null);

      const result = await repository.updateStatus(ident, status);

      expect(mockAnsibleTaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { ident: { $eq: ident } },
        { status }
      );
      expect(mockFindOneAndUpdate.lean).toHaveBeenCalled();
      expect(mockFindOneAndUpdate.exec).toHaveBeenCalled();
      expect(mockAnsibleTaskMapper.toDomain).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const mockTasks = [{ ident: '1' }, { ident: '2' }];
      mockFind.exec.mockResolvedValue(mockTasks);

      const result = await repository.findAll();

      expect(mockAnsibleTaskModel.find).toHaveBeenCalled();
      expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(mockAnsibleTaskMapper.toDomain).toHaveBeenCalledTimes(mockTasks.length);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('findAllOld', () => {
    it('should return all old tasks', async () => {
      const ageInMinutes = 30;
      const mockTasks = [{ ident: '1' }, { ident: '2' }];
      mockFind.exec.mockResolvedValue(mockTasks);

      const result = await repository.findAllOld(ageInMinutes);

      expect(mockAnsibleTaskModel.find).toHaveBeenCalledWith({
        createdAt: { $lt: expect.any(Date) },
      });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(mockAnsibleTaskMapper.toDomain).toHaveBeenCalledTimes(mockTasks.length);
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

      expect(mockAnsibleLogsRepository.deleteAllByIdent).toHaveBeenCalledWith(ansibleTask.ident);
    });
  });

  describe('deleteAllOldLogsAndStatuses', () => {
    it('should delete all old logs and statuses', async () => {
      const ageInMinutes = 30;
      const mockTasks = [
        { ident: '1', status: 'status1', cmd: 'cmd1' },
        { ident: '2', status: 'status2', cmd: 'cmd2' },
      ];
      mockFind.exec.mockResolvedValue(mockTasks);

      await repository.deleteAllOldLogsAndStatuses(ageInMinutes);

      expect(mockAnsibleTaskModel.find).toHaveBeenCalledWith({
        createdAt: { $lt: expect.any(Date) },
      });
      expect(mockFind.lean).toHaveBeenCalled();
      expect(mockFind.exec).toHaveBeenCalled();
      expect(mockAnsibleTaskMapper.toDomain).toHaveBeenCalledTimes(mockTasks.length);
      expect(mockAnsibleLogsRepository.deleteAllByIdent).toHaveBeenCalledTimes(mockTasks.length);
    });
  });
});
