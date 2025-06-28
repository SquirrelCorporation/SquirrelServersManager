import { vi } from 'vitest';
import { Repositories } from 'ssm-shared-lib';
import { Logger } from '@nestjs/common';

// Mock config values
vi.mock('src/config', () => ({
  SSM_DATA_PATH: '/data',
  SSM_INSTALL_PATH: '/install',
}));

// Mock FileSystemService from @modules/shell
vi.mock('@modules/shell', () => ({
  FileSystemService: vi.fn(),
}));

// Mock IPlaybooksRegister interface
export interface IPlaybooksRegister {
  uuid?: string;
  name: string;
  type: string;
  enabled: boolean;
  directory?: string;
  default?: boolean;
}

// Mock PlaybooksRegisterRepository
export const mockPlaybooksRegisterRepository = {
  findByUuid: vi.fn(),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
};

// Mock FileSystemService
export const mockFileSystemService = {
  createDirectory: vi.fn().mockResolvedValue(undefined),
};

// Create a mock Logger
export const mockLogger = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

// Create a mock DefaultPlaybooksRegisterService
export const createMockDefaultPlaybooksRegisterService = () => {
  const mockService = {
    // Dependencies
    playbooksRepositoryRepository: mockPlaybooksRegisterRepository,
    fileSystemService: mockFileSystemService,
    logger: mockLogger,

    // Private properties
    corePlaybooksRepository: {
      name: 'ssm-core',
      uuid: '00000000-0000-0000-0000-000000000000',
      enabled: true,
      type: Repositories.RepositoryType.LOCAL,
      directory: '/install/server/src/ansible/00000000-0000-0000-0000-000000000000',
      default: true,
    },

    toolsPlaybooksRepository: {
      name: 'ssm-tools',
      uuid: '00000000-0000-0000-0000-000000000001',
      enabled: true,
      type: Repositories.RepositoryType.LOCAL,
      directory: '/install/server/src/ansible/00000000-0000-0000-0000-000000000001',
      default: true,
    },

    // Methods
    saveSSMDefaultPlaybooksRepositories: async () => {
      mockLogger.log('Saving default SSM playbooks repositories');

      // Check if repositories exist first
      const coreRepo = await mockPlaybooksRegisterRepository.findByUuid(
        mockService.corePlaybooksRepository.uuid!,
      );
      if (!coreRepo) {
        await mockPlaybooksRegisterRepository.create(mockService.corePlaybooksRepository);
      } else {
        await mockPlaybooksRegisterRepository.update(
          mockService.corePlaybooksRepository.uuid!,
          mockService.corePlaybooksRepository,
        );
      }

      const toolsRepo = await mockPlaybooksRegisterRepository.findByUuid(
        mockService.toolsPlaybooksRepository.uuid!,
      );
      if (!toolsRepo) {
        await mockPlaybooksRegisterRepository.create(mockService.toolsPlaybooksRepository);
      } else {
        await mockPlaybooksRegisterRepository.update(
          mockService.toolsPlaybooksRepository.uuid!,
          mockService.toolsPlaybooksRepository,
        );
      }
    },

    createDefaultLocalUserRepository: async (userEmail: string) => {
      mockLogger.log('Creating default local user repository');

      if (!userEmail) {
        mockLogger.warn('No user email provided, skipping default repository creation');
        return;
      }

      const userPlaybooksRepository = {
        name: userEmail.trim().split('@')[0] || 'user-default',
        enabled: true,
        type: Repositories.RepositoryType.LOCAL,
        directory: '/data/playbooks/00000000-0000-0000-0000-000000000002',
        uuid: '00000000-0000-0000-0000-000000000002',
      };

      // Check if repository exists first
      const userRepo = await mockPlaybooksRegisterRepository.findByUuid(
        userPlaybooksRepository.uuid!,
      );
      if (!userRepo) {
        await mockPlaybooksRegisterRepository.create(userPlaybooksRepository);
      } else {
        await mockPlaybooksRegisterRepository.update(
          userPlaybooksRepository.uuid!,
          userPlaybooksRepository,
        );
      }

      try {
        await mockFileSystemService.createDirectory(userPlaybooksRepository.directory as string);
      } catch (error: any) {
        mockLogger.error(`Error creating directory: ${error.message}`);
      }
    },
  };

  return mockService;
};

// Override Logger
vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
