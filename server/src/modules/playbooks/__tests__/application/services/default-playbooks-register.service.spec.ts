import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileSystemService } from '@modules/shell';
import { Repositories } from 'ssm-shared-lib';
import { SSM_DATA_PATH, SSM_INSTALL_PATH } from 'src/config';
import { DefaultPlaybooksRegisterService } from '../../../application/services/default-playbooks-register.service';
import { PlaybooksRegisterRepository } from '../../../infrastructure/repositories/playbooks-register.repository';
import { IPlaybooksRegister } from '../../../domain/entities/playbooks-register.entity';

// Mock config values
vi.mock('src/config', () => ({
  SSM_DATA_PATH: '/data',
  SSM_INSTALL_PATH: '/install',
}));

describe('DefaultPlaybooksRegisterService', () => {
  let service: DefaultPlaybooksRegisterService;
  let mockPlaybooksRegisterRepository: any;
  let mockFileSystemService: any;

  beforeEach(async () => {
    mockPlaybooksRegisterRepository = {
      findByUuid: vi.fn(),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    };

    mockFileSystemService = {
      createDirectory: vi.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DefaultPlaybooksRegisterService,
        {
          provide: PlaybooksRegisterRepository,
          useValue: mockPlaybooksRegisterRepository,
        },
        {
          provide: FileSystemService,
          useValue: mockFileSystemService,
        },
      ],
    }).compile();

    service = moduleRef.get<DefaultPlaybooksRegisterService>(DefaultPlaybooksRegisterService);
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
        '00000000-0000-0000-0000-000000000000'
      );
      expect(mockPlaybooksRegisterRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ssm-core',
          uuid: '00000000-0000-0000-0000-000000000000',
          type: Repositories.RepositoryType.LOCAL,
          default: true,
        })
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
          directory: `${SSM_INSTALL_PATH}/server/src/ansible/00000000-0000-0000-0000-000000000000`,
        })
      );
    });

    it('should create tools repository if it does not exist', async () => {
      mockPlaybooksRegisterRepository.findByUuid
        .mockResolvedValueOnce({}) // Core repository found
        .mockResolvedValueOnce(null); // Tools repository not found

      await service.saveSSMDefaultPlaybooksRepositories();

      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000001'
      );
      expect(mockPlaybooksRegisterRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'ssm-tools',
          uuid: '00000000-0000-0000-0000-000000000001',
          type: Repositories.RepositoryType.LOCAL,
          default: true,
        })
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
          directory: `${SSM_INSTALL_PATH}/server/src/ansible/00000000-0000-0000-0000-000000000001`,
        })
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
          directory: `${SSM_DATA_PATH}/playbooks/00000000-0000-0000-0000-000000000002`,
        })
      );
      expect(mockFileSystemService.createDirectory).toHaveBeenCalledWith(
        `${SSM_DATA_PATH}/playbooks/00000000-0000-0000-0000-000000000002`
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
          directory: `${SSM_DATA_PATH}/playbooks/00000000-0000-0000-0000-000000000002`,
        })
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
      mockFileSystemService.createDirectory.mockRejectedValueOnce(new Error('Directory creation failed'));

      // Should not throw
      await service.createDefaultLocalUserRepository('user@example.com');

      expect(mockPlaybooksRegisterRepository.create).toHaveBeenCalled();
    });
  });
});