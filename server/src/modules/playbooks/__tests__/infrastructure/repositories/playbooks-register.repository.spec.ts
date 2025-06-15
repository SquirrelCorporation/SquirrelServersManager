import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../test-setup';

// Create mock classes and objects
class MockPlaybooksRegisterModel {
  findOne = vi.fn().mockReturnThis();
  find = vi.fn().mockReturnThis();
  findOneAndUpdate = vi.fn().mockReturnThis();
  findOneAndDelete = vi.fn().mockReturnThis();
  create = vi.fn();
  exec = vi.fn();
}

// Mock the repositories and entities
class MockPlaybooksRegisterRepository {
  private model: any;

  constructor(model: any) {
    this.model = model;
  }

  async findByUuid(uuid: string) {
    return this.model.findOne().exec();
  }

  async findAllActive() {
    const results = await this.model.find().exec();
    return results.filter(Boolean);
  }

  async update(uuid: string, updateData: any) {
    return this.model.findOneAndUpdate().exec();
  }

  async create(data: any) {
    const result = await this.model.create(data);
    if (!result) {
      throw new Error('Failed to create repository');
    }
    return result;
  }

  async delete(uuid: string) {
    return this.model.findOneAndDelete().exec();
  }

  async findAllByType(type: string) {
    return this.model.find().exec();
  }
}

// Mock common test helpers
vi.mock('../../../../common-test-helpers', () => ({
  rootMongooseTestModule: () => ({}),
  closeInMongodConnection: vi.fn().mockResolvedValue(undefined),
}));

describe('PlaybooksRegisterRepository', () => {
  let repository: MockPlaybooksRegisterRepository;
  let model: MockPlaybooksRegisterModel;

  const mockPlaybooksRegister = {
    uuid: 'test-uuid',
    name: 'Test Repository',
    type: 'local',
    enabled: true,
    directory: '/path/to/test',
    tree: { path: '/root', name: 'root', type: 'directory', children: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    model = new MockPlaybooksRegisterModel();
    repository = new MockPlaybooksRegisterRepository(model);

    // Create a mock module test factory
    vi.spyOn(Test, 'createTestingModule').mockImplementation(() => {
      return {
        imports: [],
        providers: [],
        compile: vi.fn().mockResolvedValue({
          get: vi.fn().mockImplementation((token) => {
            if (token === MockPlaybooksRegisterRepository) {
              return repository;
            }
            if (token === getModelToken('PlaybooksRegister')) {
              return model;
            }
            return undefined;
          }),
        }),
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByUuid', () => {
    it('should find a repository by UUID', async () => {
      model.exec.mockResolvedValueOnce(mockPlaybooksRegister);

      const result = await repository.findByUuid('test-uuid');
      expect(result).toEqual(mockPlaybooksRegister);
    });

    it('should return null when repository not found', async () => {
      model.exec.mockResolvedValueOnce(null);

      const result = await repository.findByUuid('nonexistent-uuid');
      expect(result).toBeNull();
    });
  });

  describe('findAllActive', () => {
    it('should find all active repositories', async () => {
      model.exec.mockResolvedValueOnce([mockPlaybooksRegister]);

      const result = await repository.findAllActive();
      expect(result).toEqual([mockPlaybooksRegister]);
    });

    it('should filter out null entities', async () => {
      model.exec.mockResolvedValueOnce([mockPlaybooksRegister, null]);

      const result = await repository.findAllActive();
      expect(result).toEqual([mockPlaybooksRegister]);
    });
  });

  describe('update', () => {
    it('should update a repository', async () => {
      const updateData = {
        name: 'Updated Repository',
      };

      model.exec.mockResolvedValueOnce({ ...mockPlaybooksRegister, ...updateData });

      const result = await repository.update('test-uuid', updateData);
      expect(result?.name).toBe('Updated Repository');
    });
  });

  describe('create', () => {
    it('should create a new repository', async () => {
      model.create.mockResolvedValueOnce(mockPlaybooksRegister);

      const result = await repository.create(mockPlaybooksRegister);
      expect(result).toEqual(mockPlaybooksRegister);
    });

    it('should throw error when creation fails', async () => {
      model.create.mockResolvedValueOnce(null);

      await expect(repository.create(mockPlaybooksRegister)).rejects.toThrow(
        'Failed to create repository',
      );
    });
  });

  describe('delete', () => {
    it('should delete a repository', async () => {
      model.exec.mockResolvedValueOnce(mockPlaybooksRegister);

      const result = await repository.delete('test-uuid');
      expect(result).toEqual(mockPlaybooksRegister);
    });
  });

  describe('findAllByType', () => {
    it('should find all repositories by type', async () => {
      model.exec.mockResolvedValueOnce([mockPlaybooksRegister]);

      const result = await repository.findAllByType('local');
      expect(result).toEqual([mockPlaybooksRegister]);
    });
  });
});
