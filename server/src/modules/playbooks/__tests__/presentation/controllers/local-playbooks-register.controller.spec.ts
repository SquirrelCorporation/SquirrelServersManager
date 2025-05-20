import { Repositories } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockLocalPlaybooksRegisterController,
  mockLocalComponent,
  mockLocalRegister,
  mockPlaybooksRegisterEngineService,
  mockPlaybooksRegisterRepository,
  mockPlaybooksRegisterService,
  NotFoundError,
} from './local-playbooks-register-test-setup';

// Import the test-setup which contains all mocks
import './local-playbooks-register-test-setup';

describe('LocalPlaybooksRepositoryController', () => {
  let controller: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a fresh controller using our mock implementation
    controller = createMockLocalPlaybooksRegisterController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLocalRepositories', () => {
    it('should get all local repositories', async () => {
      const result = await controller.getLocalRepositories();

      expect(mockPlaybooksRegisterRepository.findAllByType).toHaveBeenCalledWith(
        Repositories.RepositoryType.LOCAL,
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Local Repository');
    });
  });

  describe('updateLocalRepository', () => {
    it('should update a local repository', async () => {
      const repository = {
        name: 'Updated Local Repository',
        directoryExclusionList: ['.git', 'node_modules'],
        vaults: ['vault1', 'vault2'],
      };

      await controller.updateLocalRepository('local-uuid', repository);

      expect(mockPlaybooksRegisterRepository.update).toHaveBeenCalledWith(
        'local-uuid',
        expect.objectContaining({
          name: 'Updated Local Repository',
          directoryExclusionList: ['.git', 'node_modules'],
          vaults: ['vault1', 'vault2'],
        }),
      );
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalled();
    });
  });

  describe('deleteLocalRepository', () => {
    it('should delete a local repository', async () => {
      await controller.deleteLocalRepository('local-uuid');

      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('local-uuid');
      expect(mockPlaybooksRegisterService.deleteRepository).toHaveBeenCalledWith(mockLocalRegister);
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(controller.deleteLocalRepository('nonexistent-uuid')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('addLocalRepository', () => {
    it('should add a local repository', async () => {
      const repository = {
        name: 'New Local Repository',
        directoryExclusionList: ['.git'],
        vaults: ['vault1'],
      };

      await controller.addLocalRepository(repository);

      expect(mockPlaybooksRegisterRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Local Repository',
          type: 'local',
          enabled: true,
          directoryExclusionList: ['.git'],
          vaults: ['vault1'],
        }),
      );
      expect(mockPlaybooksRegisterEngineService.registerRegister).toHaveBeenCalled();
    });
  });

  describe('syncToDatabaseLocalRepository', () => {
    it('should sync a local repository to the database', async () => {
      await controller.syncToDatabaseLocalRepository('local-uuid');

      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('local-uuid');
      expect(mockPlaybooksRegisterEngineService.getRepository).toHaveBeenCalledWith('local-uuid');
      expect(mockLocalComponent.syncToDatabase).toHaveBeenCalled();
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(controller.syncToDatabaseLocalRepository('nonexistent-uuid')).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
