import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContainerCustomStackRepository } from '../../../infrastructure/repositories/container-custom-stack.repository';
import { Model } from 'mongoose';
import { ContainerCustomStack, IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';
import { ContainerCustomStackMapper } from '../../../infrastructure/mappers/container-custom-stack.mapper';
import { getModelToken } from '@nestjs/mongoose';
import { CONTAINER_CUSTOM_STACK } from '../../../infrastructure/schemas/container-custom-stack.schema';
import { Test } from '@nestjs/testing';

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
    mockModel = {
      find: vi.fn().mockReturnThis(),
      findOne: vi.fn().mockReturnThis(),
      create: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
      exec: vi.fn(),
    } as unknown as Model<any>;

    mockMapper = {
      toDomain: vi.fn().mockReturnValue(mockStack),
      toPersistence: vi.fn().mockReturnValue(mockMongoStack),
    } as unknown as ContainerCustomStackMapper;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ContainerCustomStackRepository,
        {
          provide: getModelToken(CONTAINER_CUSTOM_STACK),
          useValue: mockModel,
        },
        {
          provide: ContainerCustomStackMapper,
          useValue: mockMapper,
        },
      ],
    }).compile();

    repository = moduleRef.get<ContainerCustomStackRepository>(ContainerCustomStackRepository);
  });

  describe('findAll', () => {
    it('should return all stacks', async () => {
      vi.spyOn(mockModel, 'find').mockReturnValue({
        exec: vi.fn().mockResolvedValue([mockMongoStack]),
      } as any);

      const result = await repository.findAll();
      
      expect(result).toEqual([mockStack]);
      expect(mockModel.find).toHaveBeenCalled();
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockMongoStack);
    });
  });

  describe('findByUuid', () => {
    it('should find a stack by UUID', async () => {
      vi.spyOn(mockModel, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockMongoStack),
      } as any);

      const result = await repository.findByUuid('123');
      
      expect(result).toEqual(mockStack);
      expect(mockModel.findOne).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockMongoStack);
    });

    it('should return null if stack not found', async () => {
      vi.spyOn(mockModel, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as any);

      const result = await repository.findByUuid('123');
      
      expect(result).toBeNull();
      expect(mockModel.findOne).toHaveBeenCalledWith({ uuid: '123' });
    });
  });

  describe('create', () => {
    it('should create a stack', async () => {
      vi.spyOn(mockModel, 'create').mockResolvedValue(mockMongoStack);

      const result = await repository.create(mockStack);
      
      expect(result).toEqual(mockStack);
      expect(mockMapper.toPersistence).toHaveBeenCalledWith(mockStack);
      expect(mockModel.create).toHaveBeenCalledWith(mockMongoStack);
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockMongoStack);
    });
  });

  describe('update', () => {
    it('should update a stack', async () => {
      vi.spyOn(mockModel, 'findOneAndUpdate').mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockMongoStack),
      } as any);

      const updateData = { name: 'Updated Stack' };
      const result = await repository.update('123', updateData);
      
      expect(result).toEqual(mockStack);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { uuid: '123' },
        expect.any(Object),
        { new: true }
      );
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockMongoStack);
    });
  });

  describe('deleteByUuid', () => {
    it('should delete a stack', async () => {
      vi.spyOn(mockModel, 'findOneAndDelete').mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockMongoStack),
      } as any);

      const result = await repository.deleteByUuid('123');
      
      expect(result).toBe(true);
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should return false if stack not found', async () => {
      vi.spyOn(mockModel, 'findOneAndDelete').mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as any);

      const result = await repository.deleteByUuid('123');
      
      expect(result).toBe(false);
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({ uuid: '123' });
    });
  });

  describe('listAllByRepository', () => {
    it('should list all stacks by repository', async () => {
      vi.spyOn(mockModel, 'find').mockReturnValue({
        exec: vi.fn().mockResolvedValue([mockMongoStack]),
      } as any);

      const result = await repository.listAllByRepository(mockRepo);
      
      expect(result).toEqual([mockStack]);
      expect(mockModel.find).toHaveBeenCalled();
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockMongoStack);
    });
  });
}); 