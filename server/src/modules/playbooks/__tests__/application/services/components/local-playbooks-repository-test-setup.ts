import { vi } from 'vitest';

// Define constants
export const DIRECTORY_ROOT = '/playbooks';
export const EVENTS = {
  ALERT: 'alert',
};

// Create a mock abstract component
export class AbstractPlaybooksRegisterComponent {
  protected directory: string;
  protected childLogger: any;

  // Make some properties public for test access
  public name: string;
  public uuid: string;
  public rootPath: string;

  constructor(
    protected readonly fileSystemService: any,
    protected readonly playbookFileService: any,
    protected readonly playbookRepository: any,
    protected readonly playbooksRegisterRepository: any,
    protected readonly treeNodeService: any,
    uuid: string,
    name: string,
    directoryRoot: string,
  ) {
    this.directory = `${directoryRoot}/${uuid}`;
    this.name = name;
    this.uuid = uuid;
    this.rootPath = directoryRoot;
  }

  async syncToDatabase(): Promise<number> {
    return 3;
  }
}

// Create mock LocalPlaybooksRegisterComponent class
export class MockLocalPlaybooksRegisterComponent extends AbstractPlaybooksRegisterComponent {
  constructor(
    fileSystemService: any,
    playbookFileService: any,
    playbookRepository: any,
    playbooksRegisterRepository: any,
    private readonly eventEmitter: any,
    uuid: string,
    logger: any,
    name: string,
    directoryRoot: string,
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
      directoryRoot,
    );

    this.childLogger = logger;
  }

  async init(): Promise<void> {
    await this.fileSystemService.createDirectory(this.directory);
  }

  async syncFromRepository(): Promise<void> {
    await this.syncToDatabase();
  }
}

// Mock all imported modules
vi.mock(
  '@modules/playbooks/application/services/components/abstract-playbooks-register.component',
  () => ({
    default: AbstractPlaybooksRegisterComponent,
    DIRECTORY_ROOT: DIRECTORY_ROOT,
  }),
);

vi.mock('@modules/playbooks', () => ({
  IPlaybookRepository: vi.fn(),
  IPlaybooksRegisterRepository: vi.fn(),
  ITreeNodeService: vi.fn(),
}));
