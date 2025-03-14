import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PlaybooksRepositoryController } from '../../../presentation/controllers/playbooks-repository.controller';
import { PlaybooksRegisterService } from '../../../application/services/playbooks-register.service';
import { PlaybooksRegisterRepository } from '../../../infrastructure/repositories/playbooks-register.repository';
import { IPlaybooksRegister } from '../../../domain/entities/playbooks-register.entity';
import { API } from 'ssm-shared-lib';
import { NotFoundError } from '../../../../../middlewares/api/ApiError';

describe('PlaybooksRepositoryController', () => {
  let controller: PlaybooksRepositoryController;
  let mockPlaybooksRegisterService: any;
  let mockPlaybooksRegisterRepository: any;

  const mockRepository: IPlaybooksRegister = {
    uuid: 'repo-uuid',
    name: 'Test Repository',
    type: 'local',
    enabled: true,
    directory: '/path/to/repo',
  };

  beforeEach(async () => {
    mockPlaybooksRegisterService = {
      getAllPlaybooksRepositories: vi.fn().mockResolvedValue([
        {
          name: 'Test Repository',
          children: [],
          type: 'local',
          uuid: 'repo-uuid',
          path: '/path/to/repo',
          default: true,
        },
      ]),
      createDirectoryInPlaybookRepository: vi.fn().mockResolvedValue(undefined),
      createPlaybookInRepository: vi.fn().mockResolvedValue({
        uuid: 'playbook-uuid',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
      }),
      deletePlaybookFromRepository: vi.fn().mockResolvedValue(undefined),
      deleteDirectoryFromRepository: vi.fn().mockResolvedValue(undefined),
      savePlaybook: vi.fn().mockResolvedValue(undefined),
      syncRepository: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybooksRegisterRepository = {
      findByUuid: vi.fn().mockImplementation((uuid) => {
        if (uuid === 'repo-uuid') return Promise.resolve(mockRepository);
        return Promise.resolve(null);
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [PlaybooksRepositoryController],
      providers: [
        {
          provide: PlaybooksRegisterService,
          useValue: mockPlaybooksRegisterService,
        },
        {
          provide: PlaybooksRegisterRepository,
          useValue: mockPlaybooksRegisterRepository,
        },
      ],
    }).compile();

    controller = moduleRef.get<PlaybooksRepositoryController>(PlaybooksRepositoryController);
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
      await controller.addDirectoryToPlaybookRepository('repo-uuid', { fullPath: '/path/to/new/dir' });
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('repo-uuid');
      expect(mockPlaybooksRegisterService.createDirectoryInPlaybookRepository).toHaveBeenCalledWith(
        mockRepository,
        '/path/to/new/dir'
      );
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(
        controller.addDirectoryToPlaybookRepository('nonexistent-uuid', { fullPath: '/path/to/new/dir' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('addPlaybookToRepository', () => {
    it('should add a playbook to a repository', async () => {
      const result = await controller.addPlaybookToRepository('repo-uuid', 'Test Playbook', { fullPath: '/path/to/playbook' });
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('repo-uuid');
      expect(mockPlaybooksRegisterService.createPlaybookInRepository).toHaveBeenCalledWith(
        mockRepository,
        '/path/to/playbook',
        'Test Playbook'
      );
      expect(result).toEqual({
        uuid: 'playbook-uuid',
        name: 'Test Playbook',
        path: '/path/to/playbook.yml',
      });
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(
        controller.addPlaybookToRepository('nonexistent-uuid', 'Test Playbook', { fullPath: '/path/to/playbook' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deletePlaybookFromRepository', () => {
    it('should delete a playbook from a repository', async () => {
      await controller.deletePlaybookFromRepository('repo-uuid', 'playbook-uuid');
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('repo-uuid');
      expect(mockPlaybooksRegisterService.deletePlaybookFromRepository).toHaveBeenCalledWith(
        mockRepository,
        'playbook-uuid'
      );
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(
        controller.deletePlaybookFromRepository('nonexistent-uuid', 'playbook-uuid')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteDirectoryFromRepository', () => {
    it('should delete a directory from a repository', async () => {
      await controller.deleteDirectoryFromRepository('repo-uuid', { fullPath: '/path/to/dir' });
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('repo-uuid');
      expect(mockPlaybooksRegisterService.deleteDirectoryFromRepository).toHaveBeenCalledWith(
        mockRepository,
        '/path/to/dir'
      );
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(
        controller.deleteDirectoryFromRepository('nonexistent-uuid', { fullPath: '/path/to/dir' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('savePlaybook', () => {
    it('should save a playbook', async () => {
      await controller.savePlaybook('playbook-uuid', { content: 'playbook content' });
      expect(mockPlaybooksRegisterService.savePlaybook).toHaveBeenCalledWith(
        'playbook-uuid',
        'playbook content'
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