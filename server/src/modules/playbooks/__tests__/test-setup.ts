import { vi } from 'vitest';

// Mock NestJS common
vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    Logger: class Logger {
      static log = vi.fn();
      static error = vi.fn();
      static warn = vi.fn();
      static debug = vi.fn();
      log = vi.fn();
      error = vi.fn();
      warn = vi.fn();
      debug = vi.fn();
      verbose = vi.fn();
    },
  };
});

// Mock filesystem services
vi.mock('@modules/shell/application/services/playbook-file.service', () => ({
  PlaybookFileService: class MockPlaybookFileService {
    readPlaybook = vi.fn().mockResolvedValue('playbook content');
    newPlaybook = vi.fn().mockResolvedValue(true);
    editPlaybook = vi.fn().mockResolvedValue(true);
    deletePlaybook = vi.fn().mockResolvedValue(true);
    testExistence = vi.fn().mockResolvedValue(true);
    readPlaybookConfiguration = vi.fn().mockResolvedValue({});
  },
}));

vi.mock('@modules/shell/application/services/file-system.service', () => ({
  FileSystemService: class MockFileSystemService {
    readFile = vi.fn().mockResolvedValue('file content');
    writeFile = vi.fn().mockResolvedValue(true);
    makeDirectory = vi.fn().mockResolvedValue(true);
    readDirectory = vi.fn().mockResolvedValue(['file1', 'file2']);
    fileExists = vi.fn().mockResolvedValue(true);
    isDirectory = vi.fn().mockResolvedValue(true);
    getFileStats = vi.fn().mockResolvedValue({
      isDirectory: () => true,
      isFile: () => true,
      size: 100,
      mtime: new Date(),
    });
    readJsonFile = vi.fn().mockResolvedValue({ key: 'value' });
    writeJsonFile = vi.fn().mockResolvedValue(true);
  },
}));

// Mock Git services
vi.mock('@modules/shell/application/services/git.service', () => ({
  GitService: class MockGitService {
    cloneRepository = vi.fn().mockResolvedValue(true);
    checkoutBranch = vi.fn().mockResolvedValue(true);
    pullChanges = vi.fn().mockResolvedValue(true);
    getRemoteUrl = vi.fn().mockResolvedValue('https://github.com/example/repo.git');
    getCurrentBranch = vi.fn().mockResolvedValue('main');
    listBranches = vi.fn().mockResolvedValue(['main', 'develop']);
    validateGitUrl = vi.fn().mockResolvedValue(true);
  },
}));

// Mock infrastructure exceptions
vi.mock('@infrastructure/exceptions/app-exceptions', () => ({
  NotFoundError: class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundError';
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
    }
  },
  ConflictError: class ConflictError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ConflictError';
    }
  },
}));

// Mock tree-node service
vi.mock('@modules/playbooks/application/services/tree-node.service', () => ({
  TreeNodeService: class MockTreeNodeService {
    createTree = vi.fn().mockReturnValue({
      root: {
        name: 'root',
        children: [],
        type: 'directory',
        key: 'root',
        title: 'root',
      },
    });
    addNode = vi.fn();
    findNode = vi.fn().mockReturnValue({
      name: 'node',
      children: [],
      type: 'directory',
      key: 'node',
      title: 'node',
    });
    removeNode = vi.fn();
    walkTree = vi.fn();
  },
}));

// Mock playbooks repository
vi.mock('@modules/playbooks/infrastructure/repositories/playbook.repository', () => ({
  PlaybookRepository: class MockPlaybookRepository {
    find = vi.fn().mockResolvedValue([
      {
        uuid: '12345',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
        repository: 'test-repo',
        type: 'playbook',
      },
    ]);
    findOne = vi.fn().mockResolvedValue({
      uuid: '12345',
      name: 'Test Playbook',
      path: '/path/to/playbook.yml',
      repository: 'test-repo',
      type: 'playbook',
    });
    create = vi.fn().mockResolvedValue({
      uuid: '12345',
      name: 'Test Playbook',
      path: '/path/to/playbook.yml',
      repository: 'test-repo',
      type: 'playbook',
    });
    update = vi.fn().mockResolvedValue({
      uuid: '12345',
      name: 'Test Playbook',
      path: '/path/to/playbook.yml',
      repository: 'test-repo',
      type: 'playbook',
    });
    delete = vi.fn().mockResolvedValue(true);
  },
}));

