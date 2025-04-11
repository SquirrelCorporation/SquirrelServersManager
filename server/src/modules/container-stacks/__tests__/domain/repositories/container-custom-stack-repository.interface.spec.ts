import { describe, it, expect, vi } from 'vitest';
import { CONTAINER_CUSTOM_STACK_REPOSITORY, IContainerCustomStackRepository } from '../../../domain/repositories/container-custom-stack-repository.interface';
import { ContainerCustomStack, IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';

describe('IContainerCustomStackRepository Interface', () => {
  it('should have the correct constant value', () => {
    expect(CONTAINER_CUSTOM_STACK_REPOSITORY).toBe('CONTAINER_CUSTOM_STACK_REPOSITORY');
  });

  it('should define the required repository methods', () => {
    // Create a mock implementation of the interface
    const mockRepository: IContainerCustomStackRepository = {
      findAll: vi.fn(),
      findByUuid: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteByUuid: vi.fn(),
      listAllByRepository: vi.fn(),
    };

    // Verify all methods are defined
    expect(mockRepository.findAll).toBeDefined();
    expect(mockRepository.findByUuid).toBeDefined();
    expect(mockRepository.create).toBeDefined();
    expect(mockRepository.update).toBeDefined();
    expect(mockRepository.deleteByUuid).toBeDefined();
    expect(mockRepository.listAllByRepository).toBeDefined();
  });

  it('should be able to mock repository method implementations', async () => {
    const mockStack: ContainerCustomStack = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Stack',
    };

    const mockRepository: IContainerCustomStackRepository = {
      findAll: vi.fn().mockResolvedValue([mockStack]),
      findByUuid: vi.fn().mockResolvedValue(mockStack),
      create: vi.fn().mockResolvedValue(mockStack),
      update: vi.fn().mockResolvedValue(mockStack),
      deleteByUuid: vi.fn().mockResolvedValue(true),
      listAllByRepository: vi.fn().mockResolvedValue([mockStack]),
    };

    const mockRepo: IContainerCustomStackRepositoryEntity = {
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Repository',
    };

    // Test the mocked methods
    expect(await mockRepository.findAll()).toEqual([mockStack]);
    expect(await mockRepository.findByUuid('123')).toEqual(mockStack);
    expect(await mockRepository.create(mockStack)).toEqual(mockStack);
    expect(await mockRepository.update('123', { name: 'Updated' })).toEqual(mockStack);
    expect(await mockRepository.deleteByUuid('123')).toBe(true);
    expect(await mockRepository.listAllByRepository(mockRepo)).toEqual([mockStack]);
  });
}); 