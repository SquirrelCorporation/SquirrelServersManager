import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlaybooksRegisterComponent from '../../../../application/services/components/abstract-playbooks-register.component';
import { FileSystemService, PlaybookFileService } from '@modules/shell';
import { PlaybookRepository } from '../../../../infrastructure/repositories/playbook.repository';
import { PlaybooksRegisterRepository } from '../../../../infrastructure/repositories/playbooks-register.repository';
import { IPlaybooksRegister } from '../../../../domain/entities/playbooks-register.entity';
import { NotFoundError } from '../../../../../../middlewares/api/ApiError';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

// Mock the recursive tree flattening
vi.mock('../../../../utils/tree-utils', () => ({
  recursivelyFlattenTree: vi.fn().mockImplementation((tree) => {
    return [
      { name: 'test_playbook', path: '/test/path/test_playbook.yml', extension: '.yml' },
      { name: 'another_playbook', path: '/test/path/another_playbook.yml', extension: '.yml' },
    ];
  }),
}));

// Mock the directory-tree helper
vi.mock('src/helpers/directory-tree/directory-tree', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      path: '/test/path',
      name: 'path',
      children: [
        {
          path: '/test/path/test_playbook.yml',
          name: 'test_playbook',
          extension: '.yml',
        },
        {
          path: '/test/path/another_playbook.yml',
          name: 'another_playbook',
          extension: '.yml',
        },
      ],
    })),
  };
});

// Create a concrete implementation of the abstract class for testing
class TestPlaybooksRegisterComponent extends PlaybooksRegisterComponent {
  constructor(
    fileSystemService: FileSystemService,
    playbookFileService: PlaybookFileService,
    playbookRepository: PlaybookRepository,
    playbooksRegisterRepository: PlaybooksRegisterRepository,
    eventEmitter: EventEmitter2,
    uuid: string,
    loggerClass: any,
    name: string,
    rootPath: string
  ) {
    super(
      fileSystemService,
      playbookFileService,
      playbookRepository,
      playbooksRegisterRepository,
      uuid,
      name,
      rootPath
    );
    this.childLogger = new loggerClass(TestPlaybooksRegisterComponent.name);
  }

  public async init(): Promise<void> {
    // Implementation for testing
    return Promise.resolve();
  }
}

describe('PlaybooksRegisterComponent', () => {
  let component: TestPlaybooksRegisterComponent;
  let mockFileSystemService: any;
  let mockPlaybookFileService: any;
  let mockPlaybookRepository: any;
  let mockPlaybooksRegisterRepository: any;
  let mockEventEmitter: any;
  let mockRegister: IPlaybooksRegister;

  beforeEach(() => {
    mockRegister = {
      uuid: 'test-uuid',
      name: 'Test Repository',
      type: 'local',
      enabled: true,
      directory: '/test/path',
    };

    mockFileSystemService = {
      deleteFiles: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybookFileService = {
      readConfigIfExists: vi.fn().mockResolvedValue(null),
    };

    mockPlaybookRepository = {
      findOneByUuid: vi.fn().mockResolvedValue({
        uuid: 'playbook-uuid',
        path: '/test/path/test_playbook.yml',
        name: 'test_playbook',
      }),
      findOneByPath: vi.fn().mockResolvedValue({
        uuid: 'playbook-uuid',
        path: '/test/path/test_playbook.yml',
        name: 'test_playbook',
      }),
      updateOrCreate: vi.fn().mockResolvedValue({}),
      listAllByRepository: vi.fn().mockResolvedValue([
        {
          uuid: 'playbook-uuid',
          path: '/test/path/test_playbook.yml',
          name: 'test_playbook',
        },
        {
          uuid: 'removed-playbook-uuid',
          path: '/test/path/removed_playbook.yml',
          name: 'removed_playbook',
        },
      ]),
      deleteByUuid: vi.fn().mockResolvedValue({}),
    };

    mockPlaybooksRegisterRepository = {
      findByUuid: vi.fn().mockResolvedValue(mockRegister),
      update: vi.fn().mockResolvedValue({}),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    component = new TestPlaybooksRegisterComponent(
      mockFileSystemService,
      mockPlaybookFileService,
      mockPlaybookRepository,
      mockPlaybooksRegisterRepository,
      mockEventEmitter,
      'test-uuid',
      Logger,
      'Test Repository',
      '/test/path'
    );
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  describe('delete', () => {
    it('should delete the component directory', async () => {
      await component.delete();
      expect(mockFileSystemService.deleteFiles).toHaveBeenCalledWith('/test/path/test-uuid');
    });
  });

  describe('save', () => {
    it('should save playbook content', async () => {
      await component.save('playbook-uuid', 'playbook content');
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        '/test/path/test_playbook.yml',
        'playbook content'
      );
    });

    it('should throw NotFoundError when playbook is not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(component.save('nonexistent-uuid', 'content')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('syncToDatabase', () => {
    it('should sync playbooks from file system to database', async () => {
      await component.syncToDatabase();
      
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('test-uuid');
      expect(mockPlaybookRepository.listAllByRepository).toHaveBeenCalledWith(mockRegister);
      expect(mockPlaybookRepository.deleteByUuid).toHaveBeenCalledWith('removed-playbook-uuid');
      expect(mockPlaybookRepository.updateOrCreate).toHaveBeenCalledTimes(2);
    });

    it('should handle playbook configuration files', async () => {
      mockPlaybookFileService.readConfigIfExists.mockResolvedValueOnce(
        JSON.stringify({
          playableInBatch: true,
          extraVars: [{ name: 'test_var', value: 'test_value' }],
          uniqueQuickRef: true,
        })
      );
      
      await component.syncToDatabase();
      
      expect(mockPlaybookFileService.readConfigIfExists).toHaveBeenCalledWith(
        '/test/path/test_playbook.json'
      );
      expect(mockPlaybookRepository.updateOrCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          playableInBatch: true,
          extraVars: [{ name: 'test_var', value: 'test_value' }],
          uniqueQuickRef: true,
        })
      );
    });

    it('should handle errors parsing playbook configuration', async () => {
      mockPlaybookFileService.readConfigIfExists.mockResolvedValueOnce('invalid json');
      
      await component.syncToDatabase();
      
      // Should not fail and still update the playbook
      expect(mockPlaybookRepository.updateOrCreate).toHaveBeenCalled();
    });
  });

  describe('updateDirectoriesTree', () => {
    it('should update the directory tree and save to database', async () => {
      const result = await component.updateDirectoriesTree();
      
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('test-uuid');
      expect(mockPlaybooksRegisterRepository.update).toHaveBeenCalledWith(
        'test-uuid',
        expect.objectContaining({
          tree: expect.objectContaining({
            path: '/test/path',
          }),
        })
      );
      expect(result).toBeDefined();
    });
  });

  describe('fileBelongToRepository', () => {
    it('should check if a file belongs to the repository', () => {
      component.directory = '/test/path/test-uuid';
      
      expect(component.fileBelongToRepository('/test/path/file.yml')).toBe(true);
      expect(component.fileBelongToRepository('/other/path/file.yml')).toBe(false);
    });
  });

  describe('getDirectory', () => {
    it('should return the component directory', () => {
      expect(component.getDirectory()).toBe('/test/path/test-uuid');
    });
  });
});