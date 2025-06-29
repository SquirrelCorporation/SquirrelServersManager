import { vi } from 'vitest';

// Mock Kind enum
vi.mock('@modules/containers/domain/components/kind.enum', () => {
  return {
    Kind: {
      UNKNOWN: 'unknown',
      REGISTRY: 'registry',
      WATCHER: 'watcher',
      TRIGGER: 'trigger',
      AUTHENTICATION: 'authentication',
    },
  };
});

// Mock playbooks module to avoid schema issues
vi.mock('@modules/playbooks', () => {
  return {
    PlaybooksModule: class {
      static forRoot() {
        return {
          module: class {},
          providers: [],
        };
      }
    },
    PlaybooksService: class {
      findAll = vi.fn().mockResolvedValue([]);
      findOneByUuid = vi.fn().mockResolvedValue(null);
      create = vi.fn().mockResolvedValue({});
    },
    PLAYBOOKS_SERVICE: 'PlaybooksService',
  };
});

vi.mock('@modules/playbooks/infrastructure/schemas/playbooks-register.schema', () => {
  return {
    PlaybooksRegister: class {
      uuid = 'mock-uuid';
      name = 'mock-name';
      path = 'mock-path';
      repository = 'mock-repository';
      playbooks = [];
    },
    PlaybooksRegisterSchema: {},
    PLAYBOOKS_REGISTER: 'PlaybooksRegister',
  };
});

// Mock the problematic infrastructure adapter
vi.mock('@infrastructure/adapters/ssh/axios-ssh.adapter', () => {
  return {
    createSshFetch: vi.fn(() => {
      // Return a mock fetch function or necessary structure
      // For now, just return a dummy function to satisfy the import
      return vi.fn();
    }),
  };
});

// Mock mongoose
vi.mock('mongoose', () => {
  return {
    Schema: class Schema {
      constructor() {}
      plugin() {
        return this;
      }
    },
    model: vi.fn().mockReturnValue({}),
    Types: {
      ObjectId: class {
        constructor(id) {
          this.id = id;
        }
        toString() {
          return this.id;
        }
      },
    },
  };
});

// Mock @nestjs/mongoose
vi.mock('@nestjs/mongoose', () => {
  return {
    Prop: () => jest.fn(),
    Schema: () => jest.fn(),
    SchemaFactory: {
      createForClass: () => ({
        plugin: () => ({}),
      }),
    },
    InjectModel: () => jest.fn(),
    getModelToken: () => 'MockModelToken',
  };
});

/* Mock registry components */
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
          if (container.registry?.url?.includes('azurecr.io')) {
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

/* Mock ECR registry component */
vi.mock(
  '@modules/containers/application/services/components/registry/ecr-registry.component',
  () => {
    return {
      EcrRegistryComponent: class EcrRegistryComponent {
        name = 'ecr';
      },
    };
  },
);

/* Mock GCR registry component */
vi.mock(
  '@modules/containers/application/services/components/registry/gcr-registry.component',
  () => {
    return {
      GcrRegistryComponent: class GcrRegistryComponent {
        name = 'gcr';
      },
    };
  },
);

/* Mock Docker Hub registry component */
vi.mock(
  '@modules/containers/application/services/components/registry/docker-hub-registry.component',
  () => {
    return {
      DockerHubRegistryComponent: class DockerHubRegistryComponent {
        name = 'hub';
      },
    };
  },
);

/* Mock registry utilities */
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
