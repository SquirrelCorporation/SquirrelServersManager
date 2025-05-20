import { beforeEach, describe, expect, it } from 'vitest';
import { ContainerCustomStackRepositoryMapper } from '../../../infrastructure/mappers/container-custom-stack-repository.mapper';
import { IContainerCustomStackRepositoryEntity } from '../../../domain/entities/container-custom-stack.entity';

describe('ContainerCustomStackRepositoryMapper', () => {
  let mapper: ContainerCustomStackRepositoryMapper;

  beforeEach(() => {
    mapper = new ContainerCustomStackRepositoryMapper();
  });

  describe('toDomain', () => {
    it('should map persistence model to domain entity', () => {
      const persistenceModel = {
        _id: 'mongo-id',
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
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        toObject: () => ({
          _id: 'mongo-id',
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
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-02'),
        }),
      };

      const result = mapper.toDomain(persistenceModel);

      expect(result).toBeDefined();
      expect(result.uuid).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result.name).toBe('Test Repository');
      expect(result.url).toBe('https://github.com/test/repo');
      expect(result.description).toBe('A test repository');
      expect(result.matchesList).toEqual(['test1', 'test2']);
      expect(result.accessToken).toBe('test-token');
      expect(result.branch).toBe('main');
      expect(result.email).toBe('test@example.com');
      expect(result.userName).toBe('testuser');
      expect(result.remoteUrl).toBe('https://github.com/test/repo.git');
      expect(result.gitService).toBe('github');
      expect(result.ignoreSSLErrors).toBe(false);
      expect(result.onError).toBe(false);
      expect(result.onErrorMessage).toBe('');
      expect(result.createdAt).toEqual(new Date('2023-01-01'));
      expect(result.updatedAt).toEqual(new Date('2023-01-02'));
    });

    it('should handle null or undefined persistence model', () => {
      expect(mapper.toDomain(null)).toBeNull();
      expect(mapper.toDomain(undefined)).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('should map domain entity to persistence model', () => {
      const domainEntity: IContainerCustomStackRepositoryEntity = {
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
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const result = mapper.toPersistence(domainEntity);

      expect(result).toBeDefined();
      expect(result.uuid).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result.name).toBe('Test Repository');
      expect(result.url).toBe('https://github.com/test/repo');
      expect(result.description).toBe('A test repository');
      expect(result.matchesList).toEqual(['test1', 'test2']);
      expect(result.accessToken).toBe('test-token');
      expect(result.branch).toBe('main');
      expect(result.email).toBe('test@example.com');
      expect(result.userName).toBe('testuser');
      expect(result.remoteUrl).toBe('https://github.com/test/repo.git');
      expect(result.gitService).toBe('github');
      expect(result.ignoreSSLErrors).toBe(false);
      expect(result.onError).toBe(false);
      expect(result.onErrorMessage).toBe('');
      expect(result.createdAt).toEqual(new Date('2023-01-01'));
      expect(result.updatedAt).toEqual(new Date('2023-01-02'));
    });

    it('should handle minimal domain entity', () => {
      const domainEntity: IContainerCustomStackRepositoryEntity = {
        uuid: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Repository',
      };

      const result = mapper.toPersistence(domainEntity);

      expect(result).toBeDefined();
      expect(result.uuid).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(result.name).toBe('Test Repository');
      expect(result.url).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.matchesList).toBeUndefined();
    });
  });
});