import { vi } from 'vitest';

// Mock the application exceptions
vi.mock('@infrastructure/exceptions/app-exceptions', () => {
  class BadRequestException extends Error {
    constructor(message) {
      super(message);
      this.name = 'BadRequestException';
    }
  }

  class NotFoundException extends Error {
    constructor(message) {
      super(message);
      this.name = 'NotFoundException';
    }
  }

  class UnauthorizedException extends Error {
    constructor(message) {
      super(message);
      this.name = 'UnauthorizedException';
    }
  }

  class ForbiddenException extends Error {
    constructor(message) {
      super(message);
      this.name = 'ForbiddenException';
    }
  }

  class ConflictException extends Error {
    constructor(message) {
      super(message);
      this.name = 'ConflictException';
    }
  }

  class InternalServerErrorException extends Error {
    constructor(message) {
      super(message);
      this.name = 'InternalServerErrorException';
    }
  }

  return {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
    ConflictException,
    InternalServerErrorException,
  };
});

// Mock the ansible-vaults module
vi.mock('@modules/ansible-vaults', () => {
  return {
    AnsibleVaultModule: class {
      static forRoot() {
        return {
          module: class {},
          providers: [],
        };
      }
    },
    AnsibleVaultsModule: class {
      static forRoot() {
        return {
          module: class {},
          providers: [],
        };
      }
    },
    AnsibleVaultService: class {
      encrypt = vi.fn().mockImplementation((value) => `encrypted_${value}`);
      decrypt = vi.fn().mockImplementation((value) => value.replace('encrypted_', ''));
    },
    VAULT_CRYPTO_SERVICE: 'VAULT_CRYPTO_SERVICE_TOKEN_MOCK',
  };
});

// Mock the infrastructure security vault-crypto service
vi.mock('@infrastructure/security/vault-crypto/services/vault.service', () => {
  return {
    VaultService: class {
      encrypt = vi.fn().mockImplementation((value) => `encrypted_${value}`);
      decrypt = vi.fn().mockImplementation((value) => value.replace('encrypted_', ''));
      encryptObject = vi.fn().mockImplementation((obj) => ({ ...obj, encrypted: true }));
      decryptObject = vi.fn().mockImplementation((obj) => ({ ...obj, encrypted: false }));
    },
  };
});

// Mock the docker utils
vi.mock('@infrastructure/common/docker/utils', () => {
  return {
    validateRepositoryUrl: vi.fn().mockReturnValue(true),
    parseRepositoryUrl: vi.fn().mockImplementation((url) => ({
      domain: 'registry.example.com',
      owner: 'owner',
      repo: 'repo',
      valid: true,
    })),
    isValidRegistryUrl: vi.fn().mockReturnValue(true),
    parseGitUrl: vi.fn().mockImplementation((url) => ({
      domain: 'github.com',
      owner: 'owner',
      repo: 'repo',
      protocol: 'https',
      valid: true,
    })),
  };
});

// Mock the docker compose JSON transformer
vi.mock('@infrastructure/common/docker/docker-compose-json-transformer.util', () => {
  return {
    transformDockerComposeJsonToYaml: vi.fn().mockImplementation((json) => {
      return 'version: "3"\nservices:\n  app:\n    image: test';
    }),
    transformYamlToDockerComposeJson: vi.fn().mockImplementation((yaml) => {
      return {
        version: '3',
        services: {
          app: {
            image: 'test',
          },
        },
      };
    }),
  };
});

// Mock the recursive file finder util
vi.mock('@infrastructure/common/files/recursive-find.util', () => {
  return {
    recursiveFind: vi.fn().mockResolvedValue(['file1.yml', 'file2.yml']),
    findDirectories: vi.fn().mockResolvedValue(['dir1', 'dir2']),
    findFiles: vi.fn().mockResolvedValue(['file1.yml', 'file2.yml']),
  };
});

// Mock the git clone service
vi.mock('@infrastructure/adapters/git/services/clone.service', () => {
  return {
    GitCloneService: class {
      clone = vi.fn().mockResolvedValue({ success: true, path: '/tmp/repo' });
      pull = vi.fn().mockResolvedValue({ success: true });
      getLatestCommit = vi.fn().mockResolvedValue({
        hash: '123456',
        date: new Date().toISOString(),
        message: 'Test commit',
      });
    },
  };
});

// Mock the git commit and sync service
vi.mock('@infrastructure/adapters/git/services/commit-and-sync.service', () => {
  return {
    GitCommitAndSyncService: class {
      commit = vi.fn().mockResolvedValue({ success: true, hash: '123456' });
      commitAndPush = vi.fn().mockResolvedValue({ success: true, hash: '123456' });
      getStatus = vi.fn().mockResolvedValue({
        branch: 'main',
        changes: [],
        staged: [],
        untracked: [],
      });
    },
  };
});

