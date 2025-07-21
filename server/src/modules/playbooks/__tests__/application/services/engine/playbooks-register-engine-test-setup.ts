import { vi } from 'vitest';

// Mock SsmGit from ssm-shared-lib
export const SsmGit = {
  Services: {
    Github: 'github',
    Gitlab: 'gitlab',
    Gitea: 'gitea',
  },
};

// Define constant for repository provider token
export const PLAYBOOKS_REGISTER_REPOSITORY = 'PLAYBOOKS_REGISTER_REPOSITORY';

// Mock interfaces
export interface IPlaybooksRegister {
  uuid: string;
  name: string;
  type: string;
  enabled: boolean;
  directory?: string;
  remoteUrl?: string;
  branch?: string;
  userName?: string;
  accessToken?: string;
  email?: string;
  gitService?: SsmGit.Services;
}

export interface IPlaybooksRegisterComponent {
  init(): Promise<void>;
  delete(): Promise<void>;
  syncToDatabase(): Promise<any>;
  updateDirectoriesTree(): Promise<void>;
}

// Mock PlaybooksRegisterComponent implementations
export class MockLocalComponent implements IPlaybooksRegisterComponent {
  init = vi.fn().mockResolvedValue(undefined);
  delete = vi.fn().mockResolvedValue(undefined);
  syncToDatabase = vi.fn().mockResolvedValue(3);
  updateDirectoriesTree = vi.fn().mockResolvedValue(undefined);
}

export class MockGitComponent implements IPlaybooksRegisterComponent {
  init = vi.fn().mockResolvedValue(undefined);
  delete = vi.fn().mockResolvedValue(undefined);
  syncToDatabase = vi.fn().mockResolvedValue(5);
  updateDirectoriesTree = vi.fn().mockResolvedValue(undefined);
}

// Mock repository access
export const mockPlaybooksRegisterRepository = {
  findByUuid: vi.fn().mockImplementation((uuid) => {
    if (uuid === 'local-123') {
      return Promise.resolve(mockLocalRegister);
    }
    if (uuid === 'git-123') {
      return Promise.resolve(mockGitRegister);
    }
    return Promise.resolve(null);
  }),
};

// Sample registers
export const mockLocalRegister: IPlaybooksRegister = {
  uuid: 'local-123',
  name: 'Local Repository',
  type: 'local',
  enabled: true,
  directory: '/path/to/local',
};

export const mockGitRegister: IPlaybooksRegister = {
  uuid: 'git-123',
  name: 'Git Repository',
  type: 'git',
  enabled: true,
  remoteUrl: 'https://github.com/example/repo.git',
  branch: 'main',
  userName: 'user',
  accessToken: 'token',
  email: 'user@example.com',
  gitService: SsmGit.Services.Github,
  directory: '/path/to/git',
};

// Mock component factory
export const mockLocalComponent = new MockLocalComponent();
export const mockGitComponent = new MockGitComponent();

export const mockPlaybooksRegisterComponentFactory = {
  createGitComponent: vi.fn().mockResolvedValue(mockGitComponent),
  createLocalComponent: vi.fn().mockResolvedValue(mockLocalComponent),
};

// Mock PlaybooksRegisterEngineService
export class MockPlaybooksRegisterEngineService {
  private components: Record<string, IPlaybooksRegisterComponent> = {};

  constructor(
    private readonly playbooksRegisterComponentFactory: typeof mockPlaybooksRegisterComponentFactory,
    private readonly playbooksRegisterRepository: typeof mockPlaybooksRegisterRepository,
  ) {}

  async registerRegister(register: IPlaybooksRegister): Promise<void> {
    const { uuid } = register;

    // Skip if already registered
    if (this.components[uuid]) {
      return;
    }

    try {
      let component: IPlaybooksRegisterComponent;

      if (register.type === 'git') {
        component = await this.playbooksRegisterComponentFactory.createGitComponent({
          uuid: register.uuid,
          name: register.name,
          branch: register.branch,
          email: register.email,
          gitUserName: register.userName,
          accessToken: register.accessToken,
          remoteUrl: register.remoteUrl,
          gitService: register.gitService,
          ignoreSSLErrors: false,
        });
      } else if (register.type === 'local') {
        component = await this.playbooksRegisterComponentFactory.createLocalComponent({
          uuid: register.uuid,
          name: register.name,
          directory: register.directory,
        });
      } else {
        throw new Error(`Unknown register type: ${register.type}`);
      }

      await component.init();
      this.components[uuid] = component;
    } catch (error: any) {
      throw new Error(`Failed to register repository: ${error.message}`);
    }
  }

  async deregisterRegister(uuid: string): Promise<void> {
    const component = this.components[uuid];
    if (!component) {
      return;
    }

    try {
      await component.delete();
      delete this.components[uuid];
    } catch (error: any) {
      throw new Error(`Failed to deregister repository: ${error.message}`);
    }
  }

  getRepository(uuid: string): IPlaybooksRegisterComponent | undefined {
    return this.components[uuid];
  }

  getState(): Record<string, IPlaybooksRegisterComponent> {
    return this.components;
  }
}

// Mock all imported modules
vi.mock('@modules/playbooks/domain/interfaces/tree-node-service.interface', () => ({
  ITreeNodeService: vi.fn(),
}));

vi.mock('@modules/playbooks/domain/repositories/playbooks-register-repository.interface', () => ({
  PLAYBOOKS_REGISTER_REPOSITORY: PLAYBOOKS_REGISTER_REPOSITORY,
  IPlaybooksRegisterRepository: vi.fn(),
}));
