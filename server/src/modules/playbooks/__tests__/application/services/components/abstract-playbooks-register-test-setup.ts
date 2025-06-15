import { vi } from 'vitest';

// Mock the infrastructure exceptions
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

// Mock directory-tree from infrastructure
vi.mock('@infrastructure/common/directory-tree/directory-tree.util', () => ({
  directoryTree: vi.fn().mockImplementation(() => ({
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
}));

// Mock the infrastructure exceptions
vi.mock('@infrastructure/exceptions/app-exceptions', () => ({
  EntityNotFoundException: EntityNotFoundException,
}));

// Mock the recursive tree flattening
vi.mock('../../../../utils/tree-utils', () => ({
  recursivelyFlattenTree: vi.fn().mockImplementation((tree) => {
    return [
      { name: 'test_playbook', path: '/test/path/test_playbook.yml', extension: '.yml' },
      { name: 'another_playbook', path: '/test/path/another_playbook.yml', extension: '.yml' },
    ];
  }),
}));

// Mock config values
vi.mock('src/config', () => ({
  SSM_DATA_PATH: '/data',
}));

// Mock FileSystemService, PlaybookFileService from @modules/shell
vi.mock('@modules/shell', () => ({
  FileSystemService: vi.fn(),
  PlaybookFileService: vi.fn(),
}));

// Mock IPlaybooksRegister interface
export interface IPlaybooksRegister {
  uuid: string;
  name: string;
  type: string;
  enabled: boolean;
  directory?: string;
  tree?: any;
}

// Mock IPlaybook interface
export interface IPlaybook {
  uuid?: string;
  name: string;
  path: string;
  custom?: boolean;
  playbooksRepository?: IPlaybooksRegister;
  playableInBatch?: boolean;
  extraVars?: any[];
  uniqueQuickRef?: boolean;
  extension?: string;
}

// Mock ITreeNodeService interface
export interface ITreeNodeService {
  recursivelyFlattenTree: (tree: any) => any[];
}

// Mock FileSystemService
export const mockFileSystemService = {
  deleteFiles: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
};

// Mock PlaybookFileService
export const mockPlaybookFileService = {
  readConfigIfExists: vi.fn().mockResolvedValue(null),
};

// Mock PlaybookRepository
export const mockPlaybookRepository = {
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

// Mock PlaybooksRegisterRepository
export const mockPlaybooksRegisterRepository = {
  findByUuid: vi.fn().mockResolvedValue({
    uuid: 'test-uuid',
    name: 'Test Repository',
    type: 'local',
    enabled: true,
    directory: '/test/path',
  }),
  update: vi.fn().mockResolvedValue({}),
};

// Mock TreeNodeService
export const mockTreeNodeService = {
  recursivelyFlattenTree: vi.fn().mockImplementation((tree) => {
    return [
      { name: 'test_playbook', path: '/test/path/test_playbook.yml', extension: '.yml' },
      { name: 'another_playbook', path: '/test/path/another_playbook.yml', extension: '.yml' },
    ];
  }),
};

// Mock EventEmitter
export const mockEventEmitter = {
  emit: vi.fn(),
};

// Create mock logger
export const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

// We'll directly mock the Logger methods in the component implementation
