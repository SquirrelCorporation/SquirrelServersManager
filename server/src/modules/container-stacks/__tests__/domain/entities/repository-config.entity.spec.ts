import { describe, expect, it } from 'vitest';
import { SsmGit } from 'ssm-shared-lib';
import { RepositoryConfig } from '../../../domain/entities/repository-config.entity';

describe('RepositoryConfig Entity', () => {
  it('should create a valid RepositoryConfig entity', () => {
    const config: RepositoryConfig = {
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Repository',
      branch: 'main',
      email: 'test@example.com',
      userName: 'testuser',
      accessToken: 'test-token',
      remoteUrl: 'https://github.com/test/repo.git',
      gitService: SsmGit.Services.GITHUB,
      ignoreSSLErrors: false,
    };

    expect(config).toBeDefined();
    expect(config.uuid).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(config.name).toBe('Test Repository');
    expect(config.branch).toBe('main');
    expect(config.email).toBe('test@example.com');
    expect(config.userName).toBe('testuser');
    expect(config.remoteUrl).toBe('https://github.com/test/repo.git');
  });

  it('should create a valid RepositoryConfig entity with optional fields', () => {
    const config: RepositoryConfig = {
      uuid: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Test Repository 2',
      branch: 'develop',
      email: 'test2@example.com',
      userName: 'testuser2',
      accessToken: 'test-token-2',
      remoteUrl: 'https://gitlab.com/test/repo.git',
      gitService: SsmGit.Services.GITLAB,
    };

    expect(config).toBeDefined();
    expect(config.uuid).toBe('123e4567-e89b-12d3-a456-426614174001');
    expect(config.ignoreSSLErrors).toBeUndefined();
  });
});
