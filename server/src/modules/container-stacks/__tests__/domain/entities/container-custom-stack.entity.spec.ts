import { describe, it, expect } from 'vitest';
import { ContainerCustomStack, IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';

describe('ContainerCustomStack Entity', () => {
  it('should create a valid ContainerCustomStack entity', () => {
    const stack: ContainerCustomStack = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Stack',
      description: 'A test stack',
      path: '/test/path',
      yaml: 'version: "3"\nservices:\n  test:\n    image: test',
      icon: 'test-icon',
      iconColor: '#ffffff',
      iconBackgroundColor: '#000000',
      lockJson: false,
      type: 'custom',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(stack).toBeDefined();
    expect(stack.uuid).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(stack.name).toBe('Test Stack');
    expect(stack.description).toBe('A test stack');
  });

  it('should create a valid IContainerCustomStackRepositoryEntity', () => {
    const repo: IContainerCustomStackRepositoryEntity = {
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Repository',
      url: 'https://github.com/test/repo',
      description: 'A test repository',
      matchesList: ['test1', 'test2'],
      accessToken: 'test-token',
      branch: 'main',
      email: 'test@example.com',
      userName: 'testuser',
      remoteUrl: 'https://github.com/test/repo.git',
      gitService: 'github',
      ignoreSSLErrors: false,
      onError: false,
      onErrorMessage: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(repo).toBeDefined();
    expect(repo.uuid).toBe('123e4567-e89b-12d3-a456-426614174001');
    expect(repo.name).toBe('Test Repository');
    expect(repo.url).toBe('https://github.com/test/repo');
    expect(repo.matchesList).toHaveLength(2);
  });
}); 