import { vi } from 'vitest';

// Mock SSH connection service
vi.mock('@modules/ssh/application/services/ssh-connection.service', () => ({
  SshConnectionService: class SshConnectionService {
    constructor() {}
    connect = vi.fn().mockResolvedValue({
      session: 'test-session',
      ssh: {
        close: vi.fn(),
        exec: vi.fn().mockImplementation((cmd, cb) => {
          cb(null, { on: vi.fn(), stderr: { on: vi.fn() }, stdout: { on: vi.fn() } });
          return { on: vi.fn() };
        }),
      },
    });
    connectWithAuth = vi.fn().mockResolvedValue({
      session: 'test-session',
      ssh: {
        close: vi.fn(),
        exec: vi.fn().mockImplementation((cmd, cb) => {
          cb(null, { on: vi.fn(), stderr: { on: vi.fn() }, stdout: { on: vi.fn() } });
          return { on: vi.fn() };
        }),
      },
    });
  },
}));

// Mock SSH terminal service
vi.mock('@modules/ssh/application/services/ssh-terminal.service', () => ({
  SshTerminalService: class SshTerminalService {
    constructor() {}
    createSession = vi.fn().mockResolvedValue('test-session-id');
    sendData = vi.fn();
    resizeTerminal = vi.fn();
    closeClientSessions = vi.fn();
    getSessionIdForClient = vi.fn().mockReturnValue('test-session-id');
    getStream = vi.fn();
  },
}));

// Mock NestJS
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

// Mock socket.io
vi.mock('socket.io', () => ({
  Socket: class Socket {
    id = 'test-client-id';
    emit = vi.fn();
    on = vi.fn();
    join = vi.fn();
    leave = vi.fn();
  },
}));

// Mock external adapter
vi.mock('@infrastructure/adapters/ssh/ssh-credentials.adapter', () => ({
  SSHCredentialsAdapter: class SSHCredentialsAdapter {
    getSShConnection = vi.fn().mockResolvedValue({
      username: 'test-user',
      password: 'test-password',
    });
  },
  default: class DefaultAdapter {
    getSShConnection = vi.fn().mockResolvedValue({
      username: 'test-user',
      password: 'test-password',
    });
  },
}));

// Mock DNS utility
vi.mock('@infrastructure/common/dns/dns.util', () => ({
  tryResolveHost: vi.fn().mockResolvedValue('127.0.0.1'),
}));
