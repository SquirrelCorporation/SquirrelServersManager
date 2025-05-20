import { describe, it, expect, vi } from 'vitest';
import { CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY, IContainerCustomStackRepositoryRepository } from '../../../domain/repositories/container-custom-stack-repository-repository.interface';
import { IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';

describe('IContainerCustomStackRepositoryRepository Interface', () => {
  it('should have the correct constant value', () => {
    expect(CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY).toBe('CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY');
  });

  it('should define the required repository methods', () => {
    // Create a mock implementation of the interface
    const mockRepository: IContainerCustomStackRepositoryRepository = {
      findAll: vi.fn(),
      findByUuid: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteByUuid: vi.fn(),
    };

    // Verify all methods are defined
    expect(mockRepository.findAll).toBeDefined();
    expect(mockRepository.findByUuid).toBeDefined();
    expect(mockRepository.create).toBeDefined();
    expect(mockRepository.update).toBeDefined();
    expect(mockRepository.deleteByUuid).toBeDefined();
  });

  it('should be able to mock repository method implementations', async () => {
    const mockRepo: IContainerCustomStackRepositoryEntity = {
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Repository',
    };

    const mockRepository: IContainerCustomStackRepositoryRepository = {
      findAll: vi.fn().mockResolvedValue([mockRepo]),
      findByUuid: vi.fn().mockResolvedValue(mockRepo),
      create: vi.fn().mockResolvedValue(mockRepo),
      update: vi.fn().mockResolvedValue(mockRepo),
      deleteByUuid: vi.fn().mockResolvedValue(true),
    };

    // Test the mocked methods
    expect(await mockRepository.findAll()).toEqual([mockRepo]);
    expect(await mockRepository.findByUuid('123')).toEqual(mockRepo);
    expect(await mockRepository.create(mockRepo)).toEqual(mockRepo);
    expect(await mockRepository.update('123', { name: 'Updated' })).toEqual(mockRepo);
    expect(await mockRepository.deleteByUuid('123')).toBe(true);
  });
}); 