// Mock the git force pull service
vi.mock('@infrastructure/adapters/git/services/force-pull.service', () => {
  return {
    GitForcePullService: class {
      pull = vi.fn().mockResolvedValue({ success: true });
      forcePull = vi.fn().mockResolvedValue({ success: true });
    },
  };
});

// Mock the playbooks module
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
    PlaybookService: class {
      findAll = vi.fn().mockResolvedValue([]);
      findOneByUuid = vi.fn().mockResolvedValue(null);
      create = vi.fn().mockResolvedValue({});
    },
    PLAYBOOKS_SERVICE: 'PlaybooksService',
  };
});

vi.mock('@modules/playbooks/playbooks.module', () => {
  return {
    PlaybooksModule: class {
      static forRoot() {
        return {
          module: class {},
          providers: [],
        };
      }
    },
  };
});

// Mock the shell module
vi.mock('@modules/shell', () => {
  return {
    ShellModule: class {
      static forRoot() {
        return {
          module: class {},
          providers: [],
        };
      }
    },
    ShellService: class {
      executeCommand = vi.fn().mockResolvedValue({ stdout: 'success', stderr: '', exitCode: 0 });
    },
    FileSystemService: class {
      readFile = vi.fn().mockResolvedValue('file content');
      writeFile = vi.fn().mockResolvedValue(undefined);
      appendFile = vi.fn().mockResolvedValue(undefined);
      exists = vi.fn().mockResolvedValue(true);
      mkdir = vi.fn().mockResolvedValue(undefined);
      readdir = vi.fn().mockResolvedValue(['file1', 'file2']);
    },
    DockerComposeService: class {
      dockerComposeUp = vi.fn().mockResolvedValue({ stdout: 'up', stderr: '', exitCode: 0 });
      dockerComposeDown = vi.fn().mockResolvedValue({ stdout: 'down', stderr: '', exitCode: 0 });
      dockerComposePull = vi.fn().mockResolvedValue({ stdout: 'pulled', stderr: '', exitCode: 0 });
      dockerComposeDryRun = vi
        .fn()
        .mockResolvedValue({ stdout: 'dry-run', stderr: '', exitCode: 0 });
    },
    FILE_SYSTEM_SERVICE: 'FileSystemService',
    DOCKER_COMPOSE_SERVICE: 'DockerComposeService',
    SHELL_SERVICE: 'ShellService',
    SSH_KEY_SERVICE: 'SshKeyService',
    PLAYBOOK_FILE_SERVICE: 'PlaybookFileService',
  };
});

// Mock core event emitter
vi.mock('@core/events/event-emitter.service', () => {
  return {
    EventEmitterService: class {
      emit = vi.fn();
      on = vi.fn();
      once = vi.fn();
      removeListener = vi.fn();
    },
  };
});

// Mock Mongoose model names/constants
vi.mock('../infrastructure/schemas/container-custom-stack.schema', () => ({
  CONTAINER_CUSTOM_STACK: 'ContainerCustomStack',
  ContainerCustomStackSchema: {},
}));

vi.mock('../infrastructure/schemas/container-custom-stack-repository.schema', () => ({
  CONTAINER_CUSTOM_STACK_REPOSITORY: 'ContainerCustomStackRepository',
  ContainerCustomStackRepositorySchema: {},
}));

// Mock interfaces
vi.mock('../../domain/interfaces/container-stacks-service.interface', () => ({
  CONTAINER_STACKS_SERVICE: 'ContainerStacksService',
}));

vi.mock('../../domain/interfaces/container-stacks-repository-engine-service.interface', () => ({
  CONTAINER_STACKS_REPOSITORY_ENGINE_SERVICE: 'ContainerStacksRepositoryEngineService',
}));

vi.mock('../../domain/interfaces/container-repository-component-service.interface', () => ({
  CONTAINER_REPOSITORY_COMPONENT_SERVICE: 'ContainerRepositoryComponentService',
}));

// Mock repositories
vi.mock('../../domain/repositories/container-custom-stack-repository.interface', () => ({
  CONTAINER_CUSTOM_STACK_REPOSITORY: 'ContainerCustomStackRepository',
}));

vi.mock('../../domain/repositories/container-custom-stack-repository-repository.interface', () => ({
  CONTAINER_CUSTOM_STACK_REPOSITORY_REPOSITORY: 'ContainerCustomStackRepositoryRepository',
}));
