import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../test-setup';
import { IDeviceAuthService } from '../../../../devices/domain/services/device-auth-service.interface';
import { IShellWrapperService } from '../../../../shell/domain/interfaces/shell-wrapper.interface';
import { ISshKeyService } from '../../../../shell/domain/interfaces/ssh-key.interface';
import { AnsibleCommandBuilderService } from '../../../application/services/ansible-command-builder.service';
import { AnsibleCommandService } from '../../../application/services/ansible-command.service';
import { AnsibleGalaxyCommandService } from '../../../application/services/ansible-galaxy-command.service';
import { InventoryTransformerService } from '../../../application/services/inventory-transformer.service';
import { IAnsibleTaskRepository } from '../../../domain/repositories/ansible-task.repository.interface';

vi.mock('@modules/statistics', () => ({
  DEVICE_WENT_OFFLINE_EVENT: 'device.went.offline',
  DEVICE_WENT_ONLINE_EVENT: 'device.went.online',
}));

vi.mock('../../../../playbooks/infrastructure/schemas/playbooks-register.schema', () => ({
  PlaybooksRegister: vi.fn(),
  PlaybooksRegisterSchema: vi.fn(),
}));

vi.mock('@infrastructure/security/vault-crypto/services/vault.service', () => ({
  VaultService: class {
    constructor() {}
    encrypt() {
      return Promise.resolve('encrypted');
    }
    decrypt() {
      return Promise.resolve('decrypted');
    }
    decryptSync() {
      return 'decrypted';
    }
  },
}));

vi.mock('../../../../config', () => ({
  SSM_INSTALL_PATH: '/test/path',
  VAULT_PWD: 'test-password',
}));

vi.mock('../../../../types/typings', () => ({
  Playbooks: {
    All: vi.fn(),
    HostGroups: vi.fn(),
  },
}));

vi.mock('ssm-shared-lib', () => ({
  API: {
    ExtraVars: vi.fn(),
  },
  SsmAnsible: {
    ExecutionMode: {
      APPLY: 'apply',
      CHECK: 'check',
    },
  },
  SsmStatus: {
    DeviceStatus: {
      ONLINE: 1,
      OFFLINE: 0,
      UNKNOWN: -1,
    },
  },
}));

vi.mock('../../../../devices/infrastructure/schemas/device.schema', () => ({
  Device: vi.fn(),
  DeviceSchema: vi.fn(),
  DEVICE: 'Device',
}));

vi.mock('../../../../devices/infrastructure/schemas/device-auth.schema', () => ({
  DeviceAuth: vi.fn(),
  DeviceAuthSchema: vi.fn(),
  DEVICE_AUTH: 'DeviceAuth',
}));

vi.mock('../../../../ansible-vaults/application/services/vault-crypto.service', () => ({
  VaultCryptoService: class {
    constructor() {}
    encrypt() {
      return Promise.resolve('encrypted');
    }
    decrypt() {
      return Promise.resolve('decrypted');
    }
    decryptSync() {
      return 'decrypted';
    }
  },
  DEFAULT_VAULT_ID: 'ssm',
}));

vi.mock('@infrastructure/common/query/pagination.util', () => ({
  paginate: <T>(data: T[], current = 1, pageSize = 10): T[] => {
    if (!data) {
      return [];
    }
    return [...data].slice((current - 1) * pageSize, current * pageSize);
  },
}));

vi.mock('@infrastructure/common/query/sorter.util', () => ({
  sortByFields: <T>(data: T[], params: any): T[] => {
    if (params?.sorter) {
      return [...data].sort((a: any, b: any) => {
        const field = Object.keys(params.sorter)[0];
        const order = params.sorter[field];
        return order === 'ascend' ? a[field] - b[field] : b[field] - a[field];
      });
    }
    return [...data];
  },
}));

vi.mock('@infrastructure/common/query/filter.util', () => ({
  filterByFields: <T>(data: T[], params: any): T[] => {
    if (params?.filter) {
      return [...data].filter((item: any) => {
        return Object.entries(params.filter).every(([key, value]) => item[key] === value);
      });
    }
    return [...data];
  },
  filterByQueryParams: <T>(data: T[], params: any, fields: string[]): T[] => {
    if (params && fields.length > 0) {
      return [...data].filter((item: any) => {
        return fields.some((field) => {
          const value = params[field];
          return value ? item[field] === value : true;
        });
      });
    }
    return [...data];
  },
}));

vi.mock('@infrastructure/exceptions/app-exceptions', () => ({
  AppException: class extends Error {
    statusCode: number;
    errorType: string;
    errorData?: any;

    constructor(message: string, statusCode: number, errorType: string, errorData?: any) {
      super(message);
      this.name = 'AppException';
      this.statusCode = statusCode;
      this.errorType = errorType;
      this.errorData = errorData;
    }
  },
  UnauthorizedException: class extends Error {
    errorData?: any;

    constructor(message = 'Invalid credentials', errorData?: any) {
      super(message);
      this.name = 'UnauthorizedException';
      this.errorData = errorData;
    }
  },
  ForbiddenException: class extends Error {
    errorData?: any;

    constructor(message = 'Permission denied', errorData?: any) {
      super(message);
      this.name = 'ForbiddenException';
      this.errorData = errorData;
    }
  },
  NotFoundException: class extends Error {
    errorData?: any;

    constructor(message = 'Resource not found', errorData?: any) {
      super(message);
      this.name = 'NotFoundException';
      this.errorData = errorData;
    }
  },
  BadRequestException: class extends Error {
    errorData?: any;

    constructor(message = 'Invalid request data', errorData?: any) {
      super(message);
      this.name = 'BadRequestException';
      this.errorData = errorData;
    }
  },
  ConflictException: class extends Error {
    errorData?: any;

    constructor(message = 'Resource conflict', errorData?: any) {
      super(message);
      this.name = 'ConflictException';
      this.errorData = errorData;
    }
  },
  InternalServerException: class extends Error {
    errorData?: any;

    constructor(message = 'Internal server error', errorData?: any) {
      super(message);
      this.name = 'InternalServerException';
      this.errorData = errorData;
    }
  },
  ServiceUnavailableException: class extends Error {
    errorData?: any;

    constructor(message = 'Service unavailable', errorData?: any) {
      super(message);
      this.name = 'ServiceUnavailableException';
      this.errorData = errorData;
    }
  },
  EntityNotFoundException: class extends Error {
    entityName: string;
    identifier?: string | number;

    constructor(entityName: string, identifier?: string | number) {
      const message = `${entityName}${identifier ? ` with ID ${identifier}` : ''} not found`;
      super(message);
      this.name = 'EntityNotFoundException';
      this.entityName = entityName;
      this.identifier = identifier;
    }
  },
  ValidationException: class extends Error {
    validationErrors?: Record<string, string[]>;

    constructor(message = 'Validation failed', validationErrors?: Record<string, string[]>) {
      super(message);
      this.name = 'ValidationException';
      this.validationErrors = validationErrors;
    }
  },
}));

vi.mock('@infrastructure/exceptions', () => {
  const AppException = class extends Error {
    statusCode: number;
    errorType: string;
    errorData?: any;

    constructor(message: string, statusCode: number, errorType: string, errorData?: any) {
      super(message);
      this.name = 'AppException';
      this.statusCode = statusCode;
      this.errorType = errorType;
      this.errorData = errorData;
    }
  };

  const UnauthorizedException = class extends Error {
    errorData?: any;

    constructor(message = 'Invalid credentials', errorData?: any) {
      super(message);
      this.name = 'UnauthorizedException';
      this.errorData = errorData;
    }
  };

  const ForbiddenException = class extends Error {
    errorData?: any;

    constructor(message = 'Permission denied', errorData?: any) {
      super(message);
      this.name = 'ForbiddenException';
      this.errorData = errorData;
    }
  };

  const NotFoundException = class extends Error {
    errorData?: any;

    constructor(message = 'Resource not found', errorData?: any) {
      super(message);
      this.name = 'NotFoundException';
      this.errorData = errorData;
    }
  };

  const BadRequestException = class extends Error {
    errorData?: any;

    constructor(message = 'Invalid request data', errorData?: any) {
      super(message);
      this.name = 'BadRequestException';
      this.errorData = errorData;
    }
  };

  const ConflictException = class extends Error {
    errorData?: any;

    constructor(message = 'Resource conflict', errorData?: any) {
      super(message);
      this.name = 'ConflictException';
      this.errorData = errorData;
    }
  };

  const InternalServerException = class extends Error {
    errorData?: any;

    constructor(message = 'Internal server error', errorData?: any) {
      super(message);
      this.name = 'InternalServerException';
      this.errorData = errorData;
    }
  };

  const ServiceUnavailableException = class extends Error {
    errorData?: any;

    constructor(message = 'Service unavailable', errorData?: any) {
      super(message);
      this.name = 'ServiceUnavailableException';
      this.errorData = errorData;
    }
  };

  const EntityNotFoundException = class extends Error {
    entityName: string;
    identifier?: string | number;

    constructor(entityName: string, identifier?: string | number) {
      const message = `${entityName}${identifier ? ` with ID ${identifier}` : ''} not found`;
      super(message);
      this.name = 'EntityNotFoundException';
      this.entityName = entityName;
      this.identifier = identifier;
    }
  };

  const ValidationException = class extends Error {
    validationErrors?: Record<string, string[]>;

    constructor(message = 'Validation failed', validationErrors?: Record<string, string[]>) {
      super(message);
      this.name = 'ValidationException';
      this.validationErrors = validationErrors;
    }
  };

  return {
    AppException,
    UnauthorizedException,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
    ConflictException,
    InternalServerException,
    ServiceUnavailableException,
    EntityNotFoundException,
    ValidationException,
    ExceptionFactory: {
      entityNotFound: (entityName: string, identifier?: string | number) => {
        return new EntityNotFoundException(entityName, identifier);
      },
      validationFailed: (
        validationErrors: Record<string, string[]>,
        message = 'Validation failed',
      ) => {
        return new ValidationException(message, validationErrors);
      },
      duplicateEntity: (entityName: string, identifier?: string) => {
        const message = `${entityName}${identifier ? ` with identifier ${identifier}` : ''} already exists`;
        return new ConflictException(message, { entityName, identifier });
      },
      invalidCredentials: (message = 'Invalid credentials') => {
        return new UnauthorizedException(message);
      },
      insufficientPermissions: (action: string, resource: string, message?: string) => {
        return new ForbiddenException(
          message || `You don't have permission to ${action} this ${resource}`,
          { action, resource },
        );
      },
    },
  };
});

