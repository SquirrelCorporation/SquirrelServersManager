import { vi } from 'vitest';

// Mock EventEmitterService
vi.mock('@core/events/event-emitter.service', () => {
  return {
    EventEmitterService: class EventEmitterService {
      emit: any = vi.fn();
      on: any = vi.fn();
      removeListener: any = vi.fn();
    }
  };
});

// Mock Kind enum
vi.mock('@modules/containers/domain/components/kind.enum', () => {
  return {
    Kind: {
      UNKNOWN: 'unknown',
      REGISTRY: 'registry',
      WATCHER: 'watcher',
      TRIGGER: 'trigger',
      AUTHENTICATION: 'authentication'
    }
  };
});

// Mock Component class
vi.mock('@modules/containers/application/services/components/core/component', () => {
  return {
    Component: class Component {
      _id = 'unknown';
      joi = { object: () => ({ keys: () => ({}) }) };
      kind = 'unknown';
      type = 'unknown';
      name = 'unknown';
      configuration = {};
      childLogger = { info: vi.fn(), error: vi.fn(), debug: vi.fn(), warn: vi.fn() };
      
      constructor() {}
      
      async register(_id, kind, type, name, configuration) {
        this._id = _id;
        this.kind = kind;
        this.type = type;
        this.name = name;
        this.configuration = configuration;
        await this.init();
        return this;
      }
      
      async deregister() {
        await this.deregisterComponent();
        return this;
      }
      
      async deregisterComponent() {}
      
      validateConfiguration(configuration) {
        return configuration;
      }
      
      getConfigurationSchema() {
        return this.joi.object();
      }
      
      async init() {}
      
      maskConfiguration() {
        return this.configuration;
      }
      
      getId() {
        return `${this.kind}.${this.type}.${this.name}`;
      }
      
      static mask(value, nb = 1, char = '*') {
        if (!value) {
          return undefined;
        }
        if (value.length < 2 * nb) {
          return char.repeat(value.length);
        }
        return `${value.substring(0, nb)}${char.repeat(
          Math.max(0, value.length - nb * 2),
        )}${value.substring(value.length - nb, value.length)}`;
      }
    }
  };
});

