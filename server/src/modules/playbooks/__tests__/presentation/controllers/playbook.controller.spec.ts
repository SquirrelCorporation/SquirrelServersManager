import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PlaybookController } from '../../../presentation/controllers/playbook.controller';
import { PlaybookService } from '../../../application/services/playbook.service';
import { PlaybookRepository } from '../../../infrastructure/repositories/playbook.repository';
import { IPlaybook } from '../../../domain/entities/playbook.entity';
import { API, SsmAnsible } from 'ssm-shared-lib';

describe('PlaybookController', () => {
  let controller: PlaybookController;
  let mockPlaybookService: any;
  let mockPlaybookRepository: any;

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

  beforeEach(async () => {
    mockPlaybookService = {
      executePlaybook: vi.fn().mockResolvedValue({ taskUuid: 'task-uuid' }),
      executePlaybookOnInventory: vi.fn().mockResolvedValue({ taskUuid: 'task-uuid' }),
      addExtraVarToPlaybook: vi.fn().mockResolvedValue({}),
      deleteExtraVarFromPlaybook: vi.fn().mockResolvedValue({}),
    };

    mockPlaybookRepository = {
      findAllWithActiveRepositories: vi.fn().mockResolvedValue([mockPlaybook]),
      findOneByUuid: vi.fn().mockResolvedValue(mockPlaybook),
      findOneByUniqueQuickReference: vi.fn().mockResolvedValue(mockPlaybook),
      updateOrCreate: vi.fn().mockResolvedValue(mockPlaybook),
      deleteByUuid: vi.fn().mockResolvedValue({}),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [PlaybookController],
      providers: [
        {
          provide: PlaybookService,
          useValue: mockPlaybookService,
        },
        {
          provide: PlaybookRepository,
          useValue: mockPlaybookRepository,
        },
      ],
    }).compile();

    controller = moduleRef.get<PlaybookController>(PlaybookController);
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
      expect(result).toEqual(mockPlaybook);
    });
  });

  describe('editPlaybook', () => {
    it('should update a playbook', async () => {
      const updateData: Partial<IPlaybook> = {
        name: 'Updated Playbook',
      };

      const result = await controller.editPlaybook('playbook-uuid', updateData);
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockPlaybookRepository.updateOrCreate).toHaveBeenCalledWith({
        ...mockPlaybook,
        ...updateData,
      });
      expect(result).toEqual(mockPlaybook);
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(controller.editPlaybook('nonexistent-uuid', {})).rejects.toThrow('Playbook not found');
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
      const extraVar: API.ExtraVar = {
        extraVar: 'new_var',
        value: 'new_value',
        required: true,
        type: SsmAnsible.ExtraVarsType.MANUAL,
      };

      const result = await controller.addExtraVarToPlaybook('playbook-uuid', extraVar);
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockPlaybookService.addExtraVarToPlaybook).toHaveBeenCalledWith(mockPlaybook, extraVar);
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(controller.addExtraVarToPlaybook('nonexistent-uuid', {} as API.ExtraVar)).rejects.toThrow('Playbook not found');
    });
  });

  describe('deleteExtraVarFromPlaybook', () => {
    it('should delete an extra var from a playbook', async () => {
      const result = await controller.deleteExtraVarFromPlaybook('playbook-uuid', 'test_var');
      expect(mockPlaybookRepository.findOneByUuid).toHaveBeenCalledWith('playbook-uuid');
      expect(mockPlaybookService.deleteExtraVarFromPlaybook).toHaveBeenCalledWith(mockPlaybook, 'test_var');
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(controller.deleteExtraVarFromPlaybook('nonexistent-uuid', 'test_var')).rejects.toThrow('Playbook not found');
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
        execData.mode
      );
      expect(result).toEqual({ taskUuid: 'task-uuid' });
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
        SsmAnsible.ExecutionMode.APPLY
      );
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(controller.execPlaybook('nonexistent-uuid', {}, {})).rejects.toThrow('Playbook not found');
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
      expect(mockPlaybookRepository.findOneByUniqueQuickReference).toHaveBeenCalledWith('quick-ref');
      expect(mockPlaybookService.executePlaybook).toHaveBeenCalledWith(
        mockPlaybook,
        user,
        execData.target,
        execData.extraVars,
        execData.mode
      );
      expect(result).toEqual({ taskUuid: 'task-uuid' });
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUniqueQuickReference.mockResolvedValueOnce(null);
      await expect(controller.execPlaybookByQuickRef('nonexistent-ref', {}, {})).rejects.toThrow('Playbook not found');
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
        execData.execUuid
      );
      expect(result).toEqual({ taskUuid: 'task-uuid' });
    });

    it('should throw an error if playbook not found', async () => {
      mockPlaybookRepository.findOneByUuid.mockResolvedValueOnce(null);
      await expect(controller.execPlaybookOnInventory('nonexistent-uuid', {}, {})).rejects.toThrow('Playbook not found');
    });
  });
});