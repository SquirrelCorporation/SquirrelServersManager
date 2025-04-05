import { describe, expect, it, vi } from 'vitest';
import {
  CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE,
  IContainerStacksRepositoryEngineService,
} from '../../../applicati../../domain/interfaces/container-stacks-repository-engine-service.interface';

describe('IContainerStacksRepositoryEngineService Interface', () => {
  it('should have the correct constant value', () => {
    expect(CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE).toBe(
      'CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE',
    );
  });

  it('should define the required service methods', () => {
    // Create a mock implementation of the interface
    const mockService: IContainerStacksRepositoryEngineService = {
      cloneRepository: vi.fn(),
      pullRepository: vi.fn(),
      getRepositoryComponents: vi.fn(),
    };

    // Verify all methods are defined
    expect(mockService.cloneRepository).toBeDefined();
    expect(mockService.pullRepository).toBeDefined();
    expect(mockService.getRepositoryComponents).toBeDefined();
  });

  it('should be able to mock service method implementations', async () => {
    const mockService: IContainerStacksRepositoryEngineService = {
      cloneRepository: vi.fn().mockResolvedValue(true),
      pullRepository: vi.fn().mockResolvedValue(true),
      getRepositoryComponents: vi.fn().mockResolvedValue(['component1', 'component2']),
    };

    // Test the mocked methods
    expect(
      await mockService.cloneRepository('https://github.com/test/repo.git', '/path/to/repo'),
    ).toBe(true);
    expect(await mockService.pullRepository('/path/to/repo')).toBe(true);
    expect(await mockService.getRepositoryComponents('/path/to/repo')).toEqual([
      'component1',
      'component2',
    ]);

    // Verify the methods were called with the correct arguments
    expect(mockService.cloneRepository).toHaveBeenCalledWith(
      'https://github.com/test/repo.git',
      '/path/to/repo',
    );
    expect(mockService.pullRepository).toHaveBeenCalledWith('/path/to/repo');
    expect(mockService.getRepositoryComponents).toHaveBeenCalledWith('/path/to/repo');
  });
});
