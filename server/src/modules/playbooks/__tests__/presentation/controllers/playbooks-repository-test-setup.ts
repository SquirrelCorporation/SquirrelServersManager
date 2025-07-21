import { API } from 'ssm-shared-lib';
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
export const PLAYBOOKS_REGISTER_SERVICE = 'PLAYBOOKS_REGISTER_SERVICE';

// Mock interface for IPlaybooksRegister
export interface IPlaybooksRegister {
  uuid: string;
  name: string;
  type: string;
  enabled: boolean;
  directory?: string;
}

// Create sample repository object
export const mockRepository: IPlaybooksRegister = {
  uuid: 'repo-uuid',
  name: 'Test Repository',
  type: 'local',
  enabled: true,
  directory: '/path/to/repo',
};

// Create mock services
export const mockPlaybooksRegisterService = {
  getAllPlaybooksRepositories: vi.fn().mockResolvedValue([
    {
      name: 'Test Repository',
      children: [],
      type: 'local',
      uuid: 'repo-uuid',
      path: '/path/to/repo',
      default: true,
    },
  ]),
  createDirectoryInPlaybookRepository: vi.fn().mockResolvedValue(undefined),
  createPlaybookInRepository: vi.fn().mockResolvedValue({
    uuid: 'playbook-uuid',
    name: 'Test Playbook',
    path: '/path/to/playbook.yml',
  }),
  deletePlaybookFromRepository: vi.fn().mockResolvedValue(undefined),
  deleteDirectoryFromRepository: vi.fn().mockResolvedValue(undefined),
  savePlaybook: vi.fn().mockResolvedValue(undefined),
  syncRepository: vi.fn().mockResolvedValue(undefined),
};

export const mockPlaybooksRegisterRepository = {
  findByUuid: vi.fn().mockImplementation((uuid) => {
    if (uuid === 'repo-uuid') {
      return Promise.resolve(mockRepository);
    }
    return Promise.resolve(null);
  }),
};

// Create a mock controller implementation
export const createMockPlaybooksRepositoryController = () => {
  return {
    // Dependencies
    playbooksRegisterService: mockPlaybooksRegisterService,
    playbooksRegisterRepository: mockPlaybooksRegisterRepository,
    logger: {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    },

    // Controller methods
    async getPlaybooksRepositories(): Promise<API.PlaybooksRepository[]> {
      this.logger.log('Getting all playbooks repositories');
      return await this.playbooksRegisterService.getAllPlaybooksRepositories();
    },

    async addDirectoryToPlaybookRepository(
      uuid: string,
      { fullPath }: { fullPath: string },
    ): Promise<void> {
      this.logger.log(`Adding directory ${fullPath} to repository ${uuid}`);

      const playbooksRegister = await this.playbooksRegisterRepository.findByUuid(uuid);
      if (!playbooksRegister) {
        throw new EntityNotFoundException('PlaybookRepository', uuid);
      }

      await this.playbooksRegisterService.createDirectoryInPlaybookRepository(
        playbooksRegister,
        fullPath,
      );
    },

    async addPlaybookToRepository(
      uuid: string,
      playbookName: string,
      { fullPath }: { fullPath: string },
    ): Promise<any> {
      this.logger.log(`Adding playbook ${playbookName} at ${fullPath} to repository ${uuid}`);

      const playbooksRegister = await this.playbooksRegisterRepository.findByUuid(uuid);
      if (!playbooksRegister) {
        throw new EntityNotFoundException('PlaybookRepository', uuid);
      }

      return await this.playbooksRegisterService.createPlaybookInRepository(
        playbooksRegister,
        fullPath,
        playbookName,
      );
    },

    async deletePlaybookFromRepository(uuid: string, playbookUuid: string): Promise<void> {
      this.logger.log(`Deleting playbook ${playbookUuid} from repository ${uuid}`);

      const playbooksRegister = await this.playbooksRegisterRepository.findByUuid(uuid);
      if (!playbooksRegister) {
        throw new EntityNotFoundException('PlaybookRepository', uuid);
      }

      await this.playbooksRegisterService.deletePlaybookFromRepository(
        playbooksRegister,
        playbookUuid,
      );
    },

    async deleteDirectoryFromRepository(
      uuid: string,
      { fullPath }: { fullPath: string },
    ): Promise<void> {
      this.logger.log(`Deleting directory ${fullPath} from repository ${uuid}`);

      const playbooksRegister = await this.playbooksRegisterRepository.findByUuid(uuid);
      if (!playbooksRegister) {
        throw new EntityNotFoundException('PlaybookRepository', uuid);
      }

      await this.playbooksRegisterService.deleteDirectoryFromRepository(
        playbooksRegister,
        fullPath,
      );
    },

    async savePlaybook(playbookUuid: string, { content }: { content: string }): Promise<void> {
      this.logger.log(`Saving playbook ${playbookUuid}`);
      await this.playbooksRegisterService.savePlaybook(playbookUuid, content);
    },

    async syncRepository(uuid: string): Promise<void> {
      this.logger.log(`Syncing repository ${uuid}`);
      await this.playbooksRegisterService.syncRepository(uuid);
    },
  };
};

// Mock the infrastructure exceptions
vi.mock('@infrastructure/exceptions/app-exceptions', () => ({
  EntityNotFoundException: EntityNotFoundException,
}));

// Mock domain repositories interface
vi.mock('@modules/playbooks/domain/repositories/playbooks-register-repository.interface', () => ({
  PLAYBOOKS_REGISTER_REPOSITORY: PLAYBOOKS_REGISTER_REPOSITORY,
}));

// Mock domain services interface
vi.mock('@modules/playbooks/domain/services/playbooks-register-service.interface', () => ({
  PLAYBOOKS_REGISTER_SERVICE: PLAYBOOKS_REGISTER_SERVICE,
}));

// Mock Mongoose
vi.mock('@nestjs/mongoose', () => ({
  getModelToken: vi.fn().mockImplementation((name) => `${name}Token`),
}));
