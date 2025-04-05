// Import vitest functions first
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Now import real modules after mocks
import { ContainerStacksService } from '../../../application/services/container-stacks.service';
import {
  ContainerCustomStack,
  IContainerCustomStackRepositoryEntity,
} from '../../../domain/entities/container-custom-stack.entity';
import { IContainerCustomStackRepositoryRepository } from '../../../domain/repositories/container-custom-stack-repository-repository.interface';
import { IContainerCustomStackRepository } from '../../../domain/repositories/container-custom-stack-repository.interface';

// Mock ContainerCustomStacksRepositoryEngineService before importing actual service
vi.mock('../../../application/services/container-stacks-repository-engine-service', () => {
  const ContainerCustomStacksRepositoryEngineService = vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    registerRepository: vi.fn().mockResolvedValue(undefined),
    deregisterRepository: vi.fn().mockResolvedValue(undefined),
    getState: vi.fn().mockReturnValue({ stackRepository: {} }),
    clone: vi.fn().mockResolvedValue(undefined),
  }));

  return {
    ContainerCustomStacksRepositoryEngineService
  };
});

// Use vi.mock before importing any modules
vi.mock('@modules/playbooks', () => {
  return {
    IPlaybooksService: class {},
    PLAYBOOKS_SERVICE: 'PlaybooksService'
  };
});

vi.mock('@modules/shell', () => {
  return {
    IFileSystemService: class {},
    IDockerComposeService: class {},
    FILE_SYSTEM_SERVICE: 'FileSystemService',
    DOCKER_COMPOSE_SERVICE: 'DockerComposeService'
  };
});

vi.mock('@modules/ansible-vaults', () => {
  return {
    AnsibleVaultService: class {
      encrypt = vi.fn().mockImplementation((value) => `encrypted_${value}`);
      decrypt = vi.fn().mockImplementation((value) => value.replace('encrypted_', ''));
    },
    AnsibleVaultsModule: class {
      static forRoot() {
        return {
          module: class {},
          providers: []
        };
      }
    }
  };
});

vi.mock('@infrastructure/common/docker/docker-compose-json-transformer.util', () => {
  return {
    transformToDockerCompose: vi.fn().mockImplementation((json) => 'transformed yaml')
  };
});

// Mock additional node modules
vi.mock('uuid', () => {
  return {
    v4: vi.fn().mockReturnValue('mocked-uuid-v4')
  };
});

describe('ContainerStacksService', () => {
  let service: ContainerStacksService;
  let mockStackRepository: IContainerCustomStackRepository;
  let mockRepositoryRepository: IContainerCustomStackRepositoryRepository;
  let mockContainerCustomStacksRepositoryEngine: any;
  let mockFileSystemService: any;
  let mockDockerComposeService: any;
  let mockPlaybooksService: any;

  const mockStack: ContainerCustomStack = {
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Stack',
  };

  const mockRepo: IContainerCustomStackRepositoryEntity = {
    uuid: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Test Repository',
  };

  beforeEach(() => {
    mockStackRepository = {
      findAll: vi.fn().mockResolvedValue([mockStack]),
      findByUuid: vi.fn().mockResolvedValue(mockStack),
      create: vi.fn().mockResolvedValue(mockStack),
      update: vi.fn().mockResolvedValue(mockStack),
      deleteByUuid: vi.fn().mockResolvedValue(true),
      listAllByRepository: vi.fn().mockResolvedValue([mockStack]),
    };

    mockRepositoryRepository = {
      findAll: vi.fn().mockResolvedValue([mockRepo]),
      findByUuid: vi.fn().mockResolvedValue(mockRepo),
      create: vi.fn().mockResolvedValue(mockRepo),
      update: vi.fn().mockResolvedValue(mockRepo),
      deleteByUuid: vi.fn().mockResolvedValue(true),
    };

    mockContainerCustomStacksRepositoryEngine = {
      init: vi.fn().mockResolvedValue(undefined),
      registerRepository: vi.fn().mockResolvedValue(undefined),
      deregisterRepository: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn().mockReturnValue({ stackRepository: {} }),
      clone: vi.fn().mockResolvedValue(undefined),
    };

    mockFileSystemService = {
      createDirectory: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockResolvedValue(undefined),
      readFile: vi.fn().mockResolvedValue('file content'),
    };

    mockDockerComposeService = {
      dockerComposeDryRun: vi.fn().mockReturnValue({ code: 0, stderr: '' }),
    };

    mockPlaybooksService = {
      getPlaybookByQuickReference: vi.fn().mockResolvedValue({
        uuid: 'playbook-uuid',
        name: 'deploy'
      }),
      executePlaybook: vi.fn().mockResolvedValue('exec-id'),
    };

    service = new ContainerStacksService(
      mockStackRepository,
      mockRepositoryRepository,
      mockContainerCustomStacksRepositoryEngine,
      mockFileSystemService,
      mockDockerComposeService,
      mockPlaybooksService
    );

    // Mock initializeRepositories to prevent it from being called in constructor
    vi.spyOn(service as any, 'initializeRepositories').mockImplementation(() => {});
  });

  describe('Stack operations', () => {
    it('should get all stacks', async () => {
      const result = await service.getAllStacks();
      expect(result).toEqual([mockStack]);
      expect(mockStackRepository.findAll).toHaveBeenCalled();
    });

    it('should get a stack by UUID', async () => {
      const result = await service.getStackByUuid('123');
      expect(result).toEqual(mockStack);
      expect(mockStackRepository.findByUuid).toHaveBeenCalledWith('123');
    });

    it('should create a stack', async () => {
      const result = await service.createStack(mockStack);
      expect(result).toEqual(mockStack);
      expect(mockStackRepository.create).toHaveBeenCalledWith(mockStack);
    });

    it('should update a stack', async () => {
      const updateData = { name: 'Updated Stack' };
      const result = await service.updateStack('123', updateData);
      expect(result).toEqual(mockStack);
      expect(mockStackRepository.update).toHaveBeenCalledWith('123', updateData);
    });

    it('should delete a stack', async () => {
      const result = await service.deleteStackByUuid('123');
      expect(result).toBe(true);
      expect(mockStackRepository.deleteByUuid).toHaveBeenCalledWith('123');
    });
  });

  describe('Repository operations', () => {
    it('should get all repositories', async () => {
      const result = await service.getAllRepositories();
      expect(result).toEqual([mockRepo]);
      expect(mockRepositoryRepository.findAll).toHaveBeenCalled();
    });

    it('should get a repository by UUID', async () => {
      const result = await service.getRepositoryByUuid('123');
      expect(result).toEqual(mockRepo);
      expect(mockRepositoryRepository.findByUuid).toHaveBeenCalledWith('123');
    });

    it('should create a repository', async () => {
      const result = await service.createRepository(mockRepo);
      expect(result).toEqual(mockRepo);
      expect(mockRepositoryRepository.create).toHaveBeenCalledWith(mockRepo);
    });

    it('should update a repository', async () => {
      const updateData = { name: 'Updated Repository' };
      const result = await service.updateRepository('123', updateData);
      expect(result).toEqual(mockRepo);
      expect(mockRepositoryRepository.update).toHaveBeenCalledWith('123', updateData);
    });

    it('should delete a repository', async () => {
      const result = await service.deleteRepositoryByUuid('123');
      expect(result).toBe(true);
      expect(mockRepositoryRepository.deleteByUuid).toHaveBeenCalledWith('123');
    });
  });
});
