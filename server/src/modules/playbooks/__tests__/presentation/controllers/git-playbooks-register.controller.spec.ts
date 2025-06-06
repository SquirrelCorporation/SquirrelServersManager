import { SsmGit } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_VAULT_ID,
  NotFoundError,
  createMockGitPlaybooksRegisterController,
  mockGitComponent,
  mockGitRegister,
  mockPlaybooksRegisterEngineService,
  mockPlaybooksRegisterRepository,
  mockPlaybooksRegisterService,
  mockVaultCryptoService,
} from './git-playbooks-register-test-setup';

// Import the test-setup which contains all mocks
import './git-playbooks-register-test-setup';

describe('GitPlaybooksRegisterController', () => {
  let controller: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a fresh controller using our mock implementation
    controller = createMockGitPlaybooksRegisterController();

    // Update mock implementations for this test file
    mockGitComponent.init = vi.fn().mockResolvedValue(undefined);
    mockGitComponent.syncFromRepository = vi.fn().mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addGitRepository', () => {
    it('should add a Git repository', async () => {
      const repository = {
        name: 'New Git Repository',
        accessToken: 'token123',
        branch: 'main',
        email: 'user@example.com',
        userName: 'user',
        remoteUrl: 'https://github.com/example/new-repo.git',
        gitService: SsmGit.Services.Github,
        directoryExclusionList: ['.git'],
        vaults: ['vault1'],
        ignoreSSLErrors: false,
      };

      await controller.addGitRepository(repository);

      expect(mockVaultCryptoService.encrypt).toHaveBeenCalledWith('token123', DEFAULT_VAULT_ID);
      expect(mockPlaybooksRegisterService.addGitRepository).toHaveBeenCalledWith(
        'New Git Repository',
        'encrypted-token',
        'main',
        'user@example.com',
        'user',
        'https://github.com/example/new-repo.git',
        SsmGit.Services.Github,
        ['.git'],
        ['vault1'],
        false,
      );
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalled();
    });
  });

  describe('getGitRepositories', () => {
    it('should get all Git repositories with redacted access tokens', async () => {
      const result = await controller.getGitRepositories();

      expect(mockPlaybooksRegisterRepository.findAllByType).toHaveBeenCalledWith('git');
      expect(result).toHaveLength(1);
      expect(result[0].accessToken).toBe('REDACTED');
    });
  });

  describe('updateGitRepository', () => {
    it('should update a Git repository', async () => {
      const repository = {
        name: 'Updated Git Repository',
        accessToken: 'new-token',
        branch: 'develop',
        email: 'new@example.com',
        userName: 'new-user',
        remoteUrl: 'https://github.com/example/updated-repo.git',
        gitService: SsmGit.Services.Github,
        directoryExclusionList: ['.git', 'node_modules'],
        vaults: ['vault1', 'vault2'],
        ignoreSSLErrors: true,
      };

      await controller.updateGitRepository('git-uuid', repository);

      expect(mockVaultCryptoService.encrypt).toHaveBeenCalledWith('new-token', DEFAULT_VAULT_ID);
      expect(mockPlaybooksRegisterService.updateGitRepository).toHaveBeenCalledWith(
        'git-uuid',
        'Updated Git Repository',
        'encrypted-token',
        'develop',
        'new@example.com',
        'new-user',
        'https://github.com/example/updated-repo.git',
        SsmGit.Services.Github,
        ['.git', 'node_modules'],
        ['vault1', 'vault2'],
        true,
      );
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalled();
    });
  });

  describe('deleteGitRepository', () => {
    it('should delete a Git repository', async () => {
      await controller.deleteGitRepository('git-uuid');

      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('git-uuid');
      expect(mockPlaybooksRegisterService.deleteRepository).toHaveBeenCalledWith(mockGitRegister);
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(controller.deleteGitRepository('nonexistent-uuid')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('forcePullRepository', () => {
    it('should force pull a Git repository', async () => {
      await controller.forcePullRepository('git-uuid');

      expect(mockPlaybooksRegisterEngineService.getRepository).toHaveBeenCalledWith('git-uuid');
      expect(mockGitComponent.syncFromRepository).toHaveBeenCalled();
    });

    it('should throw NotFoundError when component not found', async () => {
      mockPlaybooksRegisterEngineService.getRepository.mockReturnValueOnce(null);
      await expect(controller.forcePullRepository('nonexistent-uuid')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('forceCloneRepository', () => {
    it('should force clone a Git repository', async () => {
      await controller.forceCloneRepository('git-uuid');

      expect(mockPlaybooksRegisterEngineService.getRepository).toHaveBeenCalledWith('git-uuid');
      expect(mockGitComponent.init).toHaveBeenCalled();
    });
  });

  describe('commitAndSyncRepository', () => {
    it('should commit and sync a Git repository', async () => {
      await controller.commitAndSyncRepository('git-uuid');

      expect(mockPlaybooksRegisterEngineService.getRepository).toHaveBeenCalledWith('git-uuid');
      expect(mockGitComponent.syncFromRepository).toHaveBeenCalled();
    });
  });

  describe('forceRegister', () => {
    it('should force register a Git repository', async () => {
      await controller.forceRegister('git-uuid');

      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('git-uuid');
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalledWith(
        mockGitRegister,
      );
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(controller.forceRegister('nonexistent-uuid')).rejects.toThrow(NotFoundError);
    });
  });
});
