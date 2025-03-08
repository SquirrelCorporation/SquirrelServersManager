import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnsibleTaskRepository } from '../../../infrastructure/repositories/ansible-task.repository';
import { AnsibleTask } from '../../../infrastructure/schemas/ansible-task.schema';
import { IAnsibleTask } from '../../../domain/entities/ansible-task.interface';

describe('AnsibleTaskRepository', () => {
  let repository: AnsibleTaskRepository;
  let mockAnsibleTaskModel: any;

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

  const mockFindById = {
    exec: vi.fn(),
  };

  const mockCountDocuments = {
    exec: vi.fn(),
  };

  const mockTaskInstance = {
    save: vi.fn().mockResolvedValue({
      _id: { toString: () => '123' },
      ident: 'test-ident',
      status: 'pending',
      toObject: () => ({
        _id: '123',
        ident: 'test-ident',
        status: 'pending'
      })
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup model mocks
    mockAnsibleTaskModel = function() {
      return mockTaskInstance;
    };

    mockAnsibleTaskModel.find = vi.fn().mockReturnValue(mockFind);
    mockAnsibleTaskModel.findOne = vi.fn().mockReturnValue(mockFindOne);
    mockAnsibleTaskModel.findById = vi.fn().mockReturnValue(mockFindById);
    mockAnsibleTaskModel.findOneAndUpdate = vi.fn().mockReturnValue(mockFindOneAndUpdate);
    mockAnsibleTaskModel.countDocuments = vi.fn().mockReturnValue(mockCountDocuments);

    // Create the repository with the mock model
    repository = new AnsibleTaskRepository(
      mockAnsibleTaskModel as unknown as Model<AnsibleTask>,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ansible task', async () => {
      const task: Partial<IAnsibleTask> = {
        ident: 'test-ident',
        status: 'pending',
      };

      const result = await repository.create(task);

      expect(result).toEqual(expect.objectContaining({
        ident: 'test-ident',
        status: 'pending',
      }));
      expect(mockTaskInstance.save).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find a task by id', async () => {
      const id = '123';
      const mockTask = {
        _id: { toString: () => id },
        ident: 'test-ident',
        status: 'pending',
      };

      mockFindById.exec.mockResolvedValue(mockTask);

      const result = await repository.findById(id);

      expect(mockAnsibleTaskModel.findById).toHaveBeenCalledWith(id);
      expect(mockFindById.exec).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        _id: id,
        ident: 'test-ident',
        status: 'pending',
      }));
    });
  });

  describe('findByIdent', () => {
    it('should find a task by ident', async () => {
      const ident = 'test-ident';
      const mockTask = {
        _id: { toString: () => '123' },
        ident,
        status: 'pending',
      };

      mockFindOne.exec.mockResolvedValue(mockTask);

      const result = await repository.findByIdent(ident);

      expect(mockAnsibleTaskModel.findOne).toHaveBeenCalledWith({ ident });
      expect(mockFindOne.exec).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        ident,
        status: 'pending',
      }));
    });
  });

  describe('updateStatus', () => {
    it('should update a task status', async () => {
      const ident = 'test-ident';
      const status = 'completed';
      const mockTask = {
        _id: { toString: () => '123' },
        ident,
        status,
      };

      mockFindOneAndUpdate.exec.mockResolvedValue(mockTask);

      const result = await repository.updateStatus(ident, status);

      expect(mockAnsibleTaskModel.findOneAndUpdate).toHaveBeenCalledWith(
        { ident },
        { status },
        { new: true }
      );
      expect(mockFindOneAndUpdate.exec).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        ident,
        status,
      }));
    });
  });
});
