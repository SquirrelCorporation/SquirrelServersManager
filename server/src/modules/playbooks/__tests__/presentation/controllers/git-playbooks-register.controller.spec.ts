import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GitPlaybooksRepositoryController } from '../../../presentation/controllers/git-playbooks-register.controller';
import { PlaybooksRegisterEngineService } from '../../../application/services/engine/playbooks-register-engine.service';
import { PlaybooksRegisterService } from '../../../application/services/playbooks-register.service';
import { PLAYBOOKS_REGISTER_REPOSITORY } from '../../../domain/repositories/playbooks-register-repository.interface';
import { VaultCryptoService, DEFAULT_VAULT_ID } from '@modules/ansible-vault';
import { IPlaybooksRegister } from '../../../domain/entities/playbooks-register.entity';
import { API, Repositories, SsmGit } from 'ssm-shared-lib';
import { NotFoundError } from '../../../../../middlewares/api/ApiError';

describe('GitPlaybooksRegisterController', () => {
  let controller: GitPlaybooksRepositoryController;
  let mockPlaybooksRegisterEngineService: any;
  let mockPlaybooksRegisterService: any;
  let mockPlaybooksRegisterRepository: any;
  let mockVaultCryptoService: any;
  let mockGitComponent: any;

  const mockGitRegister: IPlaybooksRegister = {
    uuid: 'git-uuid',
    name: 'Git Repository',
    type: 'git',
    enabled: true,
    remoteUrl: 'https://github.com/example/repo.git',
    branch: 'main',
    userName: 'user',
    email: 'user@example.com',
    accessToken: 'encrypted-token',
    gitService: SsmGit.Services.Github,
    directory: '/path/to/git/repo',
  };

  beforeEach(async () => {
    mockGitComponent = {
      forcePull: vi.fn().mockResolvedValue(undefined),
      clone: vi.fn().mockResolvedValue(undefined),
      commitAndSync: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybooksRegisterEngineService = {
      registerRegister: vi.fn().mockResolvedValue(undefined),
      getRepository: vi.fn().mockReturnValue(mockGitComponent),
    };

    mockPlaybooksRegisterService = {
      addGitRepository: vi.fn().mockResolvedValue(mockGitRegister),
      updateGitRepository: vi.fn().mockResolvedValue(mockGitRegister),
      deleteRepository: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybooksRegisterRepository = {
      findAllByType: vi.fn().mockResolvedValue([mockGitRegister]),
      findByUuid: vi.fn().mockImplementation((uuid) => {
        if (uuid === 'git-uuid') return Promise.resolve(mockGitRegister);
        return Promise.resolve(null);
      }),
    };

    mockVaultCryptoService = {
      encrypt: vi.fn().mockResolvedValue('encrypted-token'),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [GitPlaybooksRepositoryController],
      providers: [
        {
          provide: PlaybooksRegisterEngineService,
          useValue: mockPlaybooksRegisterEngineService,
        },
        {
          provide: PlaybooksRegisterService,
          useValue: mockPlaybooksRegisterService,
        },
        {
          provide: PLAYBOOKS_REGISTER_REPOSITORY,
          useValue: mockPlaybooksRegisterRepository,
        },
        {
          provide: VaultCryptoService,
          useValue: mockVaultCryptoService,
        },
      ],
    }).compile();

    controller = moduleRef.get<GitPlaybooksRepositoryController>(GitPlaybooksRepositoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addGitRepository', () => {
    it('should add a Git repository', async () => {
      const repository: API.GitPlaybooksRepository = {
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
        false
      );
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalledWith(mockGitRegister);
    });
  });

  describe('getGitRepositories', () => {
    it('should get all Git repositories with redacted access tokens', async () => {
      const result = await controller.getGitRepositories();
      
      expect(mockPlaybooksRegisterRepository.findAllByType).toHaveBeenCalledWith(Repositories.RepositoryType.GIT);
      expect(result).toHaveLength(1);
      expect(result[0].accessToken).toBe('REDACTED');
    });
  });

  describe('updateGitRepository', () => {
    it('should update a Git repository', async () => {
      const repository: API.GitPlaybooksRepository = {
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
        true
      );
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalledWith(mockGitRegister);
    });
  });

  describe('deleteGitRepository', () => {
    it('should delete a Git repository', async () => {
      await controller.deleteGitRepository('git-uuid');
      
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('git-uuid');
      expect(mockPlaybooksRegisterService.deleteRepository).toHaveBeenCalledWith(mockGitRegister);
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(controller.deleteGitRepository('nonexistent-uuid')).rejects.toThrow(NotFoundError);
    });
  });

  describe('forcePullRepository', () => {
    it('should force pull a Git repository', async () => {
      await controller.forcePullRepository('git-uuid');
      
      expect(mockPlaybooksRegisterEngineService.getRepository).toHaveBeenCalledWith('git-uuid');
      expect(mockGitComponent.forcePull).toHaveBeenCalled();
    });

    it('should throw NotFoundError when component not found', async () => {
      mockPlaybooksRegisterEngineService.getRepository.mockReturnValueOnce(null);
      await expect(controller.forcePullRepository('nonexistent-uuid')).rejects.toThrow(NotFoundError);
    });
  });

  describe('forceCloneRepository', () => {
    it('should force clone a Git repository', async () => {
      await controller.forceCloneRepository('git-uuid');
      
      expect(mockPlaybooksRegisterEngineService.getRepository).toHaveBeenCalledWith('git-uuid');
      expect(mockGitComponent.clone).toHaveBeenCalled();
    });
  });

  describe('commitAndSyncRepository', () => {
    it('should commit and sync a Git repository', async () => {
      await controller.commitAndSyncRepository('git-uuid');
      
      expect(mockPlaybooksRegisterEngineService.getRepository).toHaveBeenCalledWith('git-uuid');
      expect(mockGitComponent.commitAndSync).toHaveBeenCalled();
    });
  });

  describe('forceRegister', () => {
    it('should force register a Git repository', async () => {
      await controller.forceRegister('git-uuid');
      
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('git-uuid');
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalledWith(mockGitRegister);
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(controller.forceRegister('nonexistent-uuid')).rejects.toThrow(NotFoundError);
    });
  });
});