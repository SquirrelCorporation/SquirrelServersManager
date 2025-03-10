import { Test, TestingModule } from '@nestjs/testing';
import { SftpRepository } from '../../infrastructure/repositories/sftp.repository';
import { SshConnectionService } from '../../../ssh-nest/services/ssh-connection.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileStreamService } from '../../infrastructure/services/file-stream.service';

// Mock the SshConnectionService to avoid loading external dependencies
vi.mock('../../../ssh-nest/services/ssh-connection.service', () => ({
  SshConnectionService: vi.fn().mockImplementation(() => ({
    createConnection: vi.fn().mockResolvedValue({
      ssh: {},
      host: 'test-host',
    }),
  })),
}));

describe('SftpRepository', () => {
  let repository: SftpRepository;
  let sshConnectionService: SshConnectionService;
  let fileStreamService: FileStreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SftpRepository,
        {
          provide: SshConnectionService,
          useValue: {
            createConnection: vi.fn().mockResolvedValue({
              ssh: {},
              host: 'test-host',
            }),
          },
        },
        {
          provide: FileStreamService,
          useValue: {
            sendFile: vi.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<SftpRepository>(SftpRepository);
    sshConnectionService = module.get<SshConnectionService>(SshConnectionService);
    fileStreamService = module.get<FileStreamService>(FileStreamService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // Add more tests as needed
}); 