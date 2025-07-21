import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MockPlaybooksRegisterEngineService,
  SsmGit,
  mockGitComponent,
  mockGitRegister,
  mockLocalComponent,
  mockLocalRegister,
  mockPlaybooksRegisterComponentFactory,
  mockPlaybooksRegisterRepository,
} from './playbooks-register-engine-test-setup';

// Import the test setup to ensure mocks are applied
import './playbooks-register-engine-test-setup';

describe('PlaybooksRegisterEngineService', () => {
  let engineService: MockPlaybooksRegisterEngineService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a fresh engine service using our mock implementation
    engineService = new MockPlaybooksRegisterEngineService(
      mockPlaybooksRegisterComponentFactory,
      mockPlaybooksRegisterRepository,
    );
  });

  it('should be defined', () => {
    expect(engineService).toBeDefined();
  });

  describe('registerRegister', () => {
    it('should register a local repository component', async () => {
      await engineService.registerRegister(mockLocalRegister);

      expect(mockPlaybooksRegisterComponentFactory.createLocalComponent).toHaveBeenCalledWith({
        uuid: 'local-123',
        name: 'Local Repository',
        directory: '/path/to/local',
      });

      expect(mockLocalComponent.init).toHaveBeenCalled();
      expect(engineService.getState()['local-123']).toBe(mockLocalComponent);
    });

    it('should register a git repository component', async () => {
      await engineService.registerRegister(mockGitRegister);

      expect(mockPlaybooksRegisterComponentFactory.createGitComponent).toHaveBeenCalledWith({
        uuid: 'git-123',
        name: 'Git Repository',
        branch: 'main',
        email: 'user@example.com',
        gitUserName: 'user',
        accessToken: 'token',
        remoteUrl: 'https://github.com/example/repo.git',
        gitService: SsmGit.Services.Github,
        ignoreSSLErrors: false,
      });

      expect(mockGitComponent.init).toHaveBeenCalled();
      expect(engineService.getState()['git-123']).toBe(mockGitComponent);
    });

    it('should skip registration if component is already registered', async () => {
      // Register first time
      await engineService.registerRegister(mockLocalRegister);

      // Reset mocks to check if they're called again
      mockPlaybooksRegisterComponentFactory.createLocalComponent.mockClear();
      mockLocalComponent.init.mockClear();

      // Register second time
      await engineService.registerRegister(mockLocalRegister);

      expect(mockPlaybooksRegisterComponentFactory.createLocalComponent).not.toHaveBeenCalled();
      expect(mockLocalComponent.init).not.toHaveBeenCalled();
    });

    it('should throw an error if component creation fails', async () => {
      mockPlaybooksRegisterComponentFactory.createLocalComponent.mockRejectedValueOnce(
        new Error('Creation error'),
      );

      await expect(engineService.registerRegister(mockLocalRegister)).rejects.toThrow(
        'Failed to register repository: Creation error',
      );
    });
  });

  describe('deregisterRegister', () => {
    it('should deregister a repository component', async () => {
      // Register first
      await engineService.registerRegister(mockLocalRegister);
      expect(engineService.getState()['local-123']).toBeDefined();

      // Then deregister
      await engineService.deregisterRegister('local-123');

      expect(mockLocalComponent.delete).toHaveBeenCalled();
      expect(engineService.getState()['local-123']).toBeUndefined();
    });

    it('should skip deregistration if component is not registered', async () => {
      await engineService.deregisterRegister('nonexistent-uuid');
      // Should not throw an error
    });

    it('should throw an error if component deletion fails', async () => {
      // Register first
      await engineService.registerRegister(mockLocalRegister);

      // Make delete fail
      mockLocalComponent.delete.mockRejectedValueOnce(new Error('Deletion error'));

      await expect(engineService.deregisterRegister('local-123')).rejects.toThrow(
        'Failed to deregister repository: Deletion error',
      );
    });
  });

  describe('getRepository', () => {
    it('should return a repository component by UUID', async () => {
      // Register first
      await engineService.registerRegister(mockLocalRegister);

      const component = engineService.getRepository('local-123');
      expect(component).toBe(mockLocalComponent);
    });

    it('should return undefined if repository is not found', () => {
      const component = engineService.getRepository('nonexistent-uuid');
      expect(component).toBeUndefined();
    });
  });

  describe('getState', () => {
    it('should return all registered components', async () => {
      // Register both components
      await engineService.registerRegister(mockLocalRegister);
      await engineService.registerRegister(mockGitRegister);

      const state = engineService.getState();
      expect(Object.keys(state)).toHaveLength(2);
      expect(state['local-123']).toBe(mockLocalComponent);
      expect(state['git-123']).toBe(mockGitComponent);
    });

    it('should return empty object if no components are registered', () => {
      const state = engineService.getState();
      expect(Object.keys(state)).toHaveLength(0);
    });
  });
});