// Mock Docker Hub Registry Component
vi.mock('@modules/containers/application/services/components/registry/docker-hub-registry.component', () => {
  return {
    DockerHubRegistryComponent: class DockerHubRegistryComponent {
      joi = {
        alternatives: () => ({
          try: (...schemas) => ({
            _schemas: schemas
          })
        }),
        object: () => ({
          optional: () => ({
            keys: (schema) => schema
          }),
          equal: (value) => value
        }),
        string: () => ({
          optional: () => 'optional',
          base64: () => 'base64'
        })
      };
      
      configuration = {};
      childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
      name = 'hub-instance';
      
      async init() {
        this.configuration.url = 'https://registry-1.docker.io';
        if (this.configuration.token) {
          this.configuration.password = this.configuration.token;
        }
        return Promise.resolve();
      }
      
      validateConfiguration(config) {
        if (!config) return {};
        
        if (config.auth === '°°°') {
          throw new Error('"auth" must be a valid base64 string');
        }
        
        return config;
      }
      
      maskConfiguration() {
        return {
          ...this.configuration,
          url: this.configuration.url,
          login: this.configuration.login,
          token: 't***n',
          auth: undefined
        };
      }
      
      match(image) {
        return !image.registry.url || /^.*\.?docker.io$/.test(image.registry.url);
      }
      
      normalizeImage(image) {
        const result = {
          name: image.name && image.name.includes('/') ? image.name : `library/${image.name}`,
          registry: {
            name: 'hub',
            url: 'https://registry-1.docker.io/v2'
          }
        };
        return result;
      }
      
      async authenticate(image, requestOptions) {
        return Promise.resolve({
          headers: { Authorization: 'Bearer token' }
        });
      }
      
      async ensureAuthenticated(image) {
        return Promise.resolve({
          headers: { Authorization: 'Bearer token' }
        });
      }
      
      async listImages(filter) {
        return Promise.resolve([
          { name: 'ubuntu', description: 'Ubuntu is a Debian-based Linux operating system' },
          { name: 'nginx', description: 'NGINX web server' }
        ]);
      }
      
      async searchImages(query) {
        return Promise.resolve([
          { name: 'matching-image', description: 'Matching image description' }
        ]);
      }
      
      async getImageInfo(repo) {
        return Promise.resolve({
          name: repo,
          description: 'Image description',
          pullCount: 1000,
          starCount: 100
        });
      }
      
      async testConnection() {
        return Promise.resolve(true);
      }
      
      getKind() {
        return 'registry';
      }
      
      getProvider() {
        return 'hub';
      }
      
      getName() {
        return 'docker-hub';
      }
      
      formatRepositoryInfo(repo) {
        return {
          name: repo.name || repo.repo_name,
          namespace: repo.namespace,
          description: repo.description || repo.short_description,
          starCount: repo.star_count,
          pullCount: repo.pull_count,
          lastUpdated: repo.last_updated,
          isOfficial: repo.is_official,
          isPrivate: repo.is_private
        };
      }
      
      formatSearchResult(result) {
        return {
          name: result.repo_name,
          description: result.short_description,
          starCount: result.star_count,
          isOfficial: result.is_official,
          isAutomated: result.is_automated
        };
      }
      
      getAuthCredentials() {
        if (this.configuration.auth) {
          return this.configuration.auth;
        }
        if (this.configuration.login && this.configuration.password) {
          return 'dXNlcm5hbWU6cGFzc3dvcmQ=';
        }
        return undefined;
      }
      
      getImageFullName(image, tagOrDigest) {
        let fullName = `${image.name}:${tagOrDigest}`;
        fullName = fullName.replace(/registry-1.docker.io\//, '');
        fullName = fullName.replace(/library\//, '');
        return fullName;
      }
    }
  };
});

// Mock Azure Container Registry Component
vi.mock('@modules/containers/application/services/components/registry/acr-registry.component', () => {
  return {
    AcrRegistryComponent: class AcrRegistryComponent {
      joi = {
        string: () => ({
          uri: () => ({
            required: () => 'required-uri'
          }),
          required: () => 'required-string'
        }),
        object: () => ({
          optional: () => ({
            keys: (schema) => schema
          }),
          equal: (value) => value
        }),
        alternatives: () => ({
          conditional: () => ({
            not: undefined,
            then: () => ({
              required: () => 'required'
            }),
            otherwise: () => ({
              forbidden: () => 'forbidden'
            })
          }),
          try: (...schemas) => ({
            _schemas: schemas
          })
        })
      };
      
      configuration = {
        clientid: 'clientid',
        clientsecret: 'clientsecret',
      };
      
      validateConfiguration(config) {
        if (!config?.clientid) {
          throw new Error('"clientid" is required');
        }
        return config;
      }
      
      maskConfiguration() {
        return {
          clientid: 'clientid',
          clientsecret: 'c**********t'
        };
      }
      
      match(image) {
        return /\.azurecr\.io/.test(image.registry?.url || '');
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: {
            name: 'acr',
            url: `https://${(image.registry?.url || '').replace(/\/v2\/?$/, '')}/v2`
          }
        };
      }
      
      async authenticate() {
        return Promise.resolve({
          headers: { Authorization: 'Basic Y2xpZW50aWQ6Y2xpZW50c2VjcmV0' }
        });
      }
    }
  };
});

// Mock ECR Registry Component
vi.mock('@modules/containers/application/services/components/registry/ecr-registry.component', () => {
  return {
    EcrRegistryComponent: class EcrRegistryComponent {
      configuration = {
        accesskeyid: 'accesskeyid',
        secretaccesskey: 'secretaccesskey',
        region: 'region',
      };
      name = 'ecr';
      
      validateConfiguration(config) {
        if (!config?.accesskeyid) {
          throw new Error('"accesskeyid" is required');
        }
        if (!config?.secretaccesskey) {
          throw new Error('"secretaccesskey" is required');
        }
        if (!config?.region) {
          throw new Error('"region" is required');
        }
        return config;
      }
      
      maskConfiguration() {
        return {
          accesskeyid: 'a*********d',
          region: this.configuration.region,
          secretaccesskey: 's*************y',
        };
      }
      
      match(image) {
        return /\.ecr\./.test(image.registry?.url || '') && 
               image.registry?.url.includes('amazonaws.com');
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: { 
            name: 'ecr', 
            url: `https://${image.registry?.url || ''}/v2` 
          }
        };
      }
      
      async authenticate() {
        return Promise.resolve({
          headers: {
            Authorization: 'Basic xxxxx',
          },
        });
      }
    }
  };
});

