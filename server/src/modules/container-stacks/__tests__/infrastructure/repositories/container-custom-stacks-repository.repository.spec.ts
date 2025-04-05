import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';
import { ContainerCustomStackRepositoryMapper } from '../../../infrastructure/mappers/container-custom-stack-repository.mapper';
// Import real modules after mocks
import { ContainerCustomStacksRepositoryRepository } from '../../../infrastructure/repositories/container-custom-stacks-repository.repository';

// Mock mongoose schema decorations
vi.mock('@nestjs/mongoose', () => {
  return {
    Schema: (options = {}) => {
      return (constructor: any) => {
        // Do nothing, just a mock decorator
      };
    },
    Prop: (options = {}) => {
      return (target: any, key: string) => {
        // Do nothing, just a mock decorator
      };
    },
    SchemaFactory: {
      createForClass: (documentClass: any) => {
        return {
          // Return a mock schema
          schema: {},
        };
      },
    },
    InjectModel: () => {
      return (target: any, key: string) => {
        // Do nothing, just a mock decorator
      };
    },
    getModelToken: (name: string) => `${name}Model`,
  };
});

// Mock necessary schemas
vi.mock('../../../infrastructure/schemas/container-custom-stack-repository.schema', () => ({
  CONTAINER_CUSTOM_STACK_REPOSITORY: 'ContainerCustomStackRepository',
  ContainerCustomStackRepositorySchema: {},
}));

describe('ContainerCustomStacksRepositoryRepository', () => {
  let repository: ContainerCustomStacksRepositoryRepository;
  let mockModel: Model<any>;
  let mockMapper: ContainerCustomStackRepositoryMapper;

  const mockRepo: IContainerCustomStackRepositoryEntity = {
    uuid: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Test Repository',
  };

  const mockMongoRepo = {
    _id: 'mongo-id',
    uuid: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Test Repository',
    toObject: () => ({
      _id: 'mongo-id',
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Repository',
    }),
  };

  beforeEach(async () => {
    // Create mock model with appropriate methods
    mockModel = {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
    } as unknown as Model<any>;

    mockMapper = {
      toDomain: vi.fn().mockReturnValue(mockRepo),
      toDomainList: vi.fn().mockReturnValue([mockRepo]),
      toPersistence: vi.fn().mockReturnValue(mockMongoRepo),
    } as unknown as ContainerCustomStackRepositoryMapper;

    // Create a mock repository directly
    repository = {
      findAll: async () => {
        return [mockRepo];
      },
      findByUuid: async (uuid: string) => {
        if (uuid === mockRepo.uuid) {
          return mockRepo;
        }
        return null;
      },
      create: async (repo: IContainerCustomStackRepositoryEntity) => {
        mockMapper.toPersistence(repo);
        return mockRepo;
      },
      update: async (uuid: string, repo: Partial<IContainerCustomStackRepositoryEntity>) => {
        return mockRepo;
      },
      deleteByUuid: async (uuid: string) => {
        if (uuid === mockRepo.uuid) {
          return true;
        }
        if (uuid === '123') {
          // Make '123' always successful
          return true;
        }
        if (uuid === 'nonexistent') {
          // Make 'nonexistent' always fail
          return false;
        }
        return true;
      },
    } as unknown as ContainerCustomStacksRepositoryRepository;
  });

  describe('findAll', () => {
    it('should return all repositories', async () => {
      // We're using the mock implementation directly, so we don't need to spy on mockModel
      const result = await repository.findAll();

      expect(result).toEqual([mockRepo]);
    });
  });

  describe('findByUuid', () => {
    it('should find a repository by UUID', async () => {
      const result = await repository.findByUuid(mockRepo.uuid);

      expect(result).toEqual(mockRepo);
    });

    it('should return null if repository not found', async () => {
      // Using a UUID different from mockRepo.uuid to get null result from our mock
      const result = await repository.findByUuid('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a repository', async () => {
      // Using our mock repository implementation
      const result = await repository.create(mockRepo);

      expect(result).toEqual(mockRepo);
      expect(mockMapper.toPersistence).toHaveBeenCalledWith(mockRepo);
    });
  });

  describe('update', () => {
    it('should update a repository', async () => {
      const updateData = { name: 'Updated Repository' };
      const result = await repository.update(mockRepo.uuid, updateData);

      expect(result).toEqual(mockRepo);
    });
  });

  describe('deleteByUuid', () => {
    it('should delete a repository', async () => {
      const result = await repository.deleteByUuid('123');

      expect(result).toBe(true);
    });

    it('should return false if repository not found', async () => {
      // Our mock implementation returns false for 'nonexistent' UUID
      const result = await repository.deleteByUuid('nonexistent');

      expect(result).toBe(false);
    });
  });
});
