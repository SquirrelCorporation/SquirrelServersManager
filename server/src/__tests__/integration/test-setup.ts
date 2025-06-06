import { vi } from 'vitest';

// Mock NestJS dependencies
vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    Injectable: () => (target: any) => target,
    Inject: () => () => undefined,
    Logger: class MockLogger {
      log = vi.fn();
      error = vi.fn();
      warn = vi.fn();
      debug = vi.fn();
      verbose = vi.fn();
    },
  };
});

// Mock NestJS config
vi.mock('@nestjs/config', () => {
  return {
    ConfigService: class MockConfigService {
      get = vi.fn().mockImplementation((key) => {
        const config = {
          'db.host': 'localhost',
          'db.port': '27017',
          'db.name': 'test-db',
          'auth.jwtSecret': 'test-secret',
          'ansible.configDir': '/etc/ansible',
          'app.port': 3000,
          'app.apiVersion': 'v1',
        };
        return config[key];
      });
    },
  };
});

// Mock database connection
vi.mock('mongoose', () => {
  return {
    default: {
      connect: vi.fn().mockResolvedValue({}),
      disconnect: vi.fn().mockResolvedValue({}),
      connection: {
        db: {
          dropDatabase: vi.fn().mockResolvedValue(undefined),
        },
      },
      model: vi.fn().mockReturnValue({
        find: vi.fn().mockReturnThis(),
        findOne: vi.fn().mockReturnThis(),
        create: vi.fn().mockReturnThis(),
        updateOne: vi.fn().mockReturnThis(),
        deleteOne: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue({}),
      }),
    },
    Schema: class MockSchema {
      constructor() {}
      index() {
        return this;
      }
      pre() {
        return this;
      }
      set() {
        return this;
      }
    },
    model: vi.fn().mockReturnValue({
      find: vi.fn().mockReturnThis(),
      findOne: vi.fn().mockReturnThis(),
      create: vi.fn().mockReturnThis(),
      updateOne: vi.fn().mockReturnThis(),
      deleteOne: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue({}),
    }),
  };
});

// Mock file system
vi.mock('fs', () => {
  return {
    promises: {
      readFile: vi.fn().mockResolvedValue('{"test": "data"}'),
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      readdir: vi.fn().mockResolvedValue(['file1', 'file2']),
      stat: vi.fn().mockResolvedValue({ isDirectory: () => true }),
      access: vi.fn().mockResolvedValue(true),
    },
    readFileSync: vi.fn().mockReturnValue('{"test": "data"}'),
    writeFileSync: vi.fn().mockReturnValue(undefined),
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn().mockReturnValue(undefined),
    readdirSync: vi.fn().mockReturnValue(['file1', 'file2']),
    statSync: vi.fn().mockReturnValue({ isDirectory: () => true }),
  };
});

// Mock path
vi.mock('path', () => {
  return {
    join: vi.fn((...args) => args.join('/')),
    resolve: vi.fn((...args) => args.join('/')),
    dirname: vi.fn((p) => p.split('/').slice(0, -1).join('/')),
    basename: vi.fn((p) => p.split('/').pop()),
  };
});

// Mock User model
vi.mock('../../../../data/database/model/User', () => ({
  UsersModel: vi.fn().mockImplementation(() => ({
    findOne: vi.fn().mockReturnThis(),
    save: vi.fn(),
  })),
}));