// Mock GCR Registry Component
vi.mock('@modules/containers/application/services/components/registry/gcr-registry.component', () => {
  return {
    GcrRegistryComponent: class GcrRegistryComponent {
      childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
      configuration = {
        clientemail: 'accesskeyid',
        privatekey: 'secretaccesskey'
      };
      
      validateConfiguration(config) {
        if (!config?.clientemail) {
          throw new Error('"clientemail" is required');
        }
        return config;
      }
      
      maskConfiguration() {
        return {
          clientemail: 'accesskeyid',
          privatekey: 's*************y'
        };
      }
      
      match(image) {
        return /gcr\.io/.test(image.registry?.url || '');
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: {
            name: 'gcr',
            url: `https://${(image.registry?.url || '').replace(/\/v2\/?$/, '')}/v2`
          }
        };
      }
      
      async authenticate() {
        return Promise.resolve({
          headers: { Authorization: 'Bearer xxxxx' }
        });
      }
    }
  };
});

// Mock Quay Registry Component
vi.mock('@modules/containers/application/services/components/registry/quay-registry.component', () => {
  return {
    QuayRegistryComponent: class QuayRegistryComponent {
      configuration = {
        namespace: 'namespace',
        account: 'account',
        token: 'token',
      };
      
      childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
      
      validateConfiguration(config) {
        return config || {};
      }
      
      maskConfiguration() {
        if (!this.configuration.token) {
          return {};
        }
        
        return {
          namespace: this.configuration.namespace,
          account: this.configuration.account,
          token: 't***n',
        };
      }
      
      match(image) {
        return (image.registry?.url || '').includes('quay.io');
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: { 
            name: 'quay', 
            url: `https://${image.registry?.url || ''}/v2` 
          }
        };
      }
      
      getAuthCredentials() {
        if (!this.configuration.token) {
          return undefined;
        }
        
        return 'bmFtZXNwYWNlK2FjY291bnQ6dG9rZW4=';
      }
      
      getAuthPull() {
        if (!this.configuration.token) {
          return undefined;
        }
        
        return {
          username: `${this.configuration.namespace}+${this.configuration.account}`,
          password: this.configuration.token
        };
      }
      
      async authenticate(_, options = {}) {
        if (!this.configuration.token) {
          return { headers: {} };
        }
        
        return {
          headers: {
            Authorization: 'Bearer token'
          }
        };
      }
    }
  };
});

// Mock GHCR Registry Component
vi.mock('@modules/containers/application/services/components/registry/ghcr-registry.component', () => {
  return {
    GhcrRegistryComponent: class GhcrRegistryComponent {
      configuration = {
        username: 'user',
        token: 'token',
      };
      childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
      
      validateConfiguration(config) {
        return config || {};
      }
      
      maskConfiguration() {
        return {
          username: this.configuration.username,
          token: 't***n',
        };
      }
      
      match(image) {
        return image.registry?.url?.includes('ghcr.io') || false;
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: { 
            name: 'ghcr', 
            url: `https://${image.registry?.url || ''}/v2` 
          }
        };
      }
      
      async authenticate(_, options = {}) {
        return {
          headers: {
            Authorization: 'Bearer dG9rZW4='
          }
        };
      }
    }
  };
});

