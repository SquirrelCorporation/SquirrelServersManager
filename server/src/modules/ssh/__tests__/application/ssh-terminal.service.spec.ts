import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SshTerminalService } from '../../application/services/ssh-terminal.service';
import { SshConnectionService } from '../../application/services/ssh-connection.service';

// Mock the SshConnectionService
vi.mock('../../application/services/ssh-connection.service', () => ({
  SshConnectionService: vi.fn().mockImplementation(() => ({
    createConnection: vi.fn().mockResolvedValue({
      ssh: {
        on: vi.fn(),
        shell: vi.fn((options, callback) => {
          callback(null, {
            on: vi.fn(),
            stderr: { on: vi.fn() },
            stdout: { on: vi.fn() },
          });
        }),
      },
      host: 'test-host',
    }),
  })),
}));

describe('SshTerminalService', () => {
  let service: SshTerminalService;
  let connectionService: SshConnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SshTerminalService,
        {
          provide: SshConnectionService,
          useValue: {
            createConnection: vi.fn().mockResolvedValue({
              ssh: {
                on: vi.fn(),
                shell: vi.fn((options, callback) => {
                  callback(null, {
                    on: vi.fn(),
                    stderr: { on: vi.fn() },
                    stdout: { on: vi.fn() },
                  });
                }),
              },
              host: 'test-host',
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SshTerminalService>(SshTerminalService);
    connectionService = module.get<SshConnectionService>(SshConnectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests as needed
});