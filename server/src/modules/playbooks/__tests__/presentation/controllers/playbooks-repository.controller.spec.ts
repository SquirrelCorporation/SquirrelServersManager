import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EntityNotFoundException,
  createMockPlaybooksRepositoryController,
  mockPlaybooksRegisterRepository,
  mockPlaybooksRegisterService,
  mockRepository,
} from './playbooks-repository-test-setup';

// Import the test-setup which contains all mocks
import './playbooks-repository-test-setup';

describe('PlaybooksRepositoryController', () => {
  let controller: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a fresh controller using our mock implementation
    controller = createMockPlaybooksRepositoryController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPlaybooksRepositories', () => {
    it('should return all playbooks repositories', async () => {
      const result = await controller.getPlaybooksRepositories();
      expect(mockPlaybooksRegisterService.getAllPlaybooksRepositories).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Repository');
    });
  });

  describe('addDirectoryToPlaybookRepository', () => {
    it('should add a directory to a playbook repository', async () => {
      await controller.addDirectoryToPlaybookRepository('repo-uuid', {
        fullPath: '/path/to/new/dir',
      });
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('repo-uuid');
      expect(mockPlaybooksRegisterService.createDirectoryInPlaybookRepository).toHaveBeenCalledWith(
        mockRepository,
        '/path/to/new/dir',
      );
    });

    it('should throw EntityNotFoundException when repository not found', async () => {
      await expect(
        controller.addDirectoryToPlaybookRepository('nonexistent-uuid', {
          fullPath: '/path/to/new/dir',
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('addPlaybookToRepository', () => {
    it('should add a playbook to a repository', async () => {
      const result = await controller.addPlaybookToRepository('repo-uuid', 'Test Playbook', {
        fullPath: '/path/to/playbook',
      });
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('repo-uuid');
      expect(mockPlaybooksRegisterService.createPlaybookInRepository).toHaveBeenCalledWith(
        mockRepository,
        '/path/to/playbook',
        'Test Playbook',
      );
      expect(result).toEqual({
        uuid: 'playbook-uuid',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
      });
    });

    it('should throw EntityNotFoundException when repository not found', async () => {
      await expect(
        controller.addPlaybookToRepository('nonexistent-uuid', 'Test Playbook', {
          fullPath: '/path/to/playbook',
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('deletePlaybookFromRepository', () => {
    it('should delete a playbook from a repository', async () => {
      await controller.deletePlaybookFromRepository('repo-uuid', 'playbook-uuid');
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('repo-uuid');
      expect(mockPlaybooksRegisterService.deletePlaybookFromRepository).toHaveBeenCalledWith(
        mockRepository,
        'playbook-uuid',
      );
    });

    it('should throw EntityNotFoundException when repository not found', async () => {
      await expect(
        controller.deletePlaybookFromRepository('nonexistent-uuid', 'playbook-uuid'),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('deleteDirectoryFromRepository', () => {
    it('should delete a directory from a repository', async () => {
      await controller.deleteDirectoryFromRepository('repo-uuid', { fullPath: '/path/to/dir' });
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('repo-uuid');
      expect(mockPlaybooksRegisterService.deleteDirectoryFromRepository).toHaveBeenCalledWith(
        mockRepository,
        '/path/to/dir',
      );
    });

    it('should throw EntityNotFoundException when repository not found', async () => {
      await expect(
        controller.deleteDirectoryFromRepository('nonexistent-uuid', { fullPath: '/path/to/dir' }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('savePlaybook', () => {
    it('should save a playbook', async () => {
      await controller.savePlaybook('playbook-uuid', { content: 'playbook content' });
      expect(mockPlaybooksRegisterService.savePlaybook).toHaveBeenCalledWith(
        'playbook-uuid',
        'playbook content',
      );
    });
  });

  describe('syncRepository', () => {
    it('should sync a repository', async () => {
      await controller.syncRepository('repo-uuid');
      expect(mockPlaybooksRegisterService.syncRepository).toHaveBeenCalledWith('repo-uuid');
    });
  });
});