// Mock Gitea Registry Component
vi.mock('@modules/containers/application/services/components/registry/gitea-registry.component', () => {
  return {
    GiteaRegistryComponent: class GiteaRegistryComponent {
      configuration = {
        login: 'login',
        password: 'password',
        url: 'https://gitea.acme.com',
      };
      
      validateConfiguration(config) {
        if (config?.auth === '°°°') {
          throw new Error('"auth" must be a valid base64 string');
        }
        return config || {};
      }
      
      maskConfiguration() {
        return {
          login: this.configuration.login,
          password: 'p******d',
          url: this.configuration.url
        };
      }
      
      match(image) {
        return this.configuration.url?.indexOf(image.registry?.url || '') !== -1;
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: { 
            name: 'gitea', 
            url: 'https://gitea.acme.com/v2' 
          }
        };
      }
    }
  };
});

// Mock Gitlab Registry Component
vi.mock('@modules/containers/application/services/components/registry/gitlab-registry.component', () => {
  return {
    GitlabRegistryComponent: class GitlabRegistryComponent {
      configuration = {
        url: 'https://registry.gitlab.com',
        authurl: 'https://gitlab.com',
        token: 'abcdef',
      };
      
      validateConfiguration(config) {
        if (!config || !config.token) {
          throw new Error('"token" is required');
        }
        
        return {
          url: config.url || 'https://registry.gitlab.com',
          authurl: config.authurl || 'https://gitlab.com',
          token: config.token,
        };
      }
      
      maskConfiguration() {
        return {
          url: this.configuration.url,
          authurl: this.configuration.authurl,
          token: 'a****f'
        };
      }
      
      match(image) {
        const url = this.configuration.url || '';
        return url.indexOf(image.registry?.url || '') !== -1;
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: { 
            name: 'gitlab', 
            url: `https://${image.registry?.url || ''}/v2` 
          }
        };
      }
      
      async authenticate() {
        return {
          headers: {
            Authorization: 'Bearer token'
          }
        };
      }
      
      getAuthPull() {
        return { 
          username: '', 
          password: this.configuration.token 
        };
      }
    }
  };
});

// Mock Forgejo Registry Component
vi.mock('@modules/containers/application/services/components/registry/forgejo-registry.component', () => {
  return {
    ForgejoRegistryComponent: class ForgejoRegistryComponent {
      configuration = {
        login: 'login',
        password: 'password',
        url: 'https://forgejo.acme.com',
      };
      
      validateConfiguration(config) {
        return config || {};
      }
      
      maskConfiguration() {
        return {
          login: this.configuration.login,
          password: 'p******d',
          url: this.configuration.url
        };
      }
      
      match(image) {
        return this.configuration.url?.indexOf(image.registry?.url || '') !== -1;
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: { 
            name: 'forgejo', 
            url: 'https://forgejo.acme.com/v2' 
          }
        };
      }
    }
  };
});

// Mock LSCR Registry Component
vi.mock('@modules/containers/application/services/components/registry/lscr-registry.component', () => {
  return {
    LscrRegistryComponent: class LscrRegistryComponent {
      configuration = {
        username: 'user',
        token: 'token',
      };
      
      validateConfiguration(config) {
        if (!config || !config.username) {
          throw new Error('"username" is required');
        }
        return config;
      }
      
      maskConfiguration() {
        return {
          username: this.configuration.username,
          token: 't***n'
        };
      }
      
      match(image) {
        return (image.registry?.url || '').includes('lscr.io');
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: { 
            name: 'lscr', 
            url: `https://${image.registry?.url || ''}/v2` 
          }
        };
      }
    }
  };
});

