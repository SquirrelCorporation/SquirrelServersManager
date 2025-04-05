import { SsmGit } from 'ssm-shared-lib';
import { vi } from 'vitest';

// Define error class for tests
export class InternalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InternalError';
  }
}

// Define constants
export const DIRECTORY_ROOT = '/playbooks';
export const EVENTS = {
  ALERT: 'alert',
};

// Create a mock abstract component
export class AbstractPlaybooksRegisterComponent {
  protected directory: string;
  protected childLogger: any;

  constructor(
    protected readonly fileSystemService: any,
    protected readonly playbookFileService: any,
    protected readonly playbookRepository: any,
    protected readonly playbooksRegisterRepository: any,
    protected readonly treeNodeService: any,
    protected readonly uuid: string,
    protected readonly name: string,
    directoryRoot: string,
  ) {
    this.directory = `${directoryRoot}/${uuid}`;
  }

  async syncToDatabase(): Promise<number> {
    return 5;
  }
}

// Create mock services for git operations
export const mockGitServices = {
  clone: vi.fn().mockResolvedValue(undefined),
  forcePull: vi.fn().mockResolvedValue(undefined),
  commitAndSync: vi.fn().mockResolvedValue(undefined),
};

// Create mock GitPlaybooksRegisterComponent class that extends the abstract component
export class MockGitPlaybooksRegisterComponent extends AbstractPlaybooksRegisterComponent {
  private readonly logger: any = {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  };
  private readonly options: any;

  constructor(
    fileSystemService: any,
    playbookFileService: any,
    playbookRepository: any,
    playbooksRegisterRepository: any,
    private readonly eventEmitter: any,
    uuid: string,
    logger: any,
    name: string,
    branch: string,
    email: string,
    gitUserName: string,
    accessToken: string,
    remoteUrl: string,
    gitService: SsmGit.Services,
    ignoreSSLErrors: boolean,
  ) {
    super(
      fileSystemService,
      playbookFileService,
      playbookRepository,
      playbooksRegisterRepository,
      {
        /* treeNodeService mock */
      },
      uuid,
      name,
      DIRECTORY_ROOT,
    );

    // Configure user information
    const userInfo = {
      email: email,
      gitUserName: gitUserName,
      branch: branch,
      accessToken: accessToken,
      gitService: gitService,
      env: ignoreSSLErrors
        ? {
            GIT_SSL_NO_VERIFY: 'true',
          }
        : undefined,
    };

    // Set git options
    this.options = {
      dir: this.directory,
      syncImmediately: true,
      userInfo: userInfo,
      remoteUrl: remoteUrl,
    };

    this.childLogger = logger;
  }

  async init(): Promise<void> {
    await this.clone();
  }

  async syncFromRepository(): Promise<void> {
    await this.forcePull();
  }

  async forcePull(): Promise<void> {
    try {
      await mockGitServices.forcePull(this.options);

      this.eventEmitter.emit(EVENTS.ALERT, {
        severity: 'success',
        message: `Successfully forcepull repository ${this.name}`,
        module: 'GitPlaybooksRepositoryComponent',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error force pulling Git repository: ${errorMessage}`);
      throw new InternalError(`Error force pulling Git repository: ${errorMessage}`);
    }
  }

  async clone(syncAfter = false): Promise<void> {
    try {
      // Create directory if needed
      try {
        await this.fileSystemService.createDirectory(this.directory, DIRECTORY_ROOT);
      } catch (error: any) {
        this.childLogger.warn(error);
      }

      await mockGitServices.clone(this.options);

      if (syncAfter) {
        const nbSync = await this.syncToDatabase();

        this.eventEmitter.emit(EVENTS.ALERT, {
          severity: 'success',
          message: `Successfully updated repository ${this.name} with ${nbSync} files`,
          module: 'GitPlaybooksRepositoryComponent',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error cloning Git repository: ${errorMessage}`);
      throw new InternalError(`Error cloning Git repository: ${errorMessage}`);
    }
  }

  async commitAndSync(): Promise<void> {
    try {
      await mockGitServices.commitAndSync(this.options);

      this.eventEmitter.emit(EVENTS.ALERT, {
        severity: 'success',
        message: `Successfully commit and sync repository ${this.name}`,
        module: 'GitPlaybooksRepositoryComponent',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error committing and syncing Git repository: ${errorMessage}`);
      throw new InternalError(`Error committing and syncing Git repository: ${errorMessage}`);
    }
  }
}

// Mock all imported modules
vi.mock('@infrastructure/adapters/git/services/clone.service', () => ({
  clone: mockGitServices.clone,
}));

vi.mock('@infrastructure/adapters/git/services/force-pull.service', () => ({
  forcePull: mockGitServices.forcePull,
}));

vi.mock('@infrastructure/adapters/git/services/commit-and-sync.service', () => ({
  commitAndSync: mockGitServices.commitAndSync,
}));

vi.mock(
  '@modules/playbooks/application/services/components/abstract-playbooks-register.component',
  () => ({
    default: AbstractPlaybooksRegisterComponent,
    DIRECTORY_ROOT: DIRECTORY_ROOT,
  }),
);

vi.mock('@infrastructure/exceptions/app-exceptions', () => ({
  InternalServerException: InternalError,
}));

vi.mock('../../../../../core/events/events', () => ({
  default: EVENTS,
}));

vi.mock('@modules/playbooks', () => ({
  IPlaybookRepository: vi.fn(),
  IPlaybooksRegisterRepository: vi.fn(),
  ITreeNodeService: vi.fn(),
}));

// Export mocked modules
export { mockGitServices as gitServices, EVENTS as Events };
