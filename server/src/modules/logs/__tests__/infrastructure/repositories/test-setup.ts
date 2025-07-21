import { vi } from 'vitest';

// Mock mongoose
vi.mock('mongoose', () => {
  const mockMongoose = {
    Schema: class Schema {
      constructor(definition, options) {}
    },
    Model: class {
      constructor() {}
      static find() {
        return { exec: vi.fn() };
      }
      static findOne() {
        return { exec: vi.fn() };
      }
    },
    model: vi.fn().mockImplementation((name, schema) => {
      return {
        find: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
          sort: vi.fn().mockReturnThis(),
          lean: vi.fn().mockReturnThis(),
        }),
        findOne: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
          lean: vi.fn().mockReturnThis(),
        }),
        findOneAndUpdate: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({}),
          lean: vi.fn().mockReturnThis(),
        }),
        create: vi.fn().mockResolvedValue({}),
      };
    }),
    Types: {
      ObjectId: function (id) {
        return id;
      },
    },
  };
  return mockMongoose;
});

// Mock nestjs/mongoose
vi.mock('@nestjs/mongoose', () => {
  return {
    Schema: (options = {}) => {
      return (constructor: any) => {
        // Do nothing, just a mock decorator
      };
    },
    Prop: (options = {}) => {
      return (target: any, key: string) => {
        // Do nothing, just a mock decorator
      };
    },
    SchemaFactory: {
      createForClass: (documentClass: any) => {
        return {
          // Return a mock schema
          schema: {},
        };
      },
    },
    InjectModel: () => {
      return (target: any, key: string) => {
        // Do nothing, just a mock decorator
      };
    },
    getModelToken: (name: string) => `${name}Model`,
  };
});

// Mock @modules/ansible/infrastructure/repositories/ansible-logs.repository
vi.mock('../../../infrastructure/repositories/ansible-logs.repository', () => {
  return {
    AnsibleLogsRepository: vi.fn().mockImplementation(() => {
      return {
        deleteAllByIdent: vi.fn().mockResolvedValue(undefined),
        findAll: vi.fn().mockResolvedValue([]),
        findAllByIdent: vi.fn().mockResolvedValue([]),
      };
    }),
  };
});

// Mock @modules/ansible/infrastructure/mappers/ansible-task.mapper
vi.mock('../../../infrastructure/mappers/ansible-task.mapper', () => {
  return {
    AnsibleTaskMapper: vi.fn().mockImplementation(() => {
      return {
        toDomain: vi.fn().mockImplementation((entity) => entity),
        toPersistence: vi.fn().mockImplementation((domain) => domain),
      };
    }),
  };
});

// Mock @modules/ansible/infrastructure/schemas/ansible-task.schema
vi.mock('../../../infrastructure/schemas/ansible-task.schema', () => {
  return {
    AnsibleTask: class {
      ident: string;
      status: string;
      cmd: string;
      createdAt: Date;
      constructor() {
        this.ident = 'mock-ident';
        this.status = 'mock-status';
        this.cmd = 'mock-cmd';
        this.createdAt = new Date();
      }
    },
  };
});

// Mock the AnsibleTaskRepository implementation
vi.mock('../../../infrastructure/repositories/ansible-task.repository', () => {
  return {
    AnsibleTaskRepository: vi.fn().mockImplementation(() => {
      return {
        create: vi.fn().mockImplementation(async (task) => {
          const createdTask = {
            ...task,
            toObject: () => task,
          };
          return createdTask;
        }),
        updateStatus: vi.fn().mockImplementation(async (ident, status) => {
          if (ident === 'non-existent') {
            return null;
          }
          return { ident, status };
        }),
        findAll: vi.fn().mockImplementation(async () => {
          return [{ ident: '1' }, { ident: '2' }];
        }),
        findAllOld: vi.fn().mockImplementation(async (ageInMinutes) => {
          return [{ ident: '1' }, { ident: '2' }];
        }),
        deleteAllTasksAndStatuses: vi.fn().mockResolvedValue(undefined),
        deleteAllOldLogsAndStatuses: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
});