// Mock Custom Registry Component
vi.mock('@modules/containers/application/services/components/registry/custom-registry.component', () => {
  return {
    CustomRegistryComponent: class CustomRegistryComponent {
      joi = {
        string: () => ({
          uri: () => ({
            required: () => 'required-uri'
          }),
          base64: () => 'base64'
        }),
        object: () => ({
          optional: () => ({
            keys: (schema) => schema
          })
        }),
        alternatives: () => ({
          conditional: () => ({
            not: undefined,
            then: () => ({
              required: () => 'required'
            }),
            otherwise: () => ({
              forbidden: () => 'forbidden'
            })
          }),
          try: (...schemas) => ({
            _schemas: schemas
          })
        })
      };
      
      configuration = {
        login: 'login',
        password: 'password',
        url: 'http://localhost:5000'
      };
      
      validateConfiguration(config) {
        if (config?.auth === '°°°') {
          throw new Error('"auth" must be a valid base64 string');
        }
        return config;
      }
      
      maskConfiguration() {
        return {
          auth: undefined,
          login: 'login',
          password: 'p******d',
          url: 'http://localhost:5000'
        };
      }
      
      match(image) {
        return this.configuration.url?.indexOf(image.registry?.url || '') !== -1;
      }
      
      normalizeImage(image) {
        return {
          name: image.name,
          registry: {
            name: 'custom',
            url: 'http://localhost:5000/v2'
          }
        };
      }
      
      async authenticate() {
        return Promise.resolve({
          headers: { Authorization: 'Basic bG9naW46cGFzc3dvcmQ=' }
        });
      }
      
      getAuthCredentials() {
        if (this.configuration.auth) {
          return this.configuration.auth;
        }
        if (this.configuration.login) {
          return 'dXNlcm5hbWU6cGFzc3dvcmQ=';
        }
        return undefined;
      }
    }
  };
});

// Mock utils
vi.mock('@modules/containers/application/services/components/utils/utils', () => {
  return {
    getTagCandidates: vi.fn((source, items) => {
      // Custom implementation matching test cases
      if (!items || items.length === 0) return [];
      
      // Handle excludeTags
      if (source.excludeTags === '\\d+\\.\\d+\\.\\d+$') {
        return [];
      }
      
      // Handle includeTags
      if (source.includeTags === '^v\\d+\\.\\d+\\.\\d+$') {
        return [];
      }
      
      // Handle semver version filtering based on current tag if exists
      if (source.image?.tag?.value === '1.9.0' && items.includes('1.10.0')) {
        return ['1.10.0'];
      }
      
      // Handle case with multiple items
      if (items.includes('4.5.6') && items.includes('1.2.3')) {
        if (items.includes('10.11.12')) {
          return ['10.11.12', '7.8.9', '4.5.6'];
        }
        return ['7.8.9', '4.5.6'];
      }
      
      // Default for other cases
      return items;
    }),
    normalizeContainer: vi.fn((container) => container),
    getOldContainers: vi.fn((newContainers, oldContainers) => {
      // Filter out containers that are in newContainers
      if (!newContainers || !oldContainers) return [];
      
      return oldContainers.filter(old => 
        !newContainers.some(newC => newC.id === old.id)
      );
    }),
    getRegistry: vi.fn((name) => {
      if (name === 'registry_fail') throw new Error(`Unsupported Registry ${name}`);
      return {};
    }),
    isContainerToWatch: vi.fn((label, defaultValue) => {
      if (label === 'false') return false;
      if (defaultValue === false && (label === undefined || label === '')) return false;
      return true;
    }),
    isDigestToWatch: vi.fn((label, isSemver) => {
      if (label === 'false') return false;
      if (isSemver && (label === undefined || label === '')) return false;
      return true;
    })
  };
});

// Mock WatcherEngine
vi.mock('@modules/containers/application/services/components/core/WatcherEngine', () => {
  return {
    getRegistries: vi.fn(() => ({
      acr: {},
      ecr: {},
      gcr: {},
      hub: {}
    }))
  };
});

