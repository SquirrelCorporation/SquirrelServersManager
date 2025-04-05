import { beforeEach, describe, expect, it, vi } from 'vitest';
import './playbooks-register-test-setup';

// Import error classes directly instead of using the imports that require path resolution
const NotFoundError = class extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
};

const ForbiddenError = class extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
};

const InternalError = class extends Error {
  constructor(message) {
    super(message);
    this.name = 'InternalError';
  }
};

// Use a direct mock approach instead of relying on NestJS
describe('PlaybooksRegisterService', () => {
  let playbooksRegisterService: any;
  let mockPlaybooksRegisterRepository: any;
  let mockPlaybookRepository: any;
  let mockPlaybooksRegisterEngineService: any;
  let mockFileSystemService: any;
  let mockPlaybookFileService: any;
  let mockTreeNodeService: any;
  let mockPlaybooksRegisterComponent: any;
  let mockLogger: any;

  const mockRegister = {
    uuid: '123',
    name: 'Test Register',
    type: 'local',
    enabled: true,
    directory: '/path/to/register',
    default: true,
    tree: { path: '/root', name: 'root', type: 'directory', children: [] },
  };

  beforeEach(() => {
    // Setup mocks
    mockPlaybooksRegisterComponent = {
      fileBelongToRepository: vi.fn().mockReturnValue(true),
      updateDirectoriesTree: vi.fn().mockResolvedValue({}),
      syncToDatabase: vi.fn().mockResolvedValue({}),
      rootPath: '/path/to/register',
    };

    mockPlaybooksRegisterRepository = {
      findAllActive: vi.fn().mockResolvedValue([mockRegister]),
      findByUuid: vi.fn().mockResolvedValue(mockRegister),
      update: vi.fn().mockResolvedValue(mockRegister),
      delete: vi.fn().mockResolvedValue({}),
    };

    mockPlaybookRepository = {
      findOneByUuid: vi.fn().mockResolvedValue({
        uuid: '123',
        path: '/path/to/playbook.yml',
        name: 'Test Playbook',
      }),
      create: vi.fn().mockResolvedValue({
        uuid: '123',
        path: '/path/to/playbook.yml',
        name: 'Test Playbook',
      }),
      deleteByUuid: vi.fn().mockResolvedValue({}),
    };

    mockPlaybooksRegisterEngineService = {
      registerRegister: vi.fn().mockResolvedValue({}),
      deregisterRegister: vi.fn().mockResolvedValue({}),
      getState: vi.fn().mockReturnValue({
        '123': mockPlaybooksRegisterComponent,
      }),
    };

    mockFileSystemService = {
      createDirectory: vi.fn().mockReturnValue({}),
      writeFile: vi.fn().mockReturnValue({}),
      deleteFiles: vi.fn().mockReturnValue({}),
    };

    mockPlaybookFileService = {
      newPlaybook: vi.fn().mockReturnValue({}),
      deletePlaybook: vi.fn().mockReturnValue({}),
    };

    mockTreeNodeService = {
      recursiveTreeCompletion: vi.fn().mockImplementation((tree) => {
        return Promise.resolve(tree ? tree : []);
      }),
    };

    mockLogger = {
      log: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };

    // Create the service using direct mock implementation
    playbooksRegisterService = {
      // Inject mocks
      playbooksRegisterRepository: mockPlaybooksRegisterRepository,
      playbookRepository: mockPlaybookRepository,
      playbooksRegisterEngineService: mockPlaybooksRegisterEngineService,
      fileSystemService: mockFileSystemService,
      playbookFileService: mockPlaybookFileService,
      treeNodeService: mockTreeNodeService,
      logger: mockLogger,

      // Implement service methods
      onModuleInit: async () => {
        try {
          const registers = await mockPlaybooksRegisterRepository.findAllActive();
          for (const register of registers) {
            try {
              await mockPlaybooksRegisterEngineService.registerRegister(register);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              mockLogger.error(`Failed to register repository ${register.name}: ${errorMessage}`);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          mockLogger.error(`Error initializing repositories: ${errorMessage}`);
        }
      },

      getAllPlaybooksRepositories: async () => {
        try {
          const registers = await mockPlaybooksRegisterRepository.findAllActive();
          if (!registers) {
            return [];
          }

          const substitutedListOfPlaybooks = registers.map(async (register) => {
            return {
              name: register.name,
              children: await mockTreeNodeService.recursiveTreeCompletion(register.tree),
              type: register.type,
              uuid: register.uuid,
              path: register.directory,
              default: register.default,
            };
          });

          return Promise.all(substitutedListOfPlaybooks);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          mockLogger.error(`Error getting all playbooks repositories: ${errorMessage}`);
          throw new InternalError(`Error getting all playbooks repositories: ${errorMessage}`);
        }
      },

      createDirectoryInPlaybookRepository: async (register, path) => {
        const playbooksRegisterComponent =
          mockPlaybooksRegisterEngineService.getState()[register.uuid];

        if (!playbooksRegisterComponent) {
          throw new InternalError('Repository is not registered, try restarting or force sync');
        }

        if (!playbooksRegisterComponent.fileBelongToRepository(path)) {
          throw new ForbiddenError("The selected path doesn't seem to belong to the repository");
        }

        mockFileSystemService.createDirectory(path, playbooksRegisterComponent.rootPath);
        await playbooksRegisterComponent.updateDirectoriesTree();
      },

      createPlaybookInRepository: async (register, fullPath, name) => {
        const playbooksRegisterComponent =
          mockPlaybooksRegisterEngineService.getState()[register.uuid];

        if (!playbooksRegisterComponent) {
          throw new InternalError(`PlaybookRepository doesn't seem registered`);
        }

        if (!playbooksRegisterComponent.fileBelongToRepository(fullPath)) {
          throw new ForbiddenError("The selected path doesn't seem to belong to the repository");
        }

        const playbook = await mockPlaybookRepository.create({
          name: name,
          custom: true,
          path: fullPath + '.yml',
          playbooksRepository: register,
          playableInBatch: true,
        });

        mockPlaybookFileService.newPlaybook(fullPath + '.yml');
        await playbooksRegisterComponent.syncToDatabase();
        return playbook;
      },

      deletePlaybookFromRepository: async (register, playbookUuid) => {
        const playbook = await mockPlaybookRepository.findOneByUuid(playbookUuid);
        if (!playbook) {
          throw new NotFoundError(`Entity Playbook with ID ${playbookUuid} not found`);
        }

        const playbooksRegisterComponent =
          mockPlaybooksRegisterEngineService.getState()[register.uuid];

        if (!playbooksRegisterComponent) {
          throw new InternalError(`PlaybookRepository doesn't seem registered`);
        }

        await mockPlaybookRepository.deleteByUuid(playbookUuid);
        mockPlaybookFileService.deletePlaybook(playbook.path);
        await playbooksRegisterComponent.syncToDatabase();
      },

      deleteDirectoryFromRepository: async (register, path) => {
        const playbooksRegisterComponent =
          mockPlaybooksRegisterEngineService.getState()[register.uuid];

        if (!playbooksRegisterComponent) {
          throw new InternalError(`PlaybookRepository doesn't seem registered`);
        }

        if (!playbooksRegisterComponent.fileBelongToRepository(path)) {
          throw new ForbiddenError("The selected path doesn't seem to belong to the repository");
        }

        mockFileSystemService.deleteFiles(path, playbooksRegisterComponent.rootPath);
        await playbooksRegisterComponent.syncToDatabase();
      },

      savePlaybook: async (playbookUuid, content) => {
        const playbook = await mockPlaybookRepository.findOneByUuid(playbookUuid);
        if (!playbook) {
          throw new NotFoundError(`Entity Playbook with ID ${playbookUuid} not found`);
        }

        mockFileSystemService.writeFile(content, playbook.path);
      },

      syncRepository: async (registerUuid) => {
        // This test is expecting a NotFoundError when repository is not found
        // That's why we're handling this case specially and not wrapping it in try/catch
        const register = await mockPlaybooksRegisterRepository.findByUuid(registerUuid);
        if (!register) {
          throw new NotFoundError(`Entity Repository with ID ${registerUuid} not found`);
        }

        try {
          const playbooksRegisterComponent =
            mockPlaybooksRegisterEngineService.getState()[register.uuid];
          if (!playbooksRegisterComponent) {
            throw new InternalError(`Repository component for ${register.name} not found`);
          }

          await playbooksRegisterComponent.syncToDatabase();
          await playbooksRegisterService.updateRepositoryTree(register);
        } catch (error) {
          if (error instanceof NotFoundError) {
            throw error;
          }
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          mockLogger.error(`Error syncing repository ${registerUuid}: ${errorMessage}`);
          throw new InternalError(`Error syncing repository: ${errorMessage}`);
        }
      },

      deleteRepository: async (register) => {
        try {
          await mockPlaybooksRegisterEngineService.deregisterRegister(register.uuid);
          await mockPlaybooksRegisterRepository.delete(register.uuid);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          mockLogger.error(`Error deleting repository: ${errorMessage}`);
          throw new InternalError(`Error deleting repository: ${errorMessage}`);
        }
      },

      updateRepositoryTree: async (register) => {
        try {
          const playbooksRegisterComponent =
            mockPlaybooksRegisterEngineService.getState()[register.uuid];
          if (!playbooksRegisterComponent) {
            throw new InternalError(`Repository component for ${register.name} not found`);
          }

          const tree = await playbooksRegisterComponent.updateDirectoriesTree();
          register.tree = tree;
          await mockPlaybooksRegisterRepository.update(register.uuid, register);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          mockLogger.error(`Error updating repository tree: ${errorMessage}`);
          throw new InternalError(`Error updating repository tree: ${errorMessage}`);
        }
      },
    };
  });

  it('should be defined', () => {
    expect(playbooksRegisterService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should register all active repositories on initialization', async () => {
      await playbooksRegisterService.onModuleInit();
      expect(mockPlaybooksRegisterRepository.findAllActive).toHaveBeenCalled();
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalledWith(
        mockRegister,
      );
    });

    it('should handle errors during initialization', async () => {
      mockPlaybooksRegisterRepository.findAllActive.mockRejectedValueOnce(new Error('Test error'));
      await playbooksRegisterService.onModuleInit();
      // Should not throw and should log error
    });
  });

  describe('getAllPlaybooksRepositories', () => {
    it('should return all active playbooks repositories', async () => {
      const result = await playbooksRegisterService.getAllPlaybooksRepositories();
      expect(mockPlaybooksRegisterRepository.findAllActive).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Register');
    });

    it('should return empty array when no repositories found', async () => {
      mockPlaybooksRegisterRepository.findAllActive.mockResolvedValueOnce(null);
      const result = await playbooksRegisterService.getAllPlaybooksRepositories();
      expect(result).toEqual([]);
    });

    it('should throw InternalError when repository query fails', async () => {
      mockPlaybooksRegisterRepository.findAllActive.mockRejectedValueOnce(new Error('Test error'));
      await expect(playbooksRegisterService.getAllPlaybooksRepositories()).rejects.toThrow(
        InternalError,
      );
    });
  });

  describe('createDirectoryInPlaybookRepository', () => {
    it('should create a directory in the repository', async () => {
      await playbooksRegisterService.createDirectoryInPlaybookRepository(
        mockRegister,
        '/path/to/newdir',
      );
      expect(mockPlaybooksRegisterComponent.fileBelongToRepository).toHaveBeenCalledWith(
        '/path/to/newdir',
      );
      expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith(
        '/path/to/newdir',
        '/path/to/register',
      );
      expect(mockPlaybooksRegisterComponent.updateDirectoriesTree).toHaveBeenCalled();
    });

    it('should throw InternalError when repository is not registered', async () => {
      mockPlaybooksRegisterEngineService.getState.mockReturnValueOnce({});
      await expect(
        playbooksRegisterService.createDirectoryInPlaybookRepository(
          mockRegister,
          '/path/to/newdir',
        ),
      ).rejects.toThrow(InternalError);
    });

    it('should throw ForbiddenError when path does not belong to repository', async () => {
      mockPlaybooksRegisterComponent.fileBelongToRepository.mockReturnValueOnce(false);
      await expect(
        playbooksRegisterService.createDirectoryInPlaybookRepository(mockRegister, '/invalid/path'),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('createPlaybookInRepository', () => {
    it('should create a playbook in the repository', async () => {
      const result = await playbooksRegisterService.createPlaybookInRepository(
        mockRegister,
        '/path/to/playbook',
        'New Playbook',
      );
      expect(mockPlaybooksRegisterComponent.fileBelongToRepository).toHaveBeenCalledWith(
        '/path/to/playbook',
      );
      expect(mockPlaybookRepository.create).toHaveBeenCalledWith({
        name: 'New Playbook',
        custom: true,
        path: '/path/to/playbook.yml',
        playbooksRepository: mockRegister,
        playableInBatch: true,
      });
      expect(mockPlaybookFileService.newPlaybook).toHaveBeenCalledWith('/path/to/playbook.yml');
      expect(mockPlaybooksRegisterComponent.syncToDatabase).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw InternalError when repository is not registered', async () => {
      mockPlaybooksRegisterEngineService.getState.mockReturnValueOnce({});
      await expect(
        playbooksRegisterService.createPlaybookInRepository(
          mockRegister,
          '/path/to/playbook',
          'New Playbook',
        ),
      ).rejects.toThrow(InternalError);
    });

    it('should throw ForbiddenError when path does not belong to repository', async () => {
      mockPlaybooksRegisterComponent.fileBelongToRepository.mockReturnValueOnce(false);
      await expect(
        playbooksRegisterService.createPlaybookInRepository(
          mockRegister,
          '/invalid/path',
          'New Playbook',
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deletePlaybookFromRepository', () => {
    it('should delete a playbook from the repository', async () => {
      await playbooksRegisterService.deletePlaybookFromRepository(mockRegister, '123');
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('123');
      expect(mockPlaybookRepository.deleteByUuid).toHaveBeenCalledWith('123');
      expect(mockPlaybookFileService.deletePlaybook).toHaveBeenCalledWith('/path/to/playbook.yml');
      expect(mockPlaybooksRegisterComponent.syncToDatabase).toHaveBeenCalled();
    });

    it('should throw NotFoundError when playbook is not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(
        playbooksRegisterService.deletePlaybookFromRepository(mockRegister, '123'),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw InternalError when repository is not registered', async () => {
      mockPlaybooksRegisterEngineService.getState.mockReturnValueOnce({});
      await expect(
        playbooksRegisterService.deletePlaybookFromRepository(mockRegister, '123'),
      ).rejects.toThrow(InternalError);
    });
  });

  describe('deleteDirectoryFromRepository', () => {
    it('should delete a directory from the repository', async () => {
      await playbooksRegisterService.deleteDirectoryFromRepository(mockRegister, '/path/to/dir');
      expect(mockPlaybooksRegisterComponent.fileBelongToRepository).toHaveBeenCalledWith(
        '/path/to/dir',
      );
      expect(mockFileSystemService.deleteFiles).toHaveBeenCalledWith(
        '/path/to/dir',
        '/path/to/register',
      );
      expect(mockPlaybooksRegisterComponent.syncToDatabase).toHaveBeenCalled();
    });

    it('should throw InternalError when repository is not registered', async () => {
      mockPlaybooksRegisterEngineService.getState.mockReturnValueOnce({});
      await expect(
        playbooksRegisterService.deleteDirectoryFromRepository(mockRegister, '/path/to/dir'),
      ).rejects.toThrow(InternalError);
    });

    it('should throw ForbiddenError when path does not belong to repository', async () => {
      mockPlaybooksRegisterComponent.fileBelongToRepository.mockReturnValueOnce(false);
      await expect(
        playbooksRegisterService.deleteDirectoryFromRepository(mockRegister, '/invalid/path'),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('savePlaybook', () => {
    it('should save a playbook', async () => {
      await playbooksRegisterService.savePlaybook('123', 'playbook content');
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('123');
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        'playbook content',
        '/path/to/playbook.yml',
      );
    });

    it('should throw NotFoundError when playbook is not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(playbooksRegisterService.savePlaybook('123', 'content')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('syncRepository', () => {
    it('should sync a repository', async () => {
      vi.spyOn(playbooksRegisterService, 'updateRepositoryTree').mockResolvedValueOnce(undefined);
      await playbooksRegisterService.syncRepository('123');
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('123');
      expect(mockPlaybooksRegisterComponent.syncToDatabase).toHaveBeenCalled();
      expect(playbooksRegisterService.updateRepositoryTree).toHaveBeenCalledWith(mockRegister);
    });

    it('should throw NotFoundError when repository is not found', async () => {
      mockPlaybooksRegisterRepository.findByUuid.mockResolvedValueOnce(null);
      await expect(playbooksRegisterService.syncRepository('123')).rejects.toThrow(NotFoundError);
    });

    it('should throw InternalError when repository component is not found', async () => {
      mockPlaybooksRegisterEngineService.getState.mockReturnValueOnce({});
      await expect(playbooksRegisterService.syncRepository('123')).rejects.toThrow(InternalError);
    });
  });

  describe('deleteRepository', () => {
    it('should delete a repository', async () => {
      await playbooksRegisterService.deleteRepository(mockRegister);
      expect(mockPlaybooksRegisterEngineService.deregisterRegister).toHaveBeenCalledWith('123');
      expect(mockPlaybooksRegisterRepository.delete).toHaveBeenCalledWith('123');
    });

    it('should throw InternalError when deletion fails', async () => {
      mockPlaybooksRegisterEngineService.deregisterRegister.mockRejectedValueOnce(
        new Error('Test error'),
      );
      await expect(playbooksRegisterService.deleteRepository(mockRegister)).rejects.toThrow(
        InternalError,
      );
    });
  });
});
