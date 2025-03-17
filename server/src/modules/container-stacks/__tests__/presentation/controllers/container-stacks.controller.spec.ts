import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { ContainerStacksController } from '../../../presentation/controllers/container-stacks.controller';
import { CONTAINER_STACKS_SERVICE, IContainerStacksService } from '../../../application/interfaces/container-stacks-service.interface';
import { ContainerCustomStack, IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';

// Mock external modules
vi.mock('@modules/auth/strategies/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {
    canActivate() {
      return true;
    }
  },
}));

describe('ContainerStacksController', () => {
  let controller: ContainerStacksController;
  let mockContainerStacksService: IContainerStacksService;

  const mockStack: ContainerCustomStack = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Stack',
  };

  const mockRepo: IContainerCustomStackRepositoryEntity = {
    uuid: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Test Repository',
  };

  beforeEach(async () => {
    mockContainerStacksService = {
      getAllStacks: vi.fn().mockResolvedValue([mockStack]),
      getStackByUuid: vi.fn().mockResolvedValue(mockStack),
      createStack: vi.fn().mockResolvedValue(mockStack),
      updateStack: vi.fn().mockResolvedValue(mockStack),
      deleteStackByUuid: vi.fn().mockResolvedValue(true),
      getAllRepositories: vi.fn().mockResolvedValue([mockRepo]),
      getRepositoryByUuid: vi.fn().mockResolvedValue(mockRepo),
      createRepository: vi.fn().mockResolvedValue(mockRepo),
      updateRepository: vi.fn().mockResolvedValue(mockRepo),
      deleteRepositoryByUuid: vi.fn().mockResolvedValue(true),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [ContainerStacksController],
      providers: [
        {
          provide: CONTAINER_STACKS_SERVICE,
          useValue: mockContainerStacksService,
        },
      ],
    }).compile();

    controller = moduleRef.get<ContainerStacksController>(ContainerStacksController);
  });

  describe('Stack operations', () => {
    it('should get all stacks', async () => {
      const result = await controller.getAllStacks();
      expect(result).toEqual([mockStack]);
      expect(mockContainerStacksService.getAllStacks).toHaveBeenCalled();
    });

    it('should create a stack', async () => {
      const result = await controller.createStack(mockStack);
      expect(result).toEqual(mockStack);
      expect(mockContainerStacksService.createStack).toHaveBeenCalledWith(mockStack);
    });

    it('should update a stack', async () => {
      const updateData = { name: 'Updated Stack' };
      const result = await controller.updateStack('123', updateData);
      expect(result).toEqual(mockStack);
      expect(mockContainerStacksService.updateStack).toHaveBeenCalledWith('123', updateData);
    });

    it('should delete a stack', async () => {
      const result = await controller.deleteStack('123');
      expect(result).toBe(true);
      expect(mockContainerStacksService.deleteStackByUuid).toHaveBeenCalledWith('123');
    });
  });

  describe('Repository operations', () => {
    it('should get all repositories', async () => {
      const result = await controller.getAllRepositories();
      expect(result).toEqual([mockRepo]);
      expect(mockContainerStacksService.getAllRepositories).toHaveBeenCalled();
    });

    it('should get a repository by UUID', async () => {
      const result = await controller.getRepositoryByUuid('123');
      expect(result).toEqual(mockRepo);
      expect(mockContainerStacksService.getRepositoryByUuid).toHaveBeenCalledWith('123');
    });

    it('should create a repository', async () => {
      const result = await controller.createRepository(mockRepo);
      expect(result).toEqual(mockRepo);
      expect(mockContainerStacksService.createRepository).toHaveBeenCalledWith(mockRepo);
    });

    it('should update a repository', async () => {
      const updateData = { name: 'Updated Repository' };
      const result = await controller.updateRepository('123', updateData);
      expect(result).toEqual(mockRepo);
      expect(mockContainerStacksService.updateRepository).toHaveBeenCalledWith('123', updateData);
    });

    it('should delete a repository', async () => {
      const result = await controller.deleteRepository('123');
      expect(result).toBe(true);
      expect(mockContainerStacksService.deleteRepositoryByUuid).toHaveBeenCalledWith('123');
    });
  });
});