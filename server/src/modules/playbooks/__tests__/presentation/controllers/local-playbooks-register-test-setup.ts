import { API, Repositories } from 'ssm-shared-lib';
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
export const PLAYBOOKS_REGISTER_REPOSITORY = 'PLAYBOOKS_REGISTER_REPOSITORY';
export const PLAYBOOKS_REGISTER_ENGINE_SERVICE = 'PLAYBOOKS_REGISTER_ENGINE_SERVICE';
export const PLAYBOOKS_REGISTER_SERVICE = 'PLAYBOOKS_REGISTER_SERVICE';

// Mock interface for IPlaybooksRegister
export interface IPlaybooksRegister {
  uuid: string;
  name: string;
  type: string;
  enabled: boolean;
  directory?: string;
  directoryExclusionList?: string[];
  vaults?: string[];
}

// Mock the LocalPlaybooksRegisterComponent
export class LocalPlaybooksRegisterComponent {
  constructor() {}
  syncToDatabase = vi.fn().mockResolvedValue(undefined);
}

// Create sample repository object
export const mockLocalRegister: IPlaybooksRegister = {
  uuid: 'local-uuid',
  name: 'Local Repository',
  type: 'local',
  enabled: true,
  directory: '/path/to/local/repo',
  directoryExclusionList: ['.git'],
  vaults: ['vault1'],
};

// Create mock components and services
export const mockLocalComponent = {
  syncToDatabase: vi.fn().mockResolvedValue(undefined),
};

export const mockPlaybooksRegisterEngineService = {
  registerRegister: vi.fn().mockResolvedValue(undefined),
  getRepository: vi.fn().mockReturnValue(mockLocalComponent),
};

export const mockPlaybooksRegisterService = {
  deleteRepository: vi.fn().mockResolvedValue(undefined),
};

export const mockPlaybooksRegisterRepository = {
  findAllByType: vi.fn().mockResolvedValue([mockLocalRegister]),
  findByUuid: vi.fn().mockImplementation((uuid) => {
    if (uuid === 'local-uuid') return Promise.resolve(mockLocalRegister);
    return Promise.resolve(null);
  }),
  create: vi.fn().mockResolvedValue(mockLocalRegister),
  update: vi.fn().mockResolvedValue(mockLocalRegister),
};

// Create a mock controller implementation
export const createMockLocalPlaybooksRegisterController = () => {
  return {
    // Dependencies
    playbooksRegisterEngineService: mockPlaybooksRegisterEngineService,
    playbooksRegisterService: mockPlaybooksRegisterService,
    playbooksRegisterRepository: mockPlaybooksRegisterRepository,
    logger: {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },

    // Helper methods
    getLocalComponent(uuid: string): LocalPlaybooksRegisterComponent {
      const component = this.playbooksRegisterEngineService.getRepository(uuid);
      if (!component) {
        throw new NotFoundError(`Repository component with ID ${uuid} not found`);
      }
      return component;
    },

    // Controller methods
    async getLocalRepositories(): Promise<API.LocalPlaybooksRepository[]> {
      const repositories = await this.playbooksRegisterRepository.findAllByType(
        Repositories.RepositoryType.LOCAL,
      );
      return repositories as unknown as API.LocalPlaybooksRepository[];
    },

    async updateLocalRepository(
      uuid: string,
      repository: API.LocalPlaybooksRepository,
    ): Promise<void> {
      this.logger.log(`Updating local repository ${uuid}`);

      const { name, directoryExclusionList, vaults } = repository;

      await this.playbooksRegisterRepository.update(uuid, {
        name,
        directoryExclusionList,
        vaults: vaults as string[],
      });

      const register = await this.playbooksRegisterRepository.findByUuid(uuid);
      if (!register) {
        throw new NotFoundError(`Repository with ID ${uuid} not found`);
      }

      await this.playbooksRegisterEngineService.registerRegister(register);
    },

    async deleteLocalRepository(uuid: string): Promise<void> {
      this.logger.log(`Deleting local repository ${uuid}`);

      const register = await this.playbooksRegisterRepository.findByUuid(uuid);
      if (!register) {
        throw new NotFoundError(`Repository with ID ${uuid} not found`);
      }

      await this.playbooksRegisterService.deleteRepository(register);
    },

    async addLocalRepository(repository: API.LocalPlaybooksRepository): Promise<void> {
      this.logger.log(`Adding local repository ${repository.name}`);

      const { name, directoryExclusionList, vaults } = repository;

      const register = await this.playbooksRegisterRepository.create({
        name,
        type: Repositories.RepositoryType.LOCAL,
        enabled: true,
        directory: name,
        directoryExclusionList: directoryExclusionList || [],
        vaults: vaults as string[],
      });

      await this.playbooksRegisterEngineService.registerRegister(register);
    },

    async syncToDatabaseLocalRepository(uuid: string): Promise<void> {
      this.logger.log(`Syncing local repository ${uuid} to database`);

      const register = await this.playbooksRegisterRepository.findByUuid(uuid);
      if (!register) {
        throw new NotFoundError(`Repository with ID ${uuid} not found`);
      }

      const component = this.getLocalComponent(uuid);
      await component.syncToDatabase();
    },
  };
};

// Mock the infrastructure exceptions
vi.mock('@infrastructure/exceptions/app-exceptions', () => ({
  EntityNotFoundException: EntityNotFoundException,
}));

// Mock playbooks module
vi.mock('@modules/playbooks', () => ({
  PLAYBOOKS_REGISTER_ENGINE_SERVICE: PLAYBOOKS_REGISTER_ENGINE_SERVICE,
  PLAYBOOKS_REGISTER_SERVICE: PLAYBOOKS_REGISTER_SERVICE,
  PLAYBOOKS_REGISTER_REPOSITORY: PLAYBOOKS_REGISTER_REPOSITORY,
  PlaybooksRegisterService: vi.fn(),
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
vi.mock('../../../application/services/components/local-playbooks-repository.component', () => ({
  LocalPlaybooksRegisterComponent: LocalPlaybooksRegisterComponent,
}));

// Mock Mongoose
vi.mock('@nestjs/mongoose', () => ({
  getModelToken: vi.fn().mockImplementation((name) => `${name}Token`),
}));
