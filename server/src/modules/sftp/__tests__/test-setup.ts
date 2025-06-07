import { vi } from 'vitest';

// Mock SFTP service
vi.mock('@modules/sftp/application/services/sftp.service', () => ({
  SftpService: class SftpService {
    constructor() {}
    connect = vi.fn().mockResolvedValue({
      sftp: {
        readdir: vi.fn().mockImplementation((path, cb) => cb(null, [])),
        mkdir: vi.fn().mockImplementation((path, attrs, cb) => cb(null)),
        rmdir: vi.fn().mockImplementation((path, cb) => cb(null)),
        unlink: vi.fn().mockImplementation((path, cb) => cb(null)),
        rename: vi.fn().mockImplementation((oldPath, newPath, cb) => cb(null)),
        stat: vi.fn().mockImplementation((path, cb) => cb(null, { isDirectory: () => true })),
        chmod: vi.fn().mockImplementation((path, mode, cb) => cb(null)),
      },
      close: vi.fn(),
    });
    getFileInfo = vi.fn().mockResolvedValue({
      name: 'test.txt',
      path: '/test/test.txt',
      size: 100,
      modTime: new Date(),
      isDirectory: false,
      permissions: '644',
    });
    listDirectory = vi.fn().mockResolvedValue([
      {
        name: 'test.txt',
        path: '/test/test.txt',
        size: 100,
        modTime: new Date(),
        isDirectory: false,
        permissions: '644',
      },
    ]);
    makeDirectory = vi.fn().mockResolvedValue(true);
    removeDirectory = vi.fn().mockResolvedValue(true);
    removeFile = vi.fn().mockResolvedValue(true);
    renameItem = vi.fn().mockResolvedValue(true);
    changePermissions = vi.fn().mockResolvedValue(true);
  },
}));

// Mock SFTP repository
vi.mock('@modules/sftp/infrastructure/repositories/sftp.repository', () => ({
  SftpRepository: class SftpRepository {
    constructor() {}
    connect = vi.fn().mockResolvedValue({
      sftp: {
        readdir: vi.fn().mockImplementation((path, cb) => cb(null, [])),
        mkdir: vi.fn().mockImplementation((path, attrs, cb) => cb(null)),
        rmdir: vi.fn().mockImplementation((path, cb) => cb(null)),
        unlink: vi.fn().mockImplementation((path, cb) => cb(null)),
        rename: vi.fn().mockImplementation((oldPath, newPath, cb) => cb(null)),
        stat: vi.fn().mockImplementation((path, cb) => cb(null, { isDirectory: () => true })),
        chmod: vi.fn().mockImplementation((path, mode, cb) => cb(null)),
      },
      close: vi.fn(),
    });
  },
}));

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
