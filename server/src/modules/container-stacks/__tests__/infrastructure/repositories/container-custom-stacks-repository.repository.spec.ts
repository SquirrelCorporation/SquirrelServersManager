import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContainerCustomStacksRepositoryRepository } from '../../../infrastructure/repositories/container-custom-stacks-repository.repository';
import { Model } from 'mongoose';
import { IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';
import { ContainerCustomStackRepositoryMapper } from '../../../infrastructure/mappers/container-custom-stack-repository.mapper';
import { getModelToken } from '@nestjs/mongoose';
import { CONTAINER_CUSTOM_STACK_REPOSITORY } from '../../../infrastructure/schemas/container-custom-stack-repository.schema';
import { Test } from '@nestjs/testing';

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
    mockModel = {
      find: vi.fn().mockReturnThis(),
      findOne: vi.fn().mockReturnThis(),
      create: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
      exec: vi.fn(),
    } as unknown as Model<any>;

    mockMapper = {
      toDomain: vi.fn().mockReturnValue(mockRepo),
      toPersistence: vi.fn().mockReturnValue(mockMongoRepo),
    } as unknown as ContainerCustomStackRepositoryMapper;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ContainerCustomStacksRepositoryRepository,
        {
          provide: getModelToken(CONTAINER_CUSTOM_STACK_REPOSITORY),
          useValue: mockModel,
        },
        {
          provide: ContainerCustomStackRepositoryMapper,
          useValue: mockMapper,
        },
      ],
    }).compile();

    repository = moduleRef.get<ContainerCustomStacksRepositoryRepository>(ContainerCustomStacksRepositoryRepository);
  });

  describe('findAll', () => {
    it('should return all repositories', async () => {
      vi.spyOn(mockModel, 'find').mockReturnValue({
        exec: vi.fn().mockResolvedValue([mockMongoRepo]),
      } as any);

      const result = await repository.findAll();
      
      expect(result).toEqual([mockRepo]);
      expect(mockModel.find).toHaveBeenCalled();
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockMongoRepo);
    });
  });

  describe('findByUuid', () => {
    it('should find a repository by UUID', async () => {
      vi.spyOn(mockModel, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockMongoRepo),
      } as any);

      const result = await repository.findByUuid('123');
      
      expect(result).toEqual(mockRepo);
      expect(mockModel.findOne).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockMongoRepo);
    });

    it('should return null if repository not found', async () => {
      vi.spyOn(mockModel, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as any);

      const result = await repository.findByUuid('123');
      
      expect(result).toBeNull();
      expect(mockModel.findOne).toHaveBeenCalledWith({ uuid: '123' });
    });
  });

  describe('create', () => {
    it('should create a repository', async () => {
      vi.spyOn(mockModel, 'create').mockResolvedValue(mockMongoRepo);

      const result = await repository.create(mockRepo);
      
      expect(result).toEqual(mockRepo);
      expect(mockMapper.toPersistence).toHaveBeenCalledWith(mockRepo);
      expect(mockModel.create).toHaveBeenCalledWith(mockMongoRepo);
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockMongoRepo);
    });
  });

  describe('update', () => {
    it('should update a repository', async () => {
      vi.spyOn(mockModel, 'findOneAndUpdate').mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockMongoRepo),
      } as any);

      const updateData = { name: 'Updated Repository' };
      const result = await repository.update('123', updateData);
      
      expect(result).toEqual(mockRepo);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { uuid: '123' },
        expect.any(Object),
        { new: true }
      );
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockMongoRepo);
    });
  });

  describe('deleteByUuid', () => {
    it('should delete a repository', async () => {
      vi.spyOn(mockModel, 'findOneAndDelete').mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockMongoRepo),
      } as any);

      const result = await repository.deleteByUuid('123');
      
      expect(result).toBe(true);
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should return false if repository not found', async () => {
      vi.spyOn(mockModel, 'findOneAndDelete').mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as any);

      const result = await repository.deleteByUuid('123');
      
      expect(result).toBe(false);
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith({ uuid: '123' });
    });
  });
}); 