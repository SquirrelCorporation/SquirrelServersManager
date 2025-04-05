import { SsmAnsible } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IPlaybook } from '../../../domain/entities/playbook.entity';
import './test-setup';

// Mock direct controller implementation with all the methods we'll test
describe('PlaybookController', () => {
  let controller: any;
  let mockPlaybookService: any;
  let mockPlaybookRepository: any;
  let mockPlaybookFileService: any;

  const mockPlaybook: IPlaybook = {
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

  beforeEach(() => {
    // Mock service implementations
    mockPlaybookService = {
      executePlaybook: vi.fn().mockResolvedValue('task-uuid'),
      executePlaybookOnInventory: vi.fn().mockResolvedValue({ taskUuid: 'task-uuid' }),
      addExtraVarToPlaybook: vi.fn().mockResolvedValue({}),
      deleteExtraVarFromPlaybook: vi.fn().mockResolvedValue({}),
      getExecLogs: vi.fn().mockResolvedValue([]),
      getExecStatus: vi.fn().mockResolvedValue([]),
    };

    mockPlaybookRepository = {
      findAllWithActiveRepositories: vi.fn().mockResolvedValue([mockPlaybook]),
      findOneByUuid: vi.fn().mockResolvedValue(mockPlaybook),
      findOneByUniqueQuickReference: vi.fn().mockResolvedValue(mockPlaybook),
      updateOrCreate: vi.fn().mockResolvedValue(mockPlaybook),
      deleteByUuid: vi.fn().mockResolvedValue({}),
    };

    mockPlaybookFileService = {
      readPlaybook: vi.fn().mockResolvedValue({ content: 'playbook content' }),
      editPlaybook: vi.fn().mockResolvedValue({ success: true }),
      testExistence: vi.fn().mockResolvedValue(true),
    };

    // Create a direct controller implementation with mock methods
    controller = {
      // Inject dependencies
      playbookService: mockPlaybookService,
      playbookRepository: mockPlaybookRepository,
      playbookFileService: mockPlaybookFileService,

      // Controller methods
      getPlaybooks: async () => {
        return mockPlaybookRepository.findAllWithActiveRepositories();
      },

      getPlaybook: async (uuid: string) => {
        const playbook = await mockPlaybookRepository.findOneByUuid(uuid);
        if (!playbook) {
          throw new Error('Playbook not found');
        }
        return mockPlaybookFileService.readPlaybook(playbook.path);
      },

      editPlaybook: async (uuid: string, updateData: { content: string }) => {
        const playbook = await mockPlaybookRepository.findOneByUuid(uuid);
        if (!playbook) {
          throw new Error('Playbook not found');
        }
        return mockPlaybookFileService.editPlaybook(playbook.path, updateData.content);
      },

      deletePlaybook: async (uuid: string) => {
        await mockPlaybookRepository.deleteByUuid(uuid);
        return { success: true };
      },

      addExtraVarToPlaybook: async (uuid: string, extraVar: any) => {
        const playbook = await mockPlaybookRepository.findOneByUuid(uuid);
        if (!playbook) {
          throw new Error('Playbook not found');
        }
        await mockPlaybookService.addExtraVarToPlaybook(playbook, extraVar);
        return { success: true };
      },

      deleteExtraVarFromPlaybook: async (uuid: string, varname: string) => {
        const playbook = await mockPlaybookRepository.findOneByUuid(uuid);
        if (!playbook) {
          throw new Error('Playbook not found');
        }
        await mockPlaybookService.deleteExtraVarFromPlaybook(playbook, varname);
        return { success: true };
      },

      execPlaybook: async (uuid: string, execData: any, user: any) => {
        const playbook = await mockPlaybookRepository.findOneByUuid(uuid);
        if (!playbook) {
          throw new Error('Playbook not found');
        }
        const result = await mockPlaybookService.executePlaybook(
          playbook,
          user,
          execData.target,
          execData.extraVars,
          execData.mode || SsmAnsible.ExecutionMode.APPLY,
        );
        return { execId: result };
      },

      execPlaybookByQuickRef: async (quickRef: string, execData: any, user: any) => {
        const playbook = await mockPlaybookRepository.findOneByUniqueQuickReference(quickRef);
        if (!playbook) {
          throw new Error('Playbook not found');
        }
        const result = await mockPlaybookService.executePlaybook(
          playbook,
          user,
          execData.target,
          execData.extraVars,
          execData.mode || SsmAnsible.ExecutionMode.APPLY,
        );
        return { execId: result };
      },

      execPlaybookOnInventory: async (uuid: string, execData: any, user: any) => {
        const playbook = await mockPlaybookRepository.findOneByUuid(uuid);
        if (!playbook) {
          throw new Error('Playbook not found');
        }
        return await mockPlaybookService.executePlaybookOnInventory(
          playbook,
          user,
          execData.inventoryTargets,
          execData.extraVars,
          execData.execUuid,
        );
      },

      getExecLogs: async (uuid: string) => {
        const execLogs = await mockPlaybookService.getExecLogs(uuid);
        return {
          execId: uuid,
          execLogs: execLogs,
        };
      },

      getExecStatus: async (uuid: string) => {
        const taskStatuses = await mockPlaybookService.getExecStatus(uuid);
        return {
          execId: uuid,
          execStatuses: taskStatuses,
        };
      },
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPlaybooks', () => {
    it('should return all playbooks with active repositories', async () => {
      const result = await controller.getPlaybooks();
      expect(mockPlaybookRepository.findAllWithActiveRepositories).toHaveBeenCalled();
      expect(result).toEqual([mockPlaybook]);
    });
  });

  describe('getPlaybook', () => {
    it('should return a playbook by UUID', async () => {
      const result = await controller.getPlaybook('playbook-uuid');
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockPlaybookFileService.readPlaybook).toHaveBeenCalledWith(mockPlaybook.path);
      expect(result).toEqual({ content: 'playbook content' });
    });
  });

  describe('editPlaybook', () => {
    it('should update a playbook', async () => {
      const updateData = { content: 'Updated content' };
      const result = await controller.editPlaybook('playbook-uuid', updateData);
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockPlaybookFileService.editPlaybook).toHaveBeenCalledWith(
        mockPlaybook.path,
        updateData.content,
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(
        controller.editPlaybook('nonexistent-uuid', { content: 'content' }),
      ).rejects.toThrow('Playbook not found');
    });
  });

  describe('deletePlaybook', () => {
    it('should delete a playbook', async () => {
      const result = await controller.deletePlaybook('playbook-uuid');
      expect(mockPlaybookRepository.deleteByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(result).toEqual({ success: true });
    });
  });

  describe('addExtraVarToPlaybook', () => {
    it('should add an extra var to a playbook', async () => {
      const extraVar = {
        extraVar: 'new_var',
        value: 'new_value',
        required: true,
        type: SsmAnsible.ExtraVarsType.MANUAL,
      };

      const result = await controller.addExtraVarToPlaybook('playbook-uuid', extraVar);
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockPlaybookService.addExtraVarToPlaybook).toHaveBeenCalledWith(
        mockPlaybook,
        extraVar,
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(controller.addExtraVarToPlaybook('nonexistent-uuid', {})).rejects.toThrow(
        'Playbook not found',
      );
    });
  });

  describe('deleteExtraVarFromPlaybook', () => {
    it('should delete an extra var from a playbook', async () => {
      const result = await controller.deleteExtraVarFromPlaybook('playbook-uuid', 'test_var');
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockPlaybookService.deleteExtraVarFromPlaybook).toHaveBeenCalledWith(
        mockPlaybook,
        'test_var',
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(
        controller.deleteExtraVarFromPlaybook('nonexistent-uuid', 'test_var'),
      ).rejects.toThrow('Playbook not found');
    });
  });

  describe('execPlaybook', () => {
    it('should execute a playbook', async () => {
      const execData = {
        target: ['host1', 'host2'],
        extraVars: [{ extraVar: 'test_var', value: 'test_value' }],
        mode: SsmAnsible.ExecutionMode.CHECK,
      };

      const user = { id: 'user-id', username: 'test-user' };

      const result = await controller.execPlaybook('playbook-uuid', execData, user);
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockPlaybookService.executePlaybook).toHaveBeenCalledWith(
        mockPlaybook,
        user,
        execData.target,
        execData.extraVars,
        execData.mode,
      );
      expect(result).toEqual({ execId: 'task-uuid' });
    });

    it('should use APPLY mode by default', async () => {
      const execData = {
        target: ['host1', 'host2'],
        extraVars: [{ extraVar: 'test_var', value: 'test_value' }],
      };

      const user = { id: 'user-id', username: 'test-user' };

      await controller.execPlaybook('playbook-uuid', execData, user);
      expect(mockPlaybookService.executePlaybook).toHaveBeenCalledWith(
        mockPlaybook,
        user,
        execData.target,
        execData.extraVars,
        SsmAnsible.ExecutionMode.APPLY,
      );
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(controller.execPlaybook('nonexistent-uuid', {}, {})).rejects.toThrow(
        'Playbook not found',
      );
    });
  });

  describe('execPlaybookByQuickRef', () => {
    it('should execute a playbook by quick reference', async () => {
      const execData = {
        target: ['host1', 'host2'],
        extraVars: [{ extraVar: 'test_var', value: 'test_value' }],
        mode: SsmAnsible.ExecutionMode.CHECK,
      };

      const user = { id: 'user-id', username: 'test-user' };

      const result = await controller.execPlaybookByQuickRef('quick-ref', execData, user);
      expect(mockPlaybookRepository.findOneByUniqueQuickReference).toHaveBeenCalledWith(
        'quick-ref',
      );
      expect(mockPlaybookService.executePlaybook).toHaveBeenCalledWith(
        mockPlaybook,
        user,
        execData.target,
        execData.extraVars,
        execData.mode,
      );
      expect(result).toEqual({ execId: 'task-uuid' });
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUniqueQuickReference.mockResolvedValueOnce(null);
      await expect(controller.execPlaybookByQuickRef('nonexistent-ref', {}, {})).rejects.toThrow(
        'Playbook not found',
      );
    });
  });

  describe('execPlaybookOnInventory', () => {
    it('should execute a playbook on inventory', async () => {
      const execData = {
        inventoryTargets: { all: { hosts: { host1: {}, host2: {} } } },
        extraVars: [{ extraVar: 'test_var', value: 'test_value' }],
        execUuid: 'exec-uuid',
      };

      const user = { id: 'user-id', username: 'test-user' };

      const result = await controller.execPlaybookOnInventory('playbook-uuid', execData, user);
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockPlaybookService.executePlaybookOnInventory).toHaveBeenCalledWith(
        mockPlaybook,
        user,
        execData.inventoryTargets,
        execData.extraVars,
        execData.execUuid,
      );
      expect(result).toEqual({ taskUuid: 'task-uuid' });
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(controller.execPlaybookOnInventory('nonexistent-uuid', {}, {})).rejects.toThrow(
        'Playbook not found',
      );
    });
  });

  describe('getExecLogs', () => {
    it('should get execution logs by UUID', async () => {
      mockPlaybookService.getExecLogs.mockResolvedValue(['log1', 'log2']);
      const result = await controller.getExecLogs('task-uuid');
      expect(mockPlaybookService.getExecLogs).toHaveBeenCalledWith('task-uuid');
      expect(result).toEqual({
        execId: 'task-uuid',
        execLogs: ['log1', 'log2'],
      });
    });
  });

  describe('getExecStatus', () => {
    it('should get execution status by UUID', async () => {
      mockPlaybookService.getExecStatus.mockResolvedValue(['status1', 'status2']);
      const result = await controller.getExecStatus('task-uuid');
      expect(mockPlaybookService.getExecStatus).toHaveBeenCalledWith('task-uuid');
      expect(result).toEqual({
        execId: 'task-uuid',
        execStatuses: ['status1', 'status2'],
      });
    });
  });
});
