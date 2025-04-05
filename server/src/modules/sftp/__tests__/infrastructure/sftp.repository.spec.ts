import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SftpRepository } from './mock-sftp.repository';

// Create mock SFTP
const mockSftp = {
  readdir: vi.fn(),
  mkdir: vi.fn(),
  rename: vi.fn(),
  chmod: vi.fn(),
  rmdir: vi.fn(),
  unlink: vi.fn(),
  stat: vi.fn(),
  fastGet: vi.fn(),
  end: vi.fn(),
};

// Create mocks
const mockSshConnectionService = {
  createConnection: vi.fn(),
  closeConnection: vi.fn(),
};

const mockFileSystemService = {
  getTempDir: vi.fn().mockReturnValue('/tmp'),
  createDirectory: vi.fn(),
};

const mockFileStreamService = {
  sendFile: vi.fn(),
};

const mockSftpGateway = {
  emit: vi.fn(),
};

describe('SftpRepository', () => {
  let repository: SftpRepository;

  beforeEach(async () => {
    // Reset mocks
    vi.resetAllMocks();

    // Setup module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SftpRepository,
        {
          provide: 'SshConnectionService',
          useValue: mockSshConnectionService,
        },
        {
          provide: 'FileStreamService',
          useValue: mockFileStreamService,
        },
        {
          provide: 'SftpGateway',
          useValue: mockSftpGateway,
        },
        {
          provide: 'FileSystemService',
          useValue: mockFileSystemService,
        },
      ],
    }).compile();

    repository = module.get<SftpRepository>(SftpRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
