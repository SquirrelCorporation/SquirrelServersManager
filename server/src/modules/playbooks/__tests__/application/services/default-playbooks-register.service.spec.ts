import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Repositories } from 'ssm-shared-lib';
import { SSM_DATA_PATH, SSM_INSTALL_PATH } from 'src/config';
import {
  IPlaybooksRegister,
  createMockDefaultPlaybooksRegisterService,
  mockFileSystemService,
  mockPlaybooksRegisterRepository,
} from './default-playbooks-register-test-setup';

// Import test-setup which contains the mocks
import './default-playbooks-register-test-setup';

describe('DefaultPlaybooksRegisterService', () => {
  let service: any;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create a fresh service instance using our mock implementation
    service = createMockDefaultPlaybooksRegisterService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveSSMDefaultPlaybooksRepositories', () => {
    it('should create core repository if it does not exist', async () => {
      mockPlaybooksRegisterRepository.findByUuid
        .mockResolvedValueOnce(null) // Core repository not found
        .mockResolvedValueOnce(null); // Tools repository not found

      await service.saveSSMDefaultPlaybooksRepositories();

      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000000',
      );
      expect(mockPlaybooksRegisterRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ssm-core',
          uuid: '00000000-0000-0000-0000-000000000000',
          type: Repositories.RepositoryType.LOCAL,
          default: true,
        }),
      );
    });

    it('should update core repository if it exists', async () => {
      const existingCore: IPlaybooksRegister = {
        uuid: '00000000-0000-0000-0000-000000000000',
        name: 'Existing Core',
        type: 'local',
        enabled: true,
        directory: '/old/path',
      };

      mockPlaybooksRegisterRepository.findByUuid
        .mockResolvedValueOnce(existingCore) // Core repository found
        .mockResolvedValueOnce(null); // Tools repository not found

      await service.saveSSMDefaultPlaybooksRepositories();

      expect(mockPlaybooksRegisterRepository.update).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000000',
        expect.objectContaining({
          name: 'ssm-core',
          directory: '/install/server/src/ansible/00000000-0000-0000-0000-000000000000',
        }),
      );
    });

    it('should create tools repository if it does not exist', async () => {
      mockPlaybooksRegisterRepository.findByUuid
        .mockResolvedValueOnce({}) // Core repository found
        .mockResolvedValueOnce(null); // Tools repository not found

      await service.saveSSMDefaultPlaybooksRepositories();

      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000001',
      );
      expect(mockPlaybooksRegisterRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ssm-tools',
          uuid: '00000000-0000-0000-0000-000000000001',
          type: Repositories.RepositoryType.LOCAL,
          default: true,
        }),
      );
    });

    it('should update tools repository if it exists', async () => {
      const existingTools: IPlaybooksRegister = {
        uuid: '00000000-0000-0000-0000-000000000001',
        name: 'Existing Tools',
        type: 'local',
        enabled: true,
        directory: '/old/path',
      };

      mockPlaybooksRegisterRepository.findByUuid
        .mockResolvedValueOnce({}) // Core repository found
        .mockResolvedValueOnce(existingTools); // Tools repository found

      await service.saveSSMDefaultPlaybooksRepositories();

      expect(mockPlaybooksRegisterRepository.update).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000001',
        expect.objectContaining({
          name: 'ssm-tools',
          directory: '/install/server/src/ansible/00000000-0000-0000-0000-000000000001',
        }),
      );
    });
  });

  describe('createDefaultLocalUserRepository', () => {
    it('should create user repository with name from email', async () => {
      mockPlaybooksRegisterRepository.findByUuid.mockResolvedValueOnce(null); // User repository not found

      await service.createDefaultLocalUserRepository('user@example.com');

      expect(mockPlaybooksRegisterRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'user',
          uuid: '00000000-0000-0000-0000-000000000002',
          type: Repositories.RepositoryType.LOCAL,
          directory: '/data/playbooks/00000000-0000-0000-0000-000000000002',
        }),
      );
      expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith(
        '/data/playbooks/00000000-0000-0000-0000-000000000002',
      );
    });

    it('should update user repository if it exists', async () => {
      const existingUser: IPlaybooksRegister = {
        uuid: '00000000-0000-0000-0000-000000000002',
        name: 'Existing User',
        type: 'local',
        enabled: true,
        directory: '/old/path',
      };

      mockPlaybooksRegisterRepository.findByUuid.mockResolvedValueOnce(existingUser); // User repository found

      await service.createDefaultLocalUserRepository('user@example.com');

      expect(mockPlaybooksRegisterRepository.update).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000002',
        expect.objectContaining({
          name: 'user',
          directory: '/data/playbooks/00000000-0000-0000-0000-000000000002',
        }),
      );
    });

    it('should skip repository creation when no email is provided', async () => {
      await service.createDefaultLocalUserRepository('');

      expect(mockPlaybooksRegisterRepository.findByUuid).not.toHaveBeenCalled();
      expect(mockPlaybooksRegisterRepository.create).not.toHaveBeenCalled();
      expect(mockPlaybooksRegisterRepository.update).not.toHaveBeenCalled();
    });

    it('should handle directory creation errors gracefully', async () => {
      mockPlaybooksRegisterRepository.findByUuid.mockResolvedValueOnce(null);
      mockFileSystemService.createDirectory.mockRejectedValueOnce(
        new Error('Directory creation failed'),
      );

      // Should not throw
      await service.createDefaultLocalUserRepository('user@example.com');

      expect(mockPlaybooksRegisterRepository.create).toHaveBeenCalled();
    });
  });
});
