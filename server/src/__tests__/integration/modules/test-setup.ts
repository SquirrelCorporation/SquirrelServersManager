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

// Mock schema types
vi.mock('@nestjs/mongoose', () => {
  return {
    Schema: () => ({}),
    Prop: () => ({}),
    SchemaFactory: {
      createForClass: () => ({
        index: () => ({}),
      }),
    },
    InjectModel: () => () => ({}),
  };
});

// Mock event emitter
vi.mock('@nestjs/event-emitter', () => {
  return {
    EventEmitter2: class MockEventEmitter {
      emit = vi.fn();
      on = vi.fn();
      once = vi.fn();
      removeListener = vi.fn();
    },
    OnEvent: () => () => ({}),
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

// Mock devices service
vi.mock('@modules/devices/application/services/devices.service', () => {
  return {
    DevicesService: class MockDevicesService {
      findAll = vi.fn().mockResolvedValue([
        {
          uuid: '12345678-1234-1234-1234-123456789012',
          hostname: 'test-device-1',
          ip: '192.168.1.100',
          status: 'online',
        },
        {
          uuid: '87654321-4321-4321-4321-210987654321',
          hostname: 'test-device-2',
          ip: '192.168.1.101',
          status: 'offline',
        },
      ]);

      findOne = vi.fn().mockImplementation((uuid) => {
        if (uuid === '12345678-1234-1234-1234-123456789012') {
          return Promise.resolve({
            uuid,
            hostname: 'test-device-1',
            ip: '192.168.1.100',
            status: 'online',
          });
        }
        return Promise.resolve(null);
      });

      create = vi.fn().mockImplementation((device) => {
        return Promise.resolve({
          ...device,
          uuid: device.uuid || '12345678-1234-1234-1234-123456789012',
        });
      });

      update = vi.fn().mockImplementation((uuid, data) => {
        if (uuid === '12345678-1234-1234-1234-123456789012') {
          return Promise.resolve({
            uuid,
            hostname: data.hostname || 'test-device-1',
            ip: '192.168.1.100',
            status: data.status || 'online',
          });
        }
        throw new Error('Device not found');
      });

      delete = vi.fn().mockImplementation((uuid) => {
        if (uuid === '12345678-1234-1234-1234-123456789012') {
          return Promise.resolve({ deleted: true });
        }
        throw new Error('Device not found');
      });
    },
  };
});
