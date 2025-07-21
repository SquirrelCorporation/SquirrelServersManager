import { vi } from 'vitest';

// Mock SFTP Repository class
export class SftpRepository {
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
}
