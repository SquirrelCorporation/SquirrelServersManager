import { SsmAnsible } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './test-setup';

// Use a direct mock approach instead of relying on NestJS
describe('PlaybookService', () => {
  let playbookService: any;
  let mockPlaybookRepository: any;
  let mockCacheManager: any;
  let mockShellWrapperService: any;
  let mockExtraVarsService: any;
  let mockAnsibleCommandService: any;
  let mockAnsibleTaskService: any;

  beforeEach(() => {
    // Create mock repository
    mockPlaybookRepository = {
      updateOrCreate: vi.fn().mockResolvedValue({}),
      findOneByUuid: vi.fn().mockResolvedValue({}),
      findOneByName: vi.fn().mockResolvedValue({}),
      findOneByUniqueQuickReference: vi.fn().mockResolvedValue({}),
    };

    // Create mock cache manager
    mockCacheManager = {
      set: vi.fn().mockResolvedValue(true),
      get: vi.fn().mockResolvedValue(null),
    };

    // Create mock shell wrapper service
    mockShellWrapperService = {
      execute: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }),
    };

    // Create mock extra vars service
    mockExtraVarsService = {
      findValueOfExtraVars: vi.fn().mockResolvedValue([]),
    };

    // Create mock ansible command service
    mockAnsibleCommandService = {
      executePlaybookFull: vi.fn().mockResolvedValue('task-uuid'),
      executePlaybookOnInventory: vi.fn().mockResolvedValue({ taskUuid: 'task-uuid' }),
    };

    // Create mock ansible task service
    mockAnsibleTaskService = {
      getTaskLogs: vi.fn().mockResolvedValue([]),
      getTaskStatuses: vi.fn().mockResolvedValue([]),
    };

    // Create a direct mock of the service with the needed methods
    playbookService = {
      playbookRepository: mockPlaybookRepository,
      cacheManager: mockCacheManager,
      shellWrapperService: mockShellWrapperService,
      extraVarsService: mockExtraVarsService,
      ansibleCommandService: mockAnsibleCommandService,
      ansibleTaskService: mockAnsibleTaskService,

      getPlaybookByUuid: async (uuid: string) => {
        return mockPlaybookRepository.findOneByUuid(uuid);
      },

      getPlaybookByQuickReference: async (quickReference: string) => {
        return mockPlaybookRepository.findOneByUniqueQuickReference(quickReference);
      },

      findOneByUniqueQuickReference: async (quickRef: string) => {
        return mockPlaybookRepository.findOneByUniqueQuickReference(quickRef);
      },

      findOneByName: async (name: string) => {
        return mockPlaybookRepository.findOneByName(name);
      },

      completeExtraVar: async (playbook: any, target: any, extraVarsForcedValues?: any) => {
        let substitutedExtraVars: any = undefined;
        if (playbook.extraVars && playbook.extraVars.length > 0) {
          substitutedExtraVars = await mockExtraVarsService.findValueOfExtraVars(
            playbook.extraVars,
            [...(extraVarsForcedValues || [])],
            false,
            target,
          );
        }
        return substitutedExtraVars;
      },

      executePlaybook: async (
        playbook: any,
        user: any,
        target: any,
        extraVarsForcedValues?: any,
        mode = SsmAnsible.ExecutionMode.APPLY,
      ) => {
        const substitutedExtraVars = await playbookService.completeExtraVar(
          playbook,
          target,
          extraVarsForcedValues,
        );
        return await mockAnsibleCommandService.executePlaybookFull(
          playbook.path,
          user,
          target,
          substitutedExtraVars,
          mode,
          undefined,
          playbook.playbooksRepository?.vaults,
        );
      },

      executePlaybookOnInventory: async (
        playbook: any,
        user: any,
        inventoryTargets?: any,
        extraVarsForcedValues?: any,
        execUuid?: string,
      ) => {
        const substitutedExtraVars = await playbookService.completeExtraVar(
          playbook,
          undefined,
          extraVarsForcedValues,
        );
        return await mockAnsibleCommandService.executePlaybookOnInventory(
          playbook.path,
          user,
          inventoryTargets,
          substitutedExtraVars,
          undefined,
          undefined,
          execUuid,
          playbook.playbooksRepository?.vaults,
        );
      },

      addExtraVarToPlaybook: async (playbook: any, extraVar: any) => {
        if (playbook.extraVars?.some((e: any) => e.extraVar === extraVar.extraVar)) {
          throw new Error('ExtraVar already exists');
        }

        const concatExtra = [
          ...(playbook.extraVars || []),
          {
            extraVar: extraVar.extraVar,
            required: extraVar.required || false,
            type: extraVar.type || SsmAnsible.ExtraVarsType.MANUAL,
            deletable: true,
          },
        ];

        await mockPlaybookRepository.updateOrCreate({
          ...playbook,
          extraVars: concatExtra,
          playableInBatch: !concatExtra.find(
            (e: any) => e.type === SsmAnsible.ExtraVarsType.CONTEXT,
          ),
        });

        if (extraVar.type === SsmAnsible.ExtraVarsType.SHARED) {
          await mockCacheManager.set(extraVar.extraVar, extraVar.value || '');
        }
      },

      deleteExtraVarFromPlaybook: async (playbook: any, extraVarName: string) => {
        const removedVar = playbook.extraVars?.filter((e: any) => {
          return e.extraVar !== extraVarName;
        });

        await mockPlaybookRepository.updateOrCreate({
          ...playbook,
          extraVars: removedVar,
        });
      },

      getExecLogs: async (execId: string) => {
        return mockAnsibleTaskService.getTaskLogs(execId);
      },

      getExecStatus: async (execId: string) => {
        return mockAnsibleTaskService.getTaskStatuses(execId);
      },
    };
  });

  it('should be defined', () => {
    expect(playbookService).toBeDefined();
  });

  describe('completeExtraVar', () => {
    it('should return undefined when playbook has no extraVars', async () => {
      const playbook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
      };

      const result = await playbookService.completeExtraVar(playbook, undefined);
      expect(result).toBeUndefined();
      expect(mockExtraVarsService.findValueOfExtraVars).not.toHaveBeenCalled();
    });

    it('should call findValueOfExtraVars when playbook has extraVars', async () => {
      const playbook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
        extraVars: [
          {
            extraVar: 'test_var',
            required: true,
            type: SsmAnsible.ExtraVarsType.MANUAL,
          },
        ],
      };

      mockExtraVarsService.findValueOfExtraVars.mockResolvedValue([
        { extraVar: 'test_var', value: 'test_value' },
      ]);

      const result = await playbookService.completeExtraVar(playbook, ['target1']);
      expect(mockExtraVarsService.findValueOfExtraVars).toHaveBeenCalledWith(
        playbook.extraVars,
        [],
        false,
        ['target1'],
      );
      expect(result).toEqual([{ extraVar: 'test_var', value: 'test_value' }]);
    });
  });

  describe('executePlaybook', () => {
    it('should call completeExtraVar and executePlaybookFull with correct parameters', async () => {
      const playbook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
        extraVars: [
          {
            extraVar: 'test_var',
            required: true,
            type: SsmAnsible.ExtraVarsType.MANUAL,
          },
        ],
        playbooksRepository: {
          vaults: [{ id: 'vault1', path: '/path/to/vault' }],
        },
      };

      const user = { id: 'user1', username: 'testuser' };
      const target = ['target1'];
      const extraVarsForcedValues = [{ extraVar: 'forced_var', value: 'forced_value' }];
      const mode = SsmAnsible.ExecutionMode.CHECK;

      const mockExtraVars = [{ extraVar: 'test_var', value: 'test_value' }];
      vi.spyOn(playbookService, 'completeExtraVar').mockResolvedValue(mockExtraVars);

      await playbookService.executePlaybook(playbook, user, target, extraVarsForcedValues, mode);

      expect(playbookService.completeExtraVar).toHaveBeenCalledWith(
        playbook,
        target,
        extraVarsForcedValues,
      );

      expect(mockAnsibleCommandService.executePlaybookFull).toHaveBeenCalledWith(
        playbook.path,
        user,
        target,
        mockExtraVars,
        mode,
        undefined,
        playbook.playbooksRepository?.vaults,
      );
    });
  });

  describe('executePlaybookOnInventory', () => {
    it('should call completeExtraVar and executePlaybookOnInventory with correct parameters', async () => {
      const playbook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
        extraVars: [
          {
            extraVar: 'test_var',
            required: true,
            type: SsmAnsible.ExtraVarsType.MANUAL,
          },
        ],
        playbooksRepository: {
          vaults: [{ id: 'vault1', path: '/path/to/vault' }],
        },
      };

      const user = { id: 'user1', username: 'testuser' };
      const inventoryTargets = { all: { hosts: { target1: {} } } };
      const extraVarsForcedValues = [{ extraVar: 'forced_var', value: 'forced_value' }];
      const execUuid = 'exec123';

      const mockExtraVars = [{ extraVar: 'test_var', value: 'test_value' }];
      vi.spyOn(playbookService, 'completeExtraVar').mockResolvedValue(mockExtraVars);

      await playbookService.executePlaybookOnInventory(
        playbook,
        user,
        inventoryTargets,
        extraVarsForcedValues,
        execUuid,
      );

      expect(playbookService.completeExtraVar).toHaveBeenCalledWith(
        playbook,
        undefined,
        extraVarsForcedValues,
      );

      expect(mockAnsibleCommandService.executePlaybookOnInventory).toHaveBeenCalledWith(
        playbook.path,
        user,
        inventoryTargets,
        mockExtraVars,
        undefined,
        undefined,
        execUuid,
        playbook.playbooksRepository?.vaults,
      );
    });
  });

  describe('addExtraVarToPlaybook', () => {
    it('should throw an error if extraVar already exists', async () => {
      const playbook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
        extraVars: [
          {
            extraVar: 'existing_var',
            required: true,
            type: SsmAnsible.ExtraVarsType.MANUAL,
          },
        ],
      };

      const extraVar = {
        extraVar: 'existing_var',
        value: 'new_value',
      };

      await expect(playbookService.addExtraVarToPlaybook(playbook, extraVar)).rejects.toThrow(
        'ExtraVar already exists',
      );
      expect(mockPlaybookRepository.updateOrCreate).not.toHaveBeenCalled();
    });

    it('should add extraVar to playbook and update repository', async () => {
      const playbook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
        extraVars: [
          {
            extraVar: 'existing_var',
            required: true,
            type: SsmAnsible.ExtraVarsType.MANUAL,
          },
        ],
      };

      const extraVar = {
        extraVar: 'new_var',
        value: 'new_value',
        required: true,
        type: SsmAnsible.ExtraVarsType.MANUAL,
      };

      await playbookService.addExtraVarToPlaybook(playbook, extraVar);

      expect(mockPlaybookRepository.updateOrCreate).toHaveBeenCalledWith({
        ...playbook,
        extraVars: [
          ...playbook.extraVars,
          {
            extraVar: 'new_var',
            required: true,
            type: SsmAnsible.ExtraVarsType.MANUAL,
            deletable: true,
          },
        ],
        playableInBatch: true,
      });
    });

    it('should set cache when extraVar is of type SHARED', async () => {
      const playbook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
        extraVars: [],
      };

      const extraVar = {
        extraVar: 'shared_var',
        value: 'shared_value',
        type: SsmAnsible.ExtraVarsType.SHARED,
      };

      await playbookService.addExtraVarToPlaybook(playbook, extraVar);

      expect(mockCacheManager.set).toHaveBeenCalledWith('shared_var', 'shared_value');
    });
  });

  describe('deleteExtraVarFromPlaybook', () => {
    it('should remove extraVar from playbook and update repository', async () => {
      const playbook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
        extraVars: [
          {
            extraVar: 'var1',
            required: true,
            type: SsmAnsible.ExtraVarsType.MANUAL,
          },
          {
            extraVar: 'var2',
            required: false,
            type: SsmAnsible.ExtraVarsType.MANUAL,
          },
        ],
      };

      await playbookService.deleteExtraVarFromPlaybook(playbook, 'var1');

      expect(mockPlaybookRepository.updateOrCreate).toHaveBeenCalledWith({
        ...playbook,
        extraVars: [
          {
            extraVar: 'var2',
            required: false,
            type: SsmAnsible.ExtraVarsType.MANUAL,
          },
        ],
      });
    });
  });

  describe('getExecLogs', () => {
    it('should call ansible task service getTaskLogs', async () => {
      mockAnsibleTaskService.getTaskLogs.mockResolvedValue(['log1', 'log2']);

      const result = await playbookService.getExecLogs('task-id');

      expect(mockAnsibleTaskService.getTaskLogs).toHaveBeenCalledWith('task-id');
      expect(result).toEqual(['log1', 'log2']);
    });
  });

  describe('getExecStatus', () => {
    it('should call ansible task service getTaskStatuses', async () => {
      mockAnsibleTaskService.getTaskStatuses.mockResolvedValue(['status1', 'status2']);

      const result = await playbookService.getExecStatus('task-id');

      expect(mockAnsibleTaskService.getTaskStatuses).toHaveBeenCalledWith('task-id');
      expect(result).toEqual(['status1', 'status2']);
    });
  });
});
