import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PlaybooksRegisterService } from '../../../application/services/playbooks-register.service';
import { PLAYBOOKS_REGISTER_REPOSITORY } from '../../../domain/repositories/playbooks-register-repository.interface';
import { PLAYBOOK_REPOSITORY } from '../../../domain/repositories/playbook-repository.interface';
import { PlaybooksRegisterEngineService } from '../../../application/services/engine/playbooks-register-engine.service';
import { FileSystemService, PlaybookFileService } from '@modules/shell';
import { IPlaybooksRegister } from '../../../domain/entities/playbooks-register.entity';
import { InternalError, NotFoundError, ForbiddenError } from '../../../../../middlewares/api/ApiError';

// Mock the tree-utils module
vi.mock('../../../utils/tree-utils', () => ({
  recursiveTreeCompletion: vi.fn().mockImplementation((tree) => {
    return Promise.resolve(tree ? tree : []);
  }),
}));

describe('PlaybooksRegisterService', () => {
  let playbooksRegisterService: PlaybooksRegisterService;
  let mockPlaybooksRegisterRepository: any;
  let mockPlaybookRepository: any;
  let mockPlaybooksRegisterEngineService: any;
  let mockFileSystemService: any;
  let mockPlaybookFileService: any;
  let mockPlaybooksRegisterComponent: any;

  const mockRegister: IPlaybooksRegister = {
    uuid: '123',
    name: 'Test Register',
    type: 'local',
    enabled: true,
    directory: '/path/to/register',
    default: true,
    tree: { path: '/root', name: 'root', type: 'directory', children: [] },
  };

  beforeEach(async () => {
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
      findOneByUuid: vi.fn().mockResolvedValue({ uuid: '123', path: '/path/to/playbook.yml', name: 'Test Playbook' }),
      create: vi.fn().mockResolvedValue({ uuid: '123', path: '/path/to/playbook.yml', name: 'Test Playbook' }),
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

    const moduleRef = await Test.createTestingModule({
      providers: [
        PlaybooksRegisterService,
        {
          provide: PLAYBOOKS_REGISTER_REPOSITORY,
          useValue: mockPlaybooksRegisterRepository,
        },
        {
          provide: PLAYBOOK_REPOSITORY,
          useValue: mockPlaybookRepository,
        },
        {
          provide: PlaybooksRegisterEngineService,
          useValue: mockPlaybooksRegisterEngineService,
        },
        {
          provide: FileSystemService,
          useValue: mockFileSystemService,
        },
        {
          provide: PlaybookFileService,
          useValue: mockPlaybookFileService,
        },
      ],
    }).compile();

    playbooksRegisterService = moduleRef.get<PlaybooksRegisterService>(PlaybooksRegisterService);
  });

  it('should be defined', () => {
    expect(playbooksRegisterService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should register all active repositories on initialization', async () => {
      await playbooksRegisterService.onModuleInit();
      expect(mockPlaybooksRegisterRepository.findAllActive).toHaveBeenCalled();
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalledWith(mockRegister);
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
      await expect(playbooksRegisterService.getAllPlaybooksRepositories()).rejects.toThrow(InternalError);
    });
  });

  describe('createDirectoryInPlaybookRepository', () => {
    it('should create a directory in the repository', async () => {
      await playbooksRegisterService.createDirectoryInPlaybookRepository(mockRegister, '/path/to/newdir');
      expect(mockPlaybooksRegisterComponent.fileBelongToRepository).toHaveBeenCalledWith('/path/to/newdir');
      expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith('/path/to/newdir', '/path/to/register');
      expect(mockPlaybooksRegisterComponent.updateDirectoriesTree).toHaveBeenCalled();
    });

    it('should throw InternalError when repository is not registered', async () => {
      mockPlaybooksRegisterEngineService.getState.mockReturnValueOnce({});
      await expect(
        playbooksRegisterService.createDirectoryInPlaybookRepository(mockRegister, '/path/to/newdir')
      ).rejects.toThrow(InternalError);
    });

    it('should throw ForbiddenError when path does not belong to repository', async () => {
      mockPlaybooksRegisterComponent.fileBelongToRepository.mockReturnValueOnce(false);
      await expect(
        playbooksRegisterService.createDirectoryInPlaybookRepository(mockRegister, '/invalid/path')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('createPlaybookInRepository', () => {
    it('should create a playbook in the repository', async () => {
      const result = await playbooksRegisterService.createPlaybookInRepository(mockRegister, '/path/to/playbook', 'New Playbook');
      expect(mockPlaybooksRegisterComponent.fileBelongToRepository).toHaveBeenCalledWith('/path/to/playbook');
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
        playbooksRegisterService.createPlaybookInRepository(mockRegister, '/path/to/playbook', 'New Playbook')
      ).rejects.toThrow(InternalError);
    });

    it('should throw ForbiddenError when path does not belong to repository', async () => {
      mockPlaybooksRegisterComponent.fileBelongToRepository.mockReturnValueOnce(false);
      await expect(
        playbooksRegisterService.createPlaybookInRepository(mockRegister, '/invalid/path', 'New Playbook')
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
      await expect(playbooksRegisterService.deletePlaybookFromRepository(mockRegister, '123')).rejects.toThrow(NotFoundError);
    });

    it('should throw InternalError when repository is not registered', async () => {
      mockPlaybooksRegisterEngineService.getState.mockReturnValueOnce({});
      await expect(playbooksRegisterService.deletePlaybookFromRepository(mockRegister, '123')).rejects.toThrow(InternalError);
    });
  });

  describe('deleteDirectoryFromRepository', () => {
    it('should delete a directory from the repository', async () => {
      await playbooksRegisterService.deleteDirectoryFromRepository(mockRegister, '/path/to/dir');
      expect(mockPlaybooksRegisterComponent.fileBelongToRepository).toHaveBeenCalledWith('/path/to/dir');
      expect(mockFileSystemService.deleteFiles).toHaveBeenCalledWith('/path/to/dir', '/path/to/register');
      expect(mockPlaybooksRegisterComponent.syncToDatabase).toHaveBeenCalled();
    });

    it('should throw InternalError when repository is not registered', async () => {
      mockPlaybooksRegisterEngineService.getState.mockReturnValueOnce({});
      await expect(playbooksRegisterService.deleteDirectoryFromRepository(mockRegister, '/path/to/dir')).rejects.toThrow(InternalError);
    });

    it('should throw ForbiddenError when path does not belong to repository', async () => {
      mockPlaybooksRegisterComponent.fileBelongToRepository.mockReturnValueOnce(false);
      await expect(playbooksRegisterService.deleteDirectoryFromRepository(mockRegister, '/invalid/path')).rejects.toThrow(ForbiddenError);
    });
  });

  describe('savePlaybook', () => {
    it('should save a playbook', async () => {
      await playbooksRegisterService.savePlaybook('123', 'playbook content');
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('123');
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith('playbook content', '/path/to/playbook.yml');
    });

    it('should throw NotFoundError when playbook is not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(playbooksRegisterService.savePlaybook('123', 'content')).rejects.toThrow(NotFoundError);
    });
  });

  describe('syncRepository', () => {
    it('should sync a repository', async () => {
      await playbooksRegisterService.syncRepository('123');
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('123');
      expect(mockPlaybooksRegisterComponent.syncToDatabase).toHaveBeenCalled();
      expect(mockPlaybooksRegisterComponent.updateDirectoriesTree).toHaveBeenCalled();
      expect(mockPlaybooksRegisterRepository.update).toHaveBeenCalledWith('123', mockRegister);
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
      mockPlaybooksRegisterEngineService.deregisterRegister.mockRejectedValueOnce(new Error('Test error'));
      await expect(playbooksRegisterService.deleteRepository(mockRegister)).rejects.toThrow(InternalError);
    });
  });
});