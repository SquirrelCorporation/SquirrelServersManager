import { SsmGit } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockComponentFactory,
  GitPlaybooksRegisterComponent,
  LocalPlaybooksRegisterComponent,
  mockPlaybookRepository,
  mockPlaybooksRegisterRepository,
  mockTreeNodeService,
  PlaybooksRegisterComponent,
} from './component-factory-test-setup';

// Import the test-setup which contains all mocks
import './component-factory-test-setup';

describe('PlaybooksRegisterComponentFactory', () => {
  let factory: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a fresh factory using our mock implementation
    factory = createMockComponentFactory();
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize repositories in the abstract component', () => {
      factory.onModuleInit();

      expect(PlaybooksRegisterComponent.initializeRepositories).toHaveBeenCalledWith(
        mockPlaybookRepository,
        mockPlaybooksRegisterRepository,
        mockTreeNodeService,
      );
    });
  });

  describe('createGitComponent', () => {
    it('should create a new GitPlaybooksRegisterComponent with correct parameters', async () => {
      const options = {
        uuid: 'git-123',
        name: 'Git Repository',
        branch: 'main',
        email: 'user@example.com',
        gitUserName: 'user',
        accessToken: 'token',
        remoteUrl: 'https://github.com/example/repo.git',
        gitService: SsmGit.Services.Github,
        ignoreSSLErrors: false,
      };

      const component = await factory.createGitComponent(options);

      expect(component).toBeInstanceOf(GitPlaybooksRegisterComponent);
      expect(component.name).toBe('Git Repository');
      expect(component.uuid).toBe('git-123');
      expect(component.branch).toBe('main');
      expect(component.email).toBe('user@example.com');
      expect(component.gitUserName).toBe('user');
      expect(component.accessToken).toBe('token');
      expect(component.remoteUrl).toBe('https://github.com/example/repo.git');
      expect(component.gitService).toBe(SsmGit.Services.Github);
      expect(component.ignoreSSLErrors).toBe(false);
    });
  });

  describe('createLocalComponent', () => {
    it('should create a new LocalPlaybooksRegisterComponent with correct parameters', async () => {
      const options = {
        uuid: 'local-123',
        name: 'Local Repository',
        directory: '/path/to/local',
      };

      const component = await factory.createLocalComponent(options);

      expect(component).toBeInstanceOf(LocalPlaybooksRegisterComponent);
      expect(component.name).toBe('Local Repository');
      expect(component.uuid).toBe('local-123');
      expect(component.rootPath).toBe('/path/to/local');
    });

    it('should use default path if directory is not provided', async () => {
      const options = {
        uuid: 'local-123',
        name: 'Local Repository',
      };

      const component = await factory.createLocalComponent(options);

      expect(component).toBeInstanceOf(LocalPlaybooksRegisterComponent);
      expect(component.rootPath).toBe('/data/playbooks');
    });
  });
});