// Mock playbooks register repository
vi.mock('@modules/playbooks/infrastructure/repositories/playbooks-register.repository', () => ({
  PlaybooksRegisterRepository: class MockPlaybooksRegisterRepository {
    find = vi.fn().mockResolvedValue([
      {
        uuid: '67890',
        name: 'Test Repository',
        url: 'https://github.com/example/repo.git',
        path: '/path/to/repo',
        type: 'git',
        active: true,
      },
    ]);
    findOne = vi.fn().mockResolvedValue({
      uuid: '67890',
      name: 'Test Repository',
      url: 'https://github.com/example/repo.git',
      path: '/path/to/repo',
      type: 'git',
      active: true,
    });
    create = vi.fn().mockResolvedValue({
      uuid: '67890',
      name: 'Test Repository',
      url: 'https://github.com/example/repo.git',
      path: '/path/to/repo',
      type: 'git',
      active: true,
    });
    update = vi.fn().mockResolvedValue({
      uuid: '67890',
      name: 'Test Repository',
      url: 'https://github.com/example/repo.git',
      path: '/path/to/repo',
      type: 'git',
      active: true,
    });
    delete = vi.fn().mockResolvedValue(true);
  },
}));

// Mock module imports
vi.mock('@modules/shell', () => ({
  ShellModule: class MockShellModule {},
  FileSystemService: class MockFileSystemService {
    readFile = vi.fn().mockResolvedValue('file content');
    writeFile = vi.fn().mockResolvedValue(true);
    makeDirectory = vi.fn().mockResolvedValue(true);
    readDirectory = vi.fn().mockResolvedValue(['file1', 'file2']);
    fileExists = vi.fn().mockResolvedValue(true);
    isDirectory = vi.fn().mockResolvedValue(true);
  },
  PlaybookFileService: class MockPlaybookFileService {
    readPlaybook = vi.fn().mockResolvedValue('playbook content');
    newPlaybook = vi.fn().mockResolvedValue(true);
    editPlaybook = vi.fn().mockResolvedValue(true);
    deletePlaybook = vi.fn().mockResolvedValue(true);
  },
  GitService: class MockGitService {
    cloneRepository = vi.fn().mockResolvedValue(true);
    checkoutBranch = vi.fn().mockResolvedValue(true);
    pullChanges = vi.fn().mockResolvedValue(true);
  },
}));

vi.mock('@modules/ansible', () => ({
  AnsibleModule: class MockAnsibleModule {},
}));

vi.mock('@modules/events', () => ({
  EventsModule: class MockEventsModule {},
  EventEmitterService: class MockEventEmitterService {
    emit = vi.fn();
    on = vi.fn();
  },
}));

// Mock utils
vi.mock('../../utils/tree-utils', () => ({
  createTree: vi.fn().mockReturnValue({
    root: {
      name: 'root',
      children: [],
      type: 'directory',
      key: 'root',
      title: 'root',
    },
  }),
  findNode: vi.fn().mockReturnValue({
    name: 'node',
    children: [],
    type: 'directory',
    key: 'node',
    title: 'node',
  }),
  addNode: vi.fn(),
  removeNode: vi.fn(),
  walkTree: vi.fn(),
}));

// Mock playbooks specific interfaces
vi.mock('@modules/playbooks/domain/interfaces/tree-node-service.interface', () => ({
  ITreeNodeService: Symbol('ITreeNodeService'),
}));

vi.mock('@modules/playbooks/domain/interfaces/playbooks-service.interface', () => ({
  IPlaybooksService: Symbol('IPlaybooksService'),
}));

vi.mock('@modules/playbooks/domain/interfaces/playbooks-register-engine-service.interface', () => ({
  IPlaybooksRegisterEngineService: Symbol('IPlaybooksRegisterEngineService'),
}));

// Mock componenent services
vi.mock('@modules/playbooks/application/services/components/abstract-playbooks-register.component', () => ({
  AbstractPlaybooksRegisterComponent: class MockAbstractPlaybooksRegisterComponent {
    constructor() {}
    init = vi.fn().mockResolvedValue(true);
    sync = vi.fn().mockResolvedValue(true);
    getFiles = vi.fn().mockResolvedValue(['file1', 'file2']);
    getFileTree = vi.fn().mockResolvedValue({
      root: {
        name: 'root',
        children: [],
        type: 'directory',
        key: 'root',
        title: 'root',
      },
    });
    getFileContent = vi.fn().mockResolvedValue('file content');
    writeFileContent = vi.fn().mockResolvedValue(true);
    deleteFile = vi.fn().mockResolvedValue(true);
    createDirectory = vi.fn().mockResolvedValue(true);
    fileExists = vi.fn().mockResolvedValue(true);
  },
}));

vi.mock('@modules/playbooks', () => ({
  PlaybooksModule: class MockPlaybooksModule {},
}));