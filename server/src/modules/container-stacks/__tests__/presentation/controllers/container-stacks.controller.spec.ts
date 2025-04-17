import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContainerCustomStack } from '../../../domain/entities/container-custom-stack.entity';
import {
  CONTAINER_STACKS_SERVICE,
  IContainerStacksService,
} from '../../../domain/interfaces/container-stacks-service.interface';
import { ContainerStacksController } from '../../../presentation/controllers/container-stacks.controller';

// Mock external modules
vi.mock('@modules/auth/strategies/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {
    canActivate() {
      return true;
    }
  },
}));

vi.mock('@infrastructure/models/api-response.model', () => ({
  ApiSuccessResponse: vi.fn(),
  ApiErrorResponse: vi.fn(),
}));

describe('ContainerStacksController', () => {
  let controller: ContainerStacksController;
  let mockContainerStacksService: IContainerStacksService;

  const mockStack: ContainerCustomStack = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Stack',
  };

  beforeEach(async () => {
    mockContainerStacksService = {
      onModuleInit: vi.fn(),
      getAllStacks: vi.fn().mockResolvedValue([mockStack]),
      getStackByUuid: vi.fn().mockResolvedValue(mockStack),
      createStack: vi.fn().mockResolvedValue(mockStack),
      updateStack: vi.fn().mockResolvedValue(mockStack),
      deleteStackByUuid: vi.fn().mockResolvedValue(true),
      getAllRepositories: vi.fn().mockResolvedValue([]),
      getRepositoryByUuid: vi.fn().mockResolvedValue(null),
      createRepository: vi.fn().mockResolvedValue({}),
      updateRepository: vi.fn().mockResolvedValue({}),
      deleteRepositoryByUuid: vi.fn().mockResolvedValue(true),
      deployStack: vi.fn().mockResolvedValue({ execId: 'exec-123' }),
      transformStack: vi.fn().mockResolvedValue({ yaml: 'test-yaml' }),
      dryRunStack: vi.fn().mockResolvedValue({ validating: true }),
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

  describe('Stack deployment operations', () => {
    it('should deploy a stack', async () => {
      const mockUser = { id: 'user-123' };
      const result = await controller.deployStack('123', { target: 'test-target' }, mockUser);
      expect(result).toEqual({ execId: 'exec-123' });
      expect(mockContainerStacksService.deployStack).toHaveBeenCalledWith(
        '123',
        'test-target',
        mockUser,
      );
    });

    it('should transform a stack', async () => {
      const mockContent = { test: 'content' };
      const result = await controller.transformStack({ content: mockContent });
      expect(result).toEqual({ yaml: 'test-yaml' });
      expect(mockContainerStacksService.transformStack).toHaveBeenCalledWith(mockContent);
    });

    it('should dry run a stack', async () => {
      const mockBody = { json: { test: 'json' }, yaml: 'test-yaml' };
      const result = await controller.dryRunStack(mockBody);
      expect(result).toEqual({ validating: true });
      expect(mockContainerStacksService.dryRunStack).toHaveBeenCalledWith(
        mockBody.json,
        mockBody.yaml,
      );
    });
  });
});
