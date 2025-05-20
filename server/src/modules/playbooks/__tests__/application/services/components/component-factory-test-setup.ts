import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SsmGit } from 'ssm-shared-lib';
import { vi } from 'vitest';

// Mock the tree node service
export const TREE_NODE_SERVICE = 'TREE_NODE_SERVICE';

// Mock interfaces
export interface ITreeNodeService {
  recursivelyFlattenTree: (tree: any) => any[];
}

export interface GitComponentOptions {
  uuid: string;
  name: string;
  branch: string;
  email: string;
  gitUserName: string;
  accessToken: string;
  remoteUrl: string;
  gitService: SsmGit.Services;
  ignoreSSLErrors: boolean;
}

export interface LocalComponentOptions {
  uuid: string;
  name: string;
  directory?: string;
}

// Mock the Abstract Component
export class PlaybooksRegisterComponent {
  public static initializeRepositories = vi.fn();
  public uuid: string;
  public name: string;
  public directory: string;
  public rootPath: string;

  constructor(
    protected readonly fileSystemService: any,
    protected readonly playbookFileService: any,
    protected readonly playbookRepository: any,
    protected readonly playbooksRegisterRepository: any,
    protected readonly treeNodeService: ITreeNodeService,
    uuid: string,
    loggerClass: any,
    name: string,
    rootPath: string,
  ) {
    this.uuid = uuid;
    this.name = name;
    this.directory = `${rootPath}/${uuid}`;
    this.rootPath = rootPath;
  }

  async init(): Promise<void> {
    return Promise.resolve();
  }
}

// Mock the Git Component
export class GitPlaybooksRegisterComponent extends PlaybooksRegisterComponent {
  constructor(
    fileSystemService: any,
    playbookFileService: any,
    playbookRepository: any,
    playbooksRegisterRepository: any,
    eventEmitter: EventEmitter2,
    treeNodeService: ITreeNodeService,
    uuid: string,
    loggerClass: any,
    name: string,
    public branch: string,
    public email: string,
    public gitUserName: string,
    public accessToken: string,
    public remoteUrl: string,
    public gitService: SsmGit.Services,
    public ignoreSSLErrors: boolean,
  ) {
    super(
      fileSystemService,
      playbookFileService,
      playbookRepository,
      playbooksRegisterRepository,
      treeNodeService,
      uuid,
      loggerClass,
      name,
      '/data/playbooks',
    );
  }
}

// Mock the Local Component
export class LocalPlaybooksRegisterComponent extends PlaybooksRegisterComponent {
  constructor(
    fileSystemService: any,
    playbookFileService: any,
    playbookRepository: any,
    playbooksRegisterRepository: any,
    eventEmitter: EventEmitter2,
    treeNodeService: ITreeNodeService,
    uuid: string,
    loggerClass: any,
    name: string,
    rootPath: string,
  ) {
    super(
      fileSystemService,
      playbookFileService,
      playbookRepository,
      playbooksRegisterRepository,
      treeNodeService,
      uuid,
      loggerClass,
      name,
      rootPath || '/data/playbooks',
    );
  }
}

// Create mocks for all dependencies
export const mockFileSystemService = {
  createDirectory: vi.fn(),
  deleteFiles: vi.fn(),
  listFiles: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
};

export const mockPlaybookFileService = {
  newPlaybook: vi.fn(),
  deletePlaybook: vi.fn(),
  readConfigIfExists: vi.fn(),
};

export const mockPlaybookRepository = {
  create: vi.fn(),
  findOneByUuid: vi.fn(),
  deleteByUuid: vi.fn(),
  findOneByPath: vi.fn(),
  updateOrCreate: vi.fn(),
  listAllByRepository: vi.fn(),
};

export const mockPlaybooksRegisterRepository = {
  findByUuid: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

export const mockTreeNodeService = {
  recursivelyFlattenTree: vi.fn().mockImplementation((tree) => {
    return [
      { name: 'test_playbook', path: '/test/path/test_playbook.yml', extension: '.yml' },
      { name: 'another_playbook', path: '/test/path/another_playbook.yml', extension: '.yml' },
    ];
  }),
};

export const mockEventEmitter = {
  emit: vi.fn(),
};

export const mockLogger = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
};

// Create a mock implementation of the PlaybooksRegisterComponentFactory
export const createMockComponentFactory = () => {
  return {
    // Dependencies
    fileSystemService: mockFileSystemService,
    playbookFileService: mockPlaybookFileService,
    playbookRepository: mockPlaybookRepository,
    playbooksRegisterRepository: mockPlaybooksRegisterRepository,
    eventEmitter: mockEventEmitter,
    treeNodeService: mockTreeNodeService,
    logger: mockLogger,

    // Methods
    onModuleInit() {
      PlaybooksRegisterComponent.initializeRepositories(
        this.playbookRepository,
        this.playbooksRegisterRepository,
        this.treeNodeService,
      );
    },

    async createGitComponent(options: GitComponentOptions): Promise<GitPlaybooksRegisterComponent> {
      return new GitPlaybooksRegisterComponent(
        this.fileSystemService,
        this.playbookFileService,
        this.playbookRepository,
        this.playbooksRegisterRepository,
        this.eventEmitter,
        this.treeNodeService,
        options.uuid,
        () => mockLogger, // Pass mock logger
        options.name,
        options.branch,
        options.email,
        options.gitUserName,
        options.accessToken,
        options.remoteUrl,
        options.gitService,
        options.ignoreSSLErrors,
      );
    },

    async createLocalComponent(
      options: LocalComponentOptions,
    ): Promise<LocalPlaybooksRegisterComponent> {
      return new LocalPlaybooksRegisterComponent(
        this.fileSystemService,
        this.playbookFileService,
        this.playbookRepository,
        this.playbooksRegisterRepository,
        this.eventEmitter,
        this.treeNodeService,
        options.uuid,
        () => mockLogger, // Pass mock logger
        options.name,
        options.directory || '/data/playbooks',
      );
    },
  };
};

// Mock the modules we need
vi.mock('src/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@modules/shell', () => ({
  FileSystemService: vi.fn(),
  PlaybookFileService: vi.fn(),
}));

vi.mock('@modules/playbooks/domain/interfaces/tree-node-service.interface', () => ({
  TREE_NODE_SERVICE: 'TREE_NODE_SERVICE',
}));

vi.mock(
  '../../../../application/services/components/abstract-playbooks-register.component',
  () => ({
    default: {
      initializeRepositories: vi.fn(),
    },
  }),
  { virtual: true },
);

vi.mock(
  '../../../../application/services/components/git-playbooks-register.component',
  () => ({
    GitPlaybooksRegisterComponent: GitPlaybooksRegisterComponent,
  }),
  { virtual: true },
);

vi.mock(
  '../../../../application/services/components/local-playbooks-repository.component',
  () => ({
    LocalPlaybooksRegisterComponent: LocalPlaybooksRegisterComponent,
  }),
  { virtual: true },
);

// Mock the Logger
Logger.prototype.log = vi.fn();
Logger.prototype.error = vi.fn();
Logger.prototype.warn = vi.fn();
