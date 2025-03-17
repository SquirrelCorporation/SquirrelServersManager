import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContainerStacksService } from '../../../application/services/container-stacks.service';
import { IContainerCustomStackRepository } from '../../../domain/repositories/container-custom-stack-repository.interface';
import { IContainerCustomStackRepositoryRepository } from '../../../domain/repositories/container-custom-stack-repository-repository.interface';
import { ContainerCustomStack, IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';

describe('ContainerStacksService', () => {
  let service: ContainerStacksService;
  let mockStackRepository: IContainerCustomStackRepository;
  let mockRepositoryRepository: IContainerCustomStackRepositoryRepository;

  const mockStack: ContainerCustomStack = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Stack',
  };

  const mockRepo: IContainerCustomStackRepositoryEntity = {
    uuid: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Test Repository',
  };

  beforeEach(() => {
    mockStackRepository = {
      findAll: vi.fn().mockResolvedValue([mockStack]),
      findByUuid: vi.fn().mockResolvedValue(mockStack),
      create: vi.fn().mockResolvedValue(mockStack),
      update: vi.fn().mockResolvedValue(mockStack),
      deleteByUuid: vi.fn().mockResolvedValue(true),
      listAllByRepository: vi.fn().mockResolvedValue([mockStack]),
    };

    mockRepositoryRepository = {
      findAll: vi.fn().mockResolvedValue([mockRepo]),
      findByUuid: vi.fn().mockResolvedValue(mockRepo),
      create: vi.fn().mockResolvedValue(mockRepo),
      update: vi.fn().mockResolvedValue(mockRepo),
      deleteByUuid: vi.fn().mockResolvedValue(true),
    };

    service = new ContainerStacksService(
      mockStackRepository,
      mockRepositoryRepository,
    );
  });

  describe('Stack operations', () => {
    it('should get all stacks', async () => {
      const result = await service.getAllStacks();
      expect(result).toEqual([mockStack]);
      expect(mockStackRepository.findAll).toHaveBeenCalled();
    });

    it('should get a stack by UUID', async () => {
      const result = await service.getStackByUuid('123');
      expect(result).toEqual(mockStack);
      expect(mockStackRepository.findByUuid).toHaveBeenCalledWith('123');
    });

    it('should create a stack', async () => {
      const result = await service.createStack(mockStack);
      expect(result).toEqual(mockStack);
      expect(mockStackRepository.create).toHaveBeenCalledWith(mockStack);
    });

    it('should update a stack', async () => {
      const updateData = { name: 'Updated Stack' };
      const result = await service.updateStack('123', updateData);
      expect(result).toEqual(mockStack);
      expect(mockStackRepository.update).toHaveBeenCalledWith('123', updateData);
    });

    it('should delete a stack', async () => {
      const result = await service.deleteStackByUuid('123');
      expect(result).toBe(true);
      expect(mockStackRepository.deleteByUuid).toHaveBeenCalledWith('123');
    });
  });

  describe('Repository operations', () => {
    it('should get all repositories', async () => {
      const result = await service.getAllRepositories();
      expect(result).toEqual([mockRepo]);
      expect(mockRepositoryRepository.findAll).toHaveBeenCalled();
    });

    it('should get a repository by UUID', async () => {
      const result = await service.getRepositoryByUuid('123');
      expect(result).toEqual(mockRepo);
      expect(mockRepositoryRepository.findByUuid).toHaveBeenCalledWith('123');
    });

    it('should create a repository', async () => {
      const result = await service.createRepository(mockRepo);
      expect(result).toEqual(mockRepo);
      expect(mockRepositoryRepository.create).toHaveBeenCalledWith(mockRepo);
    });

    it('should update a repository', async () => {
      const updateData = { name: 'Updated Repository' };
      const result = await service.updateRepository('123', updateData);
      expect(result).toEqual(mockRepo);
      expect(mockRepositoryRepository.update).toHaveBeenCalledWith('123', updateData);
    });

    it('should delete a repository', async () => {
      const result = await service.deleteRepositoryByUuid('123');
      expect(result).toBe(true);
      expect(mockRepositoryRepository.deleteByUuid).toHaveBeenCalledWith('123');
    });
  });
}); 