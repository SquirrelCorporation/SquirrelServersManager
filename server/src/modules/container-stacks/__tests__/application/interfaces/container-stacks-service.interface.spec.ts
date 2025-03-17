import { describe, it, expect, vi } from 'vitest';
import { CONTAINER_STACKS_SERVICE, IContainerStacksService } from '../../../application/interfaces/container-stacks-service.interface';
import { ContainerCustomStack, IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';

describe('IContainerStacksService Interface', () => {
  it('should have the correct constant value', () => {
    expect(CONTAINER_STACKS_SERVICE).toBe('CONTAINER_STACKS_SERVICE');
  });

  it('should define the required service methods', () => {
    // Create a mock implementation of the interface
    const mockService: IContainerStacksService = {
      getAllStacks: vi.fn(),
      getStackByUuid: vi.fn(),
      createStack: vi.fn(),
      updateStack: vi.fn(),
      deleteStackByUuid: vi.fn(),
      getAllRepositories: vi.fn(),
      getRepositoryByUuid: vi.fn(),
      createRepository: vi.fn(),
      updateRepository: vi.fn(),
      deleteRepositoryByUuid: vi.fn(),
    };

    // Verify all stack methods are defined
    expect(mockService.getAllStacks).toBeDefined();
    expect(mockService.getStackByUuid).toBeDefined();
    expect(mockService.createStack).toBeDefined();
    expect(mockService.updateStack).toBeDefined();
    expect(mockService.deleteStackByUuid).toBeDefined();

    // Verify all repository methods are defined
    expect(mockService.getAllRepositories).toBeDefined();
    expect(mockService.getRepositoryByUuid).toBeDefined();
    expect(mockService.createRepository).toBeDefined();
    expect(mockService.updateRepository).toBeDefined();
    expect(mockService.deleteRepositoryByUuid).toBeDefined();
  });

  it('should be able to mock service method implementations', async () => {
    const mockStack: ContainerCustomStack = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Stack',
    };

    const mockRepo: IContainerCustomStackRepositoryEntity = {
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Repository',
    };

    const mockService: IContainerStacksService = {
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

    // Test the mocked stack methods
    expect(await mockService.getAllStacks()).toEqual([mockStack]);
    expect(await mockService.getStackByUuid('123')).toEqual(mockStack);
    expect(await mockService.createStack(mockStack)).toEqual(mockStack);
    expect(await mockService.updateStack('123', { name: 'Updated' })).toEqual(mockStack);
    expect(await mockService.deleteStackByUuid('123')).toBe(true);

    // Test the mocked repository methods
    expect(await mockService.getAllRepositories()).toEqual([mockRepo]);
    expect(await mockService.getRepositoryByUuid('123')).toEqual(mockRepo);
    expect(await mockService.createRepository(mockRepo)).toEqual(mockRepo);
    expect(await mockService.updateRepository('123', { name: 'Updated' })).toEqual(mockRepo);
    expect(await mockService.deleteRepositoryByUuid('123')).toBe(true);
  });
}); 