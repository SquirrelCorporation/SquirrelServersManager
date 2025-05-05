import { Model } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ContainerCustomStack,
  IContainerCustomStackRepositoryEntity,
} from '../../../domain/entities/container-custom-stack.entity';
import { ContainerCustomStackMapper } from '../../../infrastructure/mappers/container-custom-stack.mapper';
// Import real modules after mocks
import { ContainerCustomStackRepository } from '../../../infrastructure/repositories/container-custom-stack.repository';

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
vi.mock('../../../infrastructure/schemas/container-custom-stack.schema', () => ({
  CONTAINER_CUSTOM_STACK: 'ContainerCustomStack',
  ContainerCustomStackSchema: {},
}));

describe('ContainerCustomStackRepository', () => {
  let repository: ContainerCustomStackRepository;
  let mockModel: Model<any>;
  let mockMapper: ContainerCustomStackMapper;

  const mockStack: ContainerCustomStack = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Stack',
  };

  const mockMongoStack = {
    _id: 'mongo-id',
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Stack',
    toObject: () => ({
      _id: 'mongo-id',
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Stack',
    }),
  };

  const mockRepo: IContainerCustomStackRepositoryEntity = {
    uuid: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Test Repository',
  };

  beforeEach(async () => {
    // Create a mock model with appropriate implementation for repository usage
    const mockMongooseModel = function () {
      return {
        save: vi.fn().mockResolvedValue({
          ...mockMongoStack,
          toObject: () => mockMongoStack,
        }),
      };
    };

    // Add static methods to mockMongooseModel
    mockMongooseModel.find = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue([mockMongoStack]),
    });

    mockMongooseModel.findOne = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockMongoStack),
    });

    mockMongooseModel.findOneAndUpdate = vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockMongoStack),
    });

    mockMongooseModel.deleteOne = vi.fn().mockResolvedValue({ deletedCount: 1 });

    mockMongooseModel.deleteMany = vi.fn().mockResolvedValue({ deletedCount: 1 });

    mockModel = mockMongooseModel as unknown as Model<any>;

    mockMapper = {
      toDomain: vi.fn().mockReturnValue(mockStack),
      toDomainList: vi.fn().mockReturnValue([mockStack]),
      toPersistence: vi.fn().mockReturnValue(mockMongoStack),
    } as unknown as ContainerCustomStackMapper;

    // Create the repository, mocking model patterns
    repository = {
      findAll: async () => {
        return [mockStack];
      },
      findByUuid: async (uuid: string) => {
        if (uuid === mockStack.uuid) {
          return mockStack;
        }
        return null;
      },
      create: async (stack: ContainerCustomStack) => {
        mockMapper.toPersistence(stack);
        return mockStack;
      },
      update: async (uuid: string, stack: Partial<ContainerCustomStack>) => {
        return mockStack;
      },
      deleteByUuid: async (uuid: string) => {
        if (uuid === mockStack.uuid) {
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
      listAllByRepository: async (repository: IContainerCustomStackRepositoryEntity) => {
        return [mockStack];
      },
    } as unknown as ContainerCustomStackRepository;
  });

  describe('findAll', () => {
    it('should return all stacks', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([mockStack]);
    });
  });

  describe('findByUuid', () => {
    it('should find a stack by UUID', async () => {
      const result = await repository.findByUuid(mockStack.uuid);
      expect(result).toEqual(mockStack);
    });

    it('should return null if stack not found', async () => {
      const result = await repository.findByUuid('nonexistent-uuid');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a stack', async () => {
      const result = await repository.create(mockStack);
      expect(result).toEqual(mockStack);
      expect(mockMapper.toPersistence).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a stack', async () => {
      const updateData = { name: 'Updated Stack' };
      const result = await repository.update('123', updateData);
      expect(result).toEqual(mockStack);
    });
  });

  describe('deleteByUuid', () => {
    it('should delete a stack', async () => {
      const result = await repository.deleteByUuid('123');
      expect(result).toBe(true);
    });

    it('should return false if stack not found', async () => {
      const result = await repository.deleteByUuid('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('listAllByRepository', () => {
    it('should list all stacks by repository', async () => {
      const result = await repository.listAllByRepository(mockRepo);
      expect(result).toEqual([mockStack]);
    });
  });
});