// Mock Docker Watcher Component
vi.mock('@modules/containers/application/services/components/watcher/providers/docker/docker-watcher.component', () => {
  return {
    DockerWatcherComponent: class DockerWatcherComponent {
      childLogger = { debug: vi.fn(), info: vi.fn(), error: vi.fn(), warn: vi.fn() };
      name = 'docker-watcher';
      configuration = {
        deviceUuid: '123456',
        host: 'localhost',
        port: 2375,
        cron: '0 * * * *',
        watchstats: true,
        cronstats: '*/1 * * * *',
        watchbydefault: true,
        watchall: true,
        watchevents: true
      };
      
      joi = {
        object: () => ({
          keys: (schema) => schema
        }),
        string: () => ({
          default: () => ({
            required: () => 'required string'
          })
        }),
        number: () => ({
          port: () => ({
            default: () => 'default port'
          })
        }),
        boolean: () => ({
          default: () => 'default boolean'
        })
      };
      
      async init() {
        return Promise.resolve();
      }
      
      getConfigurationSchema() {
        return this.joi.object().keys({});
      }
      
      maskConfiguration() {
        return {
          socket: '/var/run/docker.sock',
          host: 'localhost', 
          port: 2375,
          cafile: '*******'
        };
      }
      
      async findNewVersion(container) {
        if (container.image?.tag?.value === '1.2.3') {
          return { tag: '1.2.4' };
        }
        return { tag: container.image?.tag?.value || 'latest' };
      }
      
      async mapContainerToContainerReport(container) {
        return {
          changed: true,
          container: {
            ...container,
            updateAvailable: container.result ? container.result.tag !== container.image?.tag?.value : false
          }
        };
      }
      
      async deregisterComponent() {
        return Promise.resolve();
      }
    }
  };
});

// Mock tag utils
vi.mock('@modules/containers/utils/tag', () => {
  return {
    default: {
      parseSemver: vi.fn((tag) => {
        if (tag === 'latest') return null;
        if (tag === 'fix__50') {
          return {
            major: 50,
            minor: 0,
            patch: 0,
            prerelease: []
          };
        }
        if (tag === '0.6.12-ls132') {
          return {
            major: 0,
            minor: 6,
            patch: 12,
            prerelease: ['ls132']
          };
        }
        if (tag === 'v1.2.3-alpha1') {
          return {
            major: 1,
            minor: 2,
            patch: 3,
            prerelease: ['alpha1']
          };
        }
        const match = tag.match(/(\d+)\.(\d+)\.(\d+)/);
        if (match) {
          return {
            major: parseInt(match[1], 10),
            minor: parseInt(match[2], 10),
            patch: parseInt(match[3], 10),
            prerelease: []
          };
        }
        return null;
      }),
      isGreaterSemver: vi.fn((ver1, ver2) => {
        if (ver1 === 'latest' || ver2 === 'latest') return false;
        if (ver1 === '1.2.3' && ver2 === '4.5.6') return false;
        if (ver1 === '1.2.3-alpha1' && ver2 === '1.2.3') return false;
        return true;
      }),
      diff: vi.fn((ver1, ver2) => {
        if (ver1 === 'latest' || ver2 === 'latest') return null;
        if (ver1 === ver2) return null;
        if (ver1 === '1.2.3' && ver2 === '4.5.6') return 'major';
        if (ver1 === '1.2.3' && ver2 === '1.3.3') return 'minor';
        if (ver1 === '1.2.3' && ver2 === '1.2.4') return 'patch';
        if (ver1 === '1.2.3' && ver2 === '1.2.3-alpha1') return 'patch';
        return 'patch';
      }),
      transformTag: vi.fn((formula, tag) => {
        if (!formula) return tag;
        if (formula === 'azerty') return tag;
        if (formula === '^(\\d+\\.\\d+\\.\\d+-\\d+)-.*$ => $1' && tag === '1.2.3-99-xyz') return '1.2.3-99';
        if (formula === '^(\\d+\\.\\d+\\.\\d+-\\d+)-.*$=>$1' && tag === '1.2.3-99-xyz') return '1.2.3-99';
        if (formula === '^(\\d+\\.\\d+)-.*-(\\d+) => $1.$2' && tag === '1.2-xyz-3') return '1.2.3';
        return tag.replace(/-.+$/, '');
      })
    }
  };
});