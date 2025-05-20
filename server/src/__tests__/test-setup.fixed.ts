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

// Mock the infrastructure common query modules
vi.mock('@infrastructure/common/query/pagination.util', () => {
  return {
    paginate: <T>(array: T[] | null | undefined, page: number, pageSize: number): T[] => {
      if (!array) {
        return [];
      }

      const startIndex = (page - 1) * pageSize;
      const endIndex = page * pageSize;

      if (startIndex >= array.length) {
        return [];
      }

      return array.slice(startIndex, endIndex);
    },
  };
});

vi.mock('@infrastructure/common/query/sorter.util', () => {
  return {
    sort: <T>(array: T[], field: keyof T, order: 'asc' | 'desc'): T[] => {
      if (!array) {
        return [];
      }

      return [...array].sort((a, b) => {
        if (a[field] === b[field]) {
          return 0;
        }

        if (order === 'asc') {
          return a[field] < b[field] ? -1 : 1;
        } else {
          return a[field] > b[field] ? -1 : 1;
        }
      });
    },
  };
});

vi.mock('@infrastructure/common/query/filter.util', () => {
  return {
    filter: <T>(array: T[], field: keyof T, value: any): T[] => {
      if (!array) {
        return [];
      }

      return array.filter((item) => {
        if (typeof item[field] === 'string' && typeof value === 'string') {
          return (item[field] as string).toLowerCase().includes(value.toLowerCase());
        }

        return item[field] === value;
      });
    },
  };
});

// Mock Device Auth Repository
vi.mock('@modules/devices/domain/repositories/device-auth-repository.interface', () => ({
  DEVICE_AUTH_REPOSITORY: 'DEVICE_AUTH_REPOSITORY_MOCK_TOKEN', // Mock the token
  IDeviceAuthRepository: vi.fn(), // Mock the interface type if needed
}));

// Mock Vault Crypto Service & Default ID
vi.mock('@modules/ansible-vaults', () => ({
  DEFAULT_VAULT_ID: 'MOCK_DEFAULT_VAULT_ID', // Mock the constant
  VAULT_CRYPTO_SERVICE: 'VAULT_CRYPTO_SERVICE_MOCK_TOKEN', // Mock the token
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

// Mock registry components
vi.mock(
  '@modules/containers/application/services/components/registry/acr-registry.component',
  () => {
    return {
      AcrRegistryComponent: class AcrRegistryComponent {
        configuration = {
          clientid: 'clientid',
          clientsecret: 'clientsecret',
        };
        name = 'acr';
        validateConfiguration = vi.fn().mockImplementation((config) => {
          if (!config.clientid) {
            throw new Error('"clientid" is required');
          }
          if (!config.clientsecret) {
            throw new Error('"clientsecret" is required');
          }
          return config;
        });
        maskConfiguration = vi.fn().mockReturnValue({
          clientid: 'clientid',
          clientsecret: 'c**********t',
        });
        match = vi.fn().mockImplementation((container) => {
          if (container?.registry?.url?.includes('azurecr.io')) {
            return true;
          }
          return false;
        });
        normalizeImage = vi.fn().mockImplementation((image) => {
          return {
            ...image,
            registry: {
              name: 'acr',
              url: `https://${image.registry.url}/v2`,
            },
          };
        });
        authenticate = vi.fn().mockResolvedValue({
          headers: {
            Authorization: 'Basic Y2xpZW50aWQ6Y2xpZW50c2VjcmV0',
          },
        });
      },
    };
  },
);

// Mock ECR registry component
vi.mock(
  '@modules/containers/application/services/components/registry/ecr-registry.component',
  () => {
    return {
      EcrRegistryComponent: class EcrRegistryComponent {
        name = 'ecr';
        match = vi.fn().mockImplementation((container) => {
          if (container?.registry?.url?.includes('ecr')) {
            return true;
          }
          return false;
        });
      },
    };
  },
);

// Mock GCR registry component
vi.mock(
  '@modules/containers/application/services/components/registry/gcr-registry.component',
  () => {
    return {
      GcrRegistryComponent: class GcrRegistryComponent {
        name = 'gcr';
        match = vi.fn().mockImplementation((container) => {
          if (container?.registry?.url?.includes('gcr.io')) {
            return true;
          }
          return false;
        });
      },
    };
  },
);

// Mock Docker Hub registry component
vi.mock(
  '@modules/containers/application/services/components/registry/docker-hub-registry.component',
  () => {
    return {
      DockerHubRegistryComponent: class DockerHubRegistryComponent {
        name = 'hub';
        match = vi.fn().mockImplementation(() => true);
      },
    };
  },
);

// Mock registry utilities
vi.mock('@modules/containers/application/services/components/core/WatcherEngine', () => {
  return {
    getRegistries: vi.fn().mockReturnValue({
      acr: {},
      ecr: {},
      gcr: {},
      hub: {},
    }),
  };
});
