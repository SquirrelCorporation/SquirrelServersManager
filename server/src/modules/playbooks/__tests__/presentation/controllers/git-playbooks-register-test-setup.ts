import { API, Repositories, SsmGit } from 'ssm-shared-lib';
import { vi } from 'vitest';

// Mock custom error classes
export class EntityNotFoundException extends Error {
  constructor(entity: string, id: string) {
    super(`Entity ${entity} with ID ${id} not found`);
    this.name = 'EntityNotFoundException';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Mock constants
export const DEFAULT_VAULT_ID = 'default';
export const VAULT_CRYPTO_SERVICE = 'VAULT_CRYPTO_SERVICE';
export const PLAYBOOKS_REGISTER_REPOSITORY = 'PLAYBOOKS_REGISTER_REPOSITORY';
export const PLAYBOOKS_REGISTER_ENGINE_SERVICE = 'PLAYBOOKS_REGISTER_ENGINE_SERVICE';
export const PLAYBOOKS_REGISTER_SERVICE = 'PLAYBOOKS_REGISTER_SERVICE';

// Mock interface for IPlaybooksRegister
export interface IPlaybooksRegister {
  uuid: string;
  name: string;
  type: string;
  enabled: boolean;
  remoteUrl?: string;
  branch?: string;
  userName?: string;
  email?: string;
  accessToken?: string;
  gitService?: SsmGit.Services;
  directory?: string;
  directoryExclusionList?: string[];
  vaults?: string[];
  ignoreSSLErrors?: boolean;
}

// Mock the GitPlaybooksRegisterComponent
export class GitPlaybooksRegisterComponent {
  constructor() {}
  init = vi.fn().mockResolvedValue(undefined);
  syncFromRepository = vi.fn().mockResolvedValue(undefined);
}

// Create sample repository object
export const mockGitRegister: IPlaybooksRegister = {
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

// Create mock components and services
export const mockGitComponent = {
  init: vi.fn().mockResolvedValue(undefined),
  syncFromRepository: vi.fn().mockResolvedValue(undefined),
};

export const mockPlaybooksRegisterEngineService = {
  registerRegister: vi.fn().mockResolvedValue(undefined),
  getRepository: vi.fn().mockReturnValue(mockGitComponent),
};

export const mockPlaybooksRegisterService = {
  addGitRepository: vi.fn().mockResolvedValue(mockGitRegister),
  updateGitRepository: vi.fn().mockResolvedValue(mockGitRegister),
  deleteRepository: vi.fn().mockResolvedValue(undefined),
};

export const mockPlaybooksRegisterRepository = {
  findAllByType: vi.fn().mockResolvedValue([mockGitRegister]),
  findByUuid: vi.fn().mockImplementation((uuid) => {
    if (uuid === 'git-uuid') return Promise.resolve(mockGitRegister);
    return Promise.resolve(null);
  }),
  create: vi.fn().mockResolvedValue(mockGitRegister),
  update: vi.fn().mockResolvedValue(mockGitRegister),
};

export const mockVaultCryptoService = {
  encrypt: vi.fn().mockResolvedValue('encrypted-token'),
};

// Create a mock controller implementation
export const createMockGitPlaybooksRegisterController = () => {
  return {
    // Dependencies
    playbooksRegisterEngineService: mockPlaybooksRegisterEngineService,
    playbooksRegisterService: mockPlaybooksRegisterService,
    playbooksRegisterRepository: mockPlaybooksRegisterRepository,
    vaultCryptoService: mockVaultCryptoService,
    logger: {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },

    // Helper methods
    getGitComponent(uuid: string): GitPlaybooksRegisterComponent {
      const component = this.playbooksRegisterEngineService.getRepository(uuid);
      if (!component) {
        throw new NotFoundError(`Repository component with ID ${uuid} not found`);
      }
      return component;
    },

    // Controller methods
    async addGitRepository(repository: API.GitPlaybooksRepository): Promise<void> {
      this.logger.log(`Adding Git repository ${repository.name}`);

      const {
        name,
        accessToken,
        branch,
        email,
        userName,
        remoteUrl,
        directoryExclusionList,
        gitService,
        vaults,
        ignoreSSLErrors,
      } = repository;

      // Encrypt the token
      const encryptedToken = await this.vaultCryptoService.encrypt(
        accessToken as string,
        DEFAULT_VAULT_ID,
      );

      // Create repository
      await this.playbooksRegisterService.addGitRepository(
        name,
        encryptedToken,
        branch,
        email,
        userName,
        remoteUrl,
        gitService,
        directoryExclusionList || [],
        vaults as string[],
        ignoreSSLErrors,
      );

      // Register the new repository
      const register = await this.playbooksRegisterRepository.create({
        name,
        type: Repositories.RepositoryType.GIT,
        enabled: true,
        accessToken: encryptedToken,
        branch,
        email,
        userName,
        remoteUrl,
        gitService,
        directoryExclusionList: directoryExclusionList || [],
        vaults: vaults as string[],
        ignoreSSLErrors,
      });

      await this.playbooksRegisterEngineService.registerRegister(register);
    },

    async getGitRepositories(): Promise<API.GitPlaybooksRepository[]> {
      this.logger.log('Getting all Git repositories');

      const registers = await this.playbooksRegisterRepository.findAllByType(
        Repositories.RepositoryType.GIT,
      );

      return registers.map((repo) => ({
        ...repo,
        accessToken: 'REDACTED',
      })) as unknown as API.GitPlaybooksRepository[];
    },

    async updateGitRepository(uuid: string, repository: API.GitPlaybooksRepository): Promise<void> {
      this.logger.log(`Updating Git repository ${uuid}`);

      const {
        name,
        accessToken,
        branch,
        email,
        userName,
        remoteUrl,
        directoryExclusionList,
        gitService,
        vaults,
        ignoreSSLErrors,
      } = repository;

      const encryptedToken = await this.vaultCryptoService.encrypt(
        accessToken as string,
        DEFAULT_VAULT_ID,
      );

      // Update repository
      await this.playbooksRegisterService.updateGitRepository(
        uuid,
        name,
        encryptedToken,
        branch,
        email,
        userName,
        remoteUrl,
        gitService,
        directoryExclusionList || [],
        vaults as string[],
        ignoreSSLErrors,
      );

      // Re-register
      const updatedRegister = await this.playbooksRegisterRepository.update(uuid, {
        name,
        accessToken: encryptedToken,
        branch,
        email,
        userName,
        remoteUrl,
        gitService,
        directoryExclusionList: directoryExclusionList || [],
        vaults: vaults as string[],
        ignoreSSLErrors,
      });

      await this.playbooksRegisterEngineService.registerRegister(updatedRegister);
    },

    async deleteGitRepository(uuid: string): Promise<void> {
      this.logger.log(`Deleting Git repository ${uuid}`);

      const register = await this.playbooksRegisterRepository.findByUuid(uuid);
      if (!register) {
        throw new NotFoundError(`Repository with ID ${uuid} not found`);
      }

      await this.playbooksRegisterService.deleteRepository(register);
    },

    async forcePullRepository(uuid: string): Promise<void> {
      this.logger.log(`Force pulling Git repository ${uuid}`);
      const component = this.playbooksRegisterEngineService.getRepository(uuid);
      if (!component) {
        throw new NotFoundError(`Repository component with ID ${uuid} not found`);
      }
      await component.syncFromRepository();
    },

    async forceCloneRepository(uuid: string): Promise<void> {
      this.logger.log(`Force cloning Git repository ${uuid}`);
      const component = this.playbooksRegisterEngineService.getRepository(uuid);
      await component.init();
    },

    async commitAndSyncRepository(uuid: string): Promise<void> {
      this.logger.log(`Committing and syncing Git repository ${uuid}`);
      const component = this.playbooksRegisterEngineService.getRepository(uuid);
      await component.syncFromRepository();
    },

    async forceRegister(uuid: string): Promise<void> {
      this.logger.log(`Force registering Git repository ${uuid}`);

      const register = await this.playbooksRegisterRepository.findByUuid(uuid);
      if (!register) {
        throw new NotFoundError(`Repository with ID ${uuid} not found`);
      }

      await this.playbooksRegisterEngineService.registerRegister(register);
    },
  };
};

// Mock the infrastructure exceptions
vi.mock('@infrastructure/exceptions/app-exceptions', () => ({
  EntityNotFoundException: EntityNotFoundException,
}));

// Mock ansible-vaults
vi.mock('@modules/ansible-vaults', () => ({
  DEFAULT_VAULT_ID: DEFAULT_VAULT_ID,
  VAULT_CRYPTO_SERVICE: VAULT_CRYPTO_SERVICE,
  VaultCryptoService: vi.fn(),
}));

// Mock playbooks module
vi.mock('@modules/playbooks', () => ({
  PLAYBOOKS_REGISTER_ENGINE_SERVICE: PLAYBOOKS_REGISTER_ENGINE_SERVICE,
}));

// Mock domain repositories interface
vi.mock('@modules/playbooks/domain/repositories/playbooks-register-repository.interface', () => ({
  PLAYBOOKS_REGISTER_REPOSITORY: PLAYBOOKS_REGISTER_REPOSITORY,
}));

// Mock domain services interface
vi.mock('@modules/playbooks/domain/services/playbooks-register-service.interface', () => ({
  PLAYBOOKS_REGISTER_SERVICE: PLAYBOOKS_REGISTER_SERVICE,
}));

// Mock components
vi.mock('../../../application/services/components/git-playbooks-register.component', () => ({
  GitPlaybooksRegisterComponent: GitPlaybooksRegisterComponent,
}));