vi.mock('@infrastructure/common/ansible/ansible-task.util', () => ({
  isFinalStatus: (status: string) => ['completed', 'failed', 'error'].includes(status),
}));

vi.mock('@infrastructure/common/docker/docker-compose.util', () => ({
  DockerComposeHelper: class {
    constructor() {}
    static parseYaml() {
      return {};
    }
    static stringifyYaml() {
      return '';
    }
  },
}));

vi.mock('@infrastructure/common/docker/docker-compose-json-transformer.util', () => ({
  transformToDockerCompose: () => ({}),
}));

vi.mock('@infrastructure/common/docker/utils', () => ({
  extractTopLevelName: (name: string) => name.split('/').pop() || '',
}));

vi.mock('@infrastructure/common/files/recursive-find.util', () => ({
  getMatchingFiles: () => [],
  FileInfo: class {
    constructor(
      public path: string,
      public name: string,
    ) {}
  },
}));

vi.mock('@infrastructure/common/directory-tree/directory-tree.util', () => ({
  directoryTree: () => ({}),
}));

vi.mock('@infrastructure/common/dns/dns.util', () => ({
  tryResolveHost: async () => '127.0.0.1',
}));

vi.mock('@infrastructure/adapters/ssh/ssh-credentials.adapter', () => ({
  SSHCredentialsAdapter: class {
    constructor() {}
    getCredentials() {
      return { username: 'test', password: 'test' };
    }
  },
}));

vi.mock('@infrastructure/adapters/ssh/custom-agent.adapter', () => ({
  getCustomAgent: () => null,
}));

vi.mock('@infrastructure/ssh/services/ssh-connection.service', () => ({
  SshConnectionService: class {
    constructor() {}
    connect() {
      return Promise.resolve();
    }
    disconnect() {
      return Promise.resolve();
    }
  },
}));

vi.mock('@infrastructure/prometheus/prometheus.service', () => ({
  PrometheusService: class {
    constructor() {}
    recordMetric() {}
  },
}));

vi.mock('@infrastructure/adapters/git/services/clone.service', () => ({
  clone: () => Promise.resolve(),
}));

vi.mock('@infrastructure/adapters/git/services/force-pull.service', () => ({
  forcePull: () => Promise.resolve(),
}));

vi.mock('@infrastructure/adapters/git/services/commit-and-sync.service', () => ({
  commitAndSync: () => Promise.resolve(),
}));

vi.mock('@infrastructure/adapters/git/services/init-git.service', () => ({
  IInitGitOptionsSyncImmediately: class {
    constructor() {}
  },
}));

describe('AnsibleCommandService', () => {
  let service: AnsibleCommandService;
  let mockShellWrapper: IShellWrapperService;
  let mockSshKeyService: ISshKeyService;
  let mockDeviceAuthService: IDeviceAuthService;
  let mockAnsibleTaskRepository: IAnsibleTaskRepository;
  let mockAnsibleCommandBuilder: AnsibleCommandBuilderService;
  let mockAnsibleGalaxyCommand: AnsibleGalaxyCommandService;
  let mockInventoryTransformer: InventoryTransformerService;

  beforeEach(() => {
    mockShellWrapper = {
      exec: vi.fn(),
    } as unknown as IShellWrapperService;

    mockSshKeyService = {
      generateSshKey: vi.fn(),
      removeSshKey: vi.fn(),
    } as unknown as ISshKeyService;

    mockDeviceAuthService = {
      findOne: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as IDeviceAuthService;

    mockAnsibleTaskRepository = {
      create: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as IAnsibleTaskRepository;

    mockAnsibleCommandBuilder = {
      buildPlaybookCommand: vi.fn(),
    } as unknown as AnsibleCommandBuilderService;

    mockAnsibleGalaxyCommand = {
      getInstallCollectionCmd: vi.fn().mockReturnValue('install-cmd'),
      getListCollectionsCmd: vi.fn().mockReturnValue('list-cmd'),
    } as unknown as AnsibleGalaxyCommandService;

    mockInventoryTransformer = {
      transformToInventory: vi.fn(),
    } as unknown as InventoryTransformerService;

    service = new AnsibleCommandService(
      mockShellWrapper,
      mockSshKeyService,
      mockDeviceAuthService,
      mockAnsibleTaskRepository,
      mockAnsibleCommandBuilder,
      mockAnsibleGalaxyCommand,
      mockInventoryTransformer,
    );
  });

  describe('executeCommand', () => {
    it('should execute a command and return stdout and stderr', () => {
      const mockResult = { stdout: 'success', stderr: '', code: 0 };
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

      const result = service.executeCommand('test-command');

      expect(mockShellWrapper.exec).toHaveBeenCalledWith('test-command');
      expect(result).toEqual({ stdout: 'success', stderr: '' });
    });

    it('should throw an error when command execution fails', () => {
      const mockError = new Error('Command failed');
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw mockError;
      });

      expect(() => service.executeCommand('test-command')).toThrow(mockError);
    });
  });

  describe('executeAnsibleCommand', () => {
    it('should execute an ansible command and return stdout, stderr, and exit code', () => {
      const mockResult = { stdout: 'success', stderr: '', code: 0 };
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

      const result = service.executeAnsibleCommand('ansible-command');

      expect(mockShellWrapper.exec).toHaveBeenCalledWith('ansible-command');
      expect(result).toEqual({ stdout: 'success', stderr: '', exitCode: 0 });
    });

    it('should throw an error when ansible command execution fails', () => {
      const mockError = new Error('Ansible command failed');
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw mockError;
      });

      expect(() => service.executeAnsibleCommand('ansible-command')).toThrow(mockError);
    });
  });

  describe('executePlaybookCommand', () => {
    it('should execute a playbook command', () => {
      const mockResult = { stdout: 'success', stderr: '', code: 0 };
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

      const result = service.executePlaybookCommand('playbook-command');

      expect(mockShellWrapper.exec).toHaveBeenCalledWith('playbook-command');
      expect(result).toEqual(mockResult);
    });

    it('should throw an error when playbook command execution fails', () => {
      const mockError = new Error('Playbook command failed');
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw mockError;
      });

      expect(() => service.executePlaybookCommand('playbook-command')).toThrow(mockError);
    });
  });

  describe('getAnsibleVersion', () => {
    it('should return ansible version', async () => {
      const mockResult = { toString: () => 'ansible 2.9.0' };
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>).mockReturnValue(mockResult);

      const result = await service.getAnsibleVersion();

      expect(mockShellWrapper.exec).toHaveBeenCalledWith('ansible --version');
      expect(result).toBe('ansible 2.9.0');
    });

    it('should throw an error when getting version fails', async () => {
      const mockError = new Error('Version check failed');
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw mockError;
      });

      await expect(service.getAnsibleVersion()).rejects.toThrow(mockError);
    });
  });

  describe('installAnsibleGalaxyCollection', () => {
    it('should install ansible galaxy collection', async () => {
      const mockInstallResult = { code: 0 };
      const mockListResult = { stdout: 'namespace.collection' };
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(mockInstallResult)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(mockListResult);

      await service.installAnsibleGalaxyCollection('collection', 'namespace');

      expect(mockShellWrapper.exec).toHaveBeenCalledWith('install-cmd');
      expect(mockShellWrapper.exec).toHaveBeenCalledWith(
        'list-cmd > /tmp/ansible-collection-output.tmp.txt',
      );
      expect(mockShellWrapper.exec).toHaveBeenCalledWith(
        'cat /tmp/ansible-collection-output.tmp.txt',
      );
    });

    it('should throw an error when installation fails', async () => {
      const mockError = new Error('Installation failed');
      (mockShellWrapper.exec as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw mockError;
      });

      await expect(
        service.installAnsibleGalaxyCollection('collection', 'namespace'),
      ).rejects.toThrow(mockError);
    });
  });
});
