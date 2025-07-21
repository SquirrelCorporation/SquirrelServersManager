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

// Mock child_process
vi.mock('child_process', () => {
  return {
    spawn: vi.fn().mockReturnValue({
      stdout: {
        on: vi.fn().mockImplementation((event, cb) => {
          if (event === 'data') {
            cb('test output');
          }
          return this;
        }),
      },
      stderr: {
        on: vi.fn().mockImplementation((event, cb) => {
          if (event === 'data') {
            cb('');
          }
          return this;
        }),
      },
      on: vi.fn().mockImplementation((event, cb) => {
        if (event === 'close') {
          cb(0);
        }
        return this;
      }),
    }),
    exec: vi.fn().mockImplementation((cmd, cb) => {
      cb(null, 'test output', '');
    }),
    execSync: vi.fn().mockReturnValue(Buffer.from('test output')),
  };
});

// Mock NestJS event emitter
vi.mock('@nestjs/event-emitter', () => {
  return {
    EventEmitter2: class MockEventEmitter {
      emit = vi.fn();
      on = vi.fn();
      once = vi.fn();
      removeListener = vi.fn();
    },
  };
});

// Mock specific modules for settings tests
vi.mock('@modules/users/infrastructure/repositories/user.repository', () => {
  return {
    UserRepository: class MockUserRepository {
      findByEmail = vi.fn().mockResolvedValue({
        email: 'test@example.com',
        name: 'test',
        avatar: 'test',
        password: 'test',
        role: 'test',
      });
      resetApiKey = vi.fn().mockResolvedValue('new-api-key');
      updateLogsLevel = vi.fn().mockResolvedValue(undefined);
    },
  };
});

// Mock app.module.ts
vi.mock('@modules/ssh', () => ({
  SshModule: class SshModule {},
}));

// Mock User model
vi.mock('../../../../data/database/model/User', () => ({
  User: class User {
    static findOne = vi.fn().mockResolvedValue({
      username: 'admin',
      password: 'password',
      roles: ['admin'],
      toObject: () => ({
        username: 'admin',
        roles: ['admin'],
      }),
    });
    static create = vi.fn().mockResolvedValue({
      username: 'admin',
      roles: ['admin'],
      _id: '123',
      toObject: () => ({
        username: 'admin',
        roles: ['admin'],
        _id: '123',
      }),
    });
    static findById = vi.fn().mockResolvedValue({
      username: 'admin',
      roles: ['admin'],
      _id: '123',
      toObject: () => ({
        username: 'admin',
        roles: ['admin'],
        _id: '123',
      }),
    });
  },
}));

// Mock devices module
vi.mock('@modules/devices', () => {
  return {
    DEVICES_SERVICE: Symbol('DEVICES_SERVICE'),
    IDevicesService: class MockDevicesService {
      findByUuids = vi.fn().mockResolvedValue([
        {
          uuid: 'test-uuid',
          name: 'test-device',
          hostname: 'test-host',
          ipAddress: '192.168.1.1',
          status: 'active',
          type: 'docker',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      findOneByUuid = vi.fn().mockResolvedValue({
        uuid: 'test-uuid',
        name: 'test-device',
        hostname: 'test-host',
        ipAddress: '192.168.1.1',
        status: 'active',
        type: 'docker',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    },
  };
});

// Mock app-exceptions module
vi.mock('@infrastructure/exceptions/app-exceptions', () => {
  return {
    UnauthorizedException: class UnauthorizedException extends Error {
      constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedException';
      }
    },
    InternalServerException: class InternalServerException extends Error {
      constructor(message = 'Internal Server Error') {
        super(message);
        this.name = 'InternalServerException';
      }
    },
    EntityNotFoundException: class EntityNotFoundException extends Error {
      constructor(message = 'Entity Not Found') {
        super(message);
        this.name = 'EntityNotFoundException';
      }
    },
    BadRequestException: class BadRequestException extends Error {
      constructor(message = 'Bad Request') {
        super(message);
        this.name = 'BadRequestException';
      }
    },
  };
});
