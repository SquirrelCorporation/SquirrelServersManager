import { describe, expect, it, vi } from 'vitest';
import {
  CONTAINER_REPOSITORY_COMPONENT_SERVICE,
  IContainerRepositoryComponentService,
} from '../../../applicati../../domain/interfaces/container-repository-component-service.interface';

describe('IContainerRepositoryComponentService Interface', () => {
  it('should have the correct constant value', () => {
    expect(CONTAINER_REPOSITORY_COMPONENT_SERVICE).toBe('CONTAINER_REPOSITORY_COMPONENT_SERVICE');
  });

  it('should define the required service methods', () => {
    // Create a mock implementation of the interface
    const mockService: IContainerRepositoryComponentService = {
      getComponentDetails: vi.fn(),
      deployComponent: vi.fn(),
      removeComponent: vi.fn(),
    };

    // Verify all methods are defined
    expect(mockService.getComponentDetails).toBeDefined();
    expect(mockService.deployComponent).toBeDefined();
    expect(mockService.removeComponent).toBeDefined();
  });

  it('should be able to mock service method implementations', async () => {
    const mockComponentDetails = {
      name: 'test-component',
      version: '1.0.0',
      description: 'Test component',
    };

    const mockConfig = {
      port: 8080,
      environment: 'development',
    };

    const mockService: IContainerRepositoryComponentService = {
      getComponentDetails: vi.fn().mockResolvedValue(mockComponentDetails),
      deployComponent: vi.fn().mockResolvedValue(true),
      removeComponent: vi.fn().mockResolvedValue(true),
    };

    // Test the mocked methods
    expect(await mockService.getComponentDetails('/path/to/repo', 'test-component')).toEqual(
      mockComponentDetails,
    );
    expect(await mockService.deployComponent('/path/to/repo', 'test-component', mockConfig)).toBe(
      true,
    );
    expect(await mockService.removeComponent('/path/to/repo', 'test-component')).toBe(true);

    // Verify the methods were called with the correct arguments
    expect(mockService.getComponentDetails).toHaveBeenCalledWith('/path/to/repo', 'test-component');
    expect(mockService.deployComponent).toHaveBeenCalledWith(
      '/path/to/repo',
      'test-component',
      mockConfig,
    );
    expect(mockService.removeComponent).toHaveBeenCalledWith('/path/to/repo', 'test-component');
  });
});
