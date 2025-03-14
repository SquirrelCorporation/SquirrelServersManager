import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileSystemService, PlaybookFileService } from '@modules/shell';
import { PlaybooksRegisterComponentFactory } from '../../../../application/services/components/component-factory.service';
import { PlaybookRepository } from '../../../../infrastructure/repositories/playbook.repository';
import { PlaybooksRegisterRepository } from '../../../../infrastructure/repositories/playbooks-register.repository';
import { GitPlaybooksRegisterComponent } from '../../../../application/services/components/git-playbooks-register.component';
import { LocalPlaybooksRegisterComponent } from '../../../../application/services/components/local-playbooks-repository.component';
import PlaybooksRegisterComponent from '../../../../application/services/components/abstract-playbooks-register.component';
import { SsmGit } from 'ssm-shared-lib';

// Mock the Abstract Component's static initialization
vi.mock('../../../../application/services/components/abstract-playbooks-register.component', () => {
  return {
    default: {
      initializeRepositories: vi.fn(),
    },
  };
});

describe('PlaybooksRegisterComponentFactory', () => {
  let factory: PlaybooksRegisterComponentFactory;
  let mockFileSystemService: any;
  let mockPlaybookFileService: any;
  let mockPlaybookRepository: any;
  let mockPlaybooksRegisterRepository: any;
  let mockEventEmitter: any;

  beforeEach(async () => {
    mockFileSystemService = {
      createDirectory: vi.fn(),
      deleteFiles: vi.fn(),
      listFiles: vi.fn(),
      readFile: vi.fn(),
      writeFile: vi.fn(),
    };

    mockPlaybookFileService = {
      newPlaybook: vi.fn(),
      deletePlaybook: vi.fn(),
    };

    mockPlaybookRepository = {
      create: vi.fn(),
      findOneByUuid: vi.fn(),
      deleteByUuid: vi.fn(),
      findOneByPath: vi.fn(),
    };

    mockPlaybooksRegisterRepository = {
      findByUuid: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockEventEmitter = {
      emit: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PlaybooksRegisterComponentFactory,
        {
          provide: FileSystemService,
          useValue: mockFileSystemService,
        },
        {
          provide: PlaybookFileService,
          useValue: mockPlaybookFileService,
        },
        {
          provide: PlaybookRepository,
          useValue: mockPlaybookRepository,
        },
        {
          provide: PlaybooksRegisterRepository,
          useValue: mockPlaybooksRegisterRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    factory = moduleRef.get<PlaybooksRegisterComponentFactory>(PlaybooksRegisterComponentFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize repositories in the abstract component', () => {
      factory.onModuleInit();
      
      expect(PlaybooksRegisterComponent.initializeRepositories).toHaveBeenCalledWith(
        mockPlaybookRepository,
        mockPlaybooksRegisterRepository
      );
    });
  });

  describe('createGitComponent', () => {
    it('should create a new GitPlaybooksRegisterComponent with correct parameters', async () => {
      const options = {
        uuid: 'git-123',
        name: 'Git Repository',
        branch: 'main',
        email: 'user@example.com',
        gitUserName: 'user',
        accessToken: 'token',
        remoteUrl: 'https://github.com/example/repo.git',
        gitService: SsmGit.Services.Github,
        ignoreSSLErrors: false,
      };

      const component = await factory.createGitComponent(options);
      
      expect(component).toBeInstanceOf(GitPlaybooksRegisterComponent);
      expect(component.name).toBe('Git Repository');
      expect(component.uuid).toBe('git-123');
    });
  });

  describe('createLocalComponent', () => {
    it('should create a new LocalPlaybooksRegisterComponent with correct parameters', async () => {
      const options = {
        uuid: 'local-123',
        name: 'Local Repository',
        directory: '/path/to/local',
      };

      const component = await factory.createLocalComponent(options);
      
      expect(component).toBeInstanceOf(LocalPlaybooksRegisterComponent);
      expect(component.name).toBe('Local Repository');
      expect(component.uuid).toBe('local-123');
    });

    it('should use uuid as directory if directory is not provided', async () => {
      const options = {
        uuid: 'local-123',
        name: 'Local Repository',
      };

      const component = await factory.createLocalComponent(options);
      
      expect(component).toBeInstanceOf(LocalPlaybooksRegisterComponent);
      expect(component.rootPath).toContain('local-123');
    });
  });
});