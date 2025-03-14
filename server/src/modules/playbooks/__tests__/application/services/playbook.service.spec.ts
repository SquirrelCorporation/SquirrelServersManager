import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PlaybookService } from '../../../application/services/playbook.service';
import { PLAYBOOK_REPOSITORY } from '../../../domain/repositories/playbook-repository.interface';
import { IPlaybook } from '../../../domain/entities/playbook.entity';
import { API, SsmAnsible } from 'ssm-shared-lib';

describe('PlaybookService', () => {
  let playbookService: PlaybookService;
  let mockPlaybookRepository: any;
  let mockCacheService: any;
  let mockShellWrapperService: any;
  let mockExtraVarsService: any;
  let mockAnsibleCommandService: any;

  beforeEach(async () => {
    mockPlaybookRepository = {
      updateOrCreate: vi.fn().mockResolvedValue({}),
      findById: vi.fn().mockResolvedValue({}),
    };

    mockCacheService = {
      set: vi.fn().mockResolvedValue(true),
      get: vi.fn().mockResolvedValue(null),
    };

    mockShellWrapperService = {
      execute: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }),
    };

    mockExtraVarsService = {
      findValueOfExtraVars: vi.fn().mockResolvedValue([]),
    };

    mockAnsibleCommandService = {
      executePlaybookFull: vi.fn().mockResolvedValue({}),
      executePlaybookOnInventory: vi.fn().mockResolvedValue({}),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        PlaybookService,
        {
          provide: PLAYBOOK_REPOSITORY,
          useValue: mockPlaybookRepository,
        },
        {
          provide: 'ICacheService',
          useValue: mockCacheService,
        },
        {
          provide: 'SHELL_WRAPPER_SERVICE',
          useValue: mockShellWrapperService,
        },
        {
          provide: 'ExtraVarsService',
          useValue: mockExtraVarsService,
        },
        {
          provide: 'AnsibleCommandService',
          useValue: mockAnsibleCommandService,
        },
      ],
    })
      .overrideProvider('ExtraVarsService')
      .useValue(mockExtraVarsService)
      .overrideProvider('AnsibleCommandService')
      .useValue(mockAnsibleCommandService)
      .compile();

    playbookService = moduleRef.get<PlaybookService>(PlaybookService);
  });

  it('should be defined', () => {
    expect(playbookService).toBeDefined();
  });

  describe('completeExtraVar', () => {
    it('should return undefined when playbook has no extraVars', async () => {
      const playbook: IPlaybook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
      };

      const result = await playbookService.completeExtraVar(playbook, undefined);
      expect(result).toBeUndefined();
      expect(mockExtraVarsService.findValueOfExtraVars).not.toHaveBeenCalled();
    });

    it('should call findValueOfExtraVars when playbook has extraVars', async () => {
      const playbook: IPlaybook = {
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
      const playbook: IPlaybook = {
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

      await playbookService.executePlaybook(playbook, user as any, target, extraVarsForcedValues, mode);

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
      const playbook: IPlaybook = {
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
        user as any,
        inventoryTargets as any,
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
      const playbook: IPlaybook = {
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

      const extraVar: API.ExtraVar = {
        extraVar: 'existing_var',
        value: 'new_value',
      };

      await expect(playbookService.addExtraVarToPlaybook(playbook, extraVar)).rejects.toThrow(
        'ExtraVar already exists',
      );
      expect(mockPlaybookRepository.updateOrCreate).not.toHaveBeenCalled();
    });

    it('should add extraVar to playbook and update repository', async () => {
      const playbook: IPlaybook = {
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

      const extraVar: API.ExtraVar = {
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
      const playbook: IPlaybook = {
        uuid: '123',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
        extraVars: [],
      };

      const extraVar: API.ExtraVar = {
        extraVar: 'shared_var',
        value: 'shared_value',
        type: SsmAnsible.ExtraVarsType.SHARED,
      };

      await playbookService.addExtraVarToPlaybook(playbook, extraVar);

      expect(mockCacheService.set).toHaveBeenCalledWith('shared_var', 'shared_value');
    });
  });

  describe('deleteExtraVarFromPlaybook', () => {
    it('should remove extraVar from playbook and update repository', async () => {
      const playbook: IPlaybook = {
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
});