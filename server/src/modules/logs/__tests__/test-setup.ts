import { vi } from 'vitest';

// Mock the infrastructure/common/query utilities
vi.mock('@infrastructure/common/query/filter.util', () => ({
  filterByFields: vi.fn().mockImplementation(data => data),
  filterByQueryParams: vi.fn().mockImplementation((data, params) => {
    if (params.search === 'error') {
      return data.filter(item => item.msg.includes('error'));
    }
    return data;
  }),
}));

vi.mock('@infrastructure/common/query/sorter.util', () => ({
  sortByFields: vi.fn().mockImplementation(data => data),
}));

vi.mock('@infrastructure/common/query/pagination.util', () => ({
  paginate: vi.fn().mockImplementation((data, current, pageSize) => {
    const start = (current - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }),
}));

// Mock @nestjs/mongoose
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
          schema: {}
        };
      }
    },
    InjectModel: () => {
      return (target: any, key: string) => {
        // Do nothing, just a mock decorator
      };
    },
    getModelToken: (name: string) => `${name}Model`
  };
});

// Mock mongoose
vi.mock('mongoose', () => {
  const mockMongoose = {
    Schema: class Schema {
      constructor(definition, options) {}
    },
    model: vi.fn().mockImplementation((name, schema) => {
      return {
        find: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
        findOne: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
        create: vi.fn().mockResolvedValue({}),
        findOneAndUpdate: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({}),
        }),
        findOneAndDelete: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({}),
        }),
      };
    }),
    Types: {
      ObjectId: function(id) { return id; }
    }
  };
  return mockMongoose;
});

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn().mockImplementation((path) => '{"data": "mocked data"}'),
  writeFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
  promises: {
    readFile: vi.fn().mockResolvedValue('{"data": "mocked data"}'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    access: vi.fn().mockResolvedValue(undefined),
  }
}));

// Mock path module
vi.mock('path', () => ({
  join: vi.fn().mockImplementation((...args) => args.join('/')),
  resolve: vi.fn().mockImplementation((...args) => args.join('/')),
  dirname: vi.fn().mockImplementation((path) => path.split('/').slice(0, -1).join('/')),
  basename: vi.fn().mockImplementation((path) => path.split('/').pop()),
}));