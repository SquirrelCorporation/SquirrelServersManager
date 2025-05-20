import { vi } from 'vitest';
import { SsmAnsible } from 'ssm-shared-lib';

// Mock dependencies
vi.mock('@nestjs/common', () => {
  return {
    Get: () => vi.fn(),
    Post: () => vi.fn(),
    Patch: () => vi.fn(),
    Delete: () => vi.fn(),
    Param: () => vi.fn(),
    Body: () => vi.fn(),
    Controller: () => vi.fn(),
    Injectable: () => vi.fn(),
    Module: () => vi.fn(),
    Inject: () => vi.fn(),
    forwardRef: () => vi.fn(),
    Global: () => vi.fn(),
  };
});

vi.mock('@nestjs/testing', () => {
  return {
    Test: {
      createTestingModule: vi.fn().mockImplementation((options) => {
        return {
          compile: vi.fn().mockImplementation(() => {
            const providers = options.providers || [];
            const controllers = options.controllers || [];
            
            const providerInstances = {};
            
            // Create instances for all providers
            providers.forEach((provider) => {
              if (typeof provider === 'function') {
                providerInstances[provider.name] = new provider();
              } else if (provider.provide && provider.useValue) {
                providerInstances[provider.provide.name || provider.provide] = provider.useValue;
              }
            });
            
            // Create controller instances
            const controllerInstances = {};
            controllers.forEach((controller) => {
              if (typeof controller === 'function') {
                controllerInstances[controller.name] = new controller();
              }
            });
            
            return {
              get: vi.fn().mockImplementation((target) => {
                // Return the controller instance
                if (target.name && controllerInstances[target.name]) {
                  return controllerInstances[target.name];
                }
                
                // If target is a string token, try to find it in providers
                if (typeof target === 'string' && providerInstances[target]) {
                  return providerInstances[target];
                }
                
                // Otherwise, return the provider instance
                return providerInstances[target.name || target];
              }),
              resolve: vi.fn(),
              init: vi.fn(),
              close: vi.fn(),
            };
          }),
          overrideProvider: vi.fn().mockReturnThis(),
          useMocker: vi.fn().mockReturnThis(),
        };
      }),
    },
  };
});

// Mock PlaybookService
vi.mock('../../../application/services/playbook.service', () => {
  return {
    PlaybookService: vi.fn().mockImplementation(() => ({
      executePlaybook: vi.fn().mockResolvedValue({ taskUuid: 'task-uuid' }),
      executePlaybookOnInventory: vi.fn().mockResolvedValue({ taskUuid: 'task-uuid' }),
      addExtraVarToPlaybook: vi.fn().mockResolvedValue({}),
      deleteExtraVarFromPlaybook: vi.fn().mockResolvedValue({}),
      getExecLogs: vi.fn().mockResolvedValue([]),
      getExecStatus: vi.fn().mockResolvedValue([]),
    })),
  };
});

// Mock PlaybookRepository
vi.mock('../../../infrastructure/repositories/playbook.repository', () => {
  const mockPlaybook = {
    uuid: 'playbook-uuid',
    name: 'Test Playbook',
    path: '/path/to/playbook.yml',
    custom: true,
    extraVars: [
      {
        extraVar: 'test_var',
        required: true,
        type: SsmAnsible.ExtraVarsType.MANUAL,
      },
    ],
    playbooksRepository: {
      uuid: 'repo-uuid',
      name: 'Test Repository',
      type: 'local',
      enabled: true,
      directory: '/path/to/repo',
    },
  };

  return {
    PlaybookRepository: vi.fn().mockImplementation(() => ({
      findAllWithActiveRepositories: vi.fn().mockResolvedValue([mockPlaybook]),
      findOneByUuid: vi.fn().mockResolvedValue(mockPlaybook),
      findOneByUniqueQuickReference: vi.fn().mockResolvedValue(mockPlaybook),
      updateOrCreate: vi.fn().mockResolvedValue(mockPlaybook),
      deleteByUuid: vi.fn().mockResolvedValue({}),
    })),
  };
});

// Mock PlaybookFileService
vi.mock('@modules/shell', () => {
  return {
    PlaybookFileService: vi.fn().mockImplementation(() => ({
      readPlaybook: vi.fn().mockResolvedValue({ content: 'playbook content' }),
      editPlaybook: vi.fn().mockResolvedValue({ success: true }),
      testExistence: vi.fn().mockResolvedValue(true),
    })),
  };
});

// Mock User decorator
vi.mock('src/decorators/user.decorator', () => {
  return {
    User: () => vi.fn(),
  };
});

// Mock types
vi.mock('src/types/typings', () => {
  return {
    Playbooks: {
      All: {},
      HostGroups: {},
    },
  };
});

// Mock shared lib
vi.mock('ssm-shared-lib', () => {
  return {
    API: {
      ExtraVar: {},
      ExtraVars: {},
    },
    SsmAnsible: {
      ExecutionMode: {
        APPLY: 'apply',
        CHECK: 'check',
      },
      ExtraVarsType: {
        MANUAL: 'manual',
      },
    },
  };
});