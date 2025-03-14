import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LocalPlaybooksRepositoryController } from '../../../presentation/controllers/local-playbooks-register.controller';
import { LocalPlaybooksRegisterComponent } from '../../../application/services/components/local-playbooks-repository.component';
import { PlaybooksRegisterService } from '../../../application/services/playbooks-register.service';
import { IPlaybooksRegisterRepository, PLAYBOOKS_REGISTER_REPOSITORY } from '../../../domain/repositories/playbooks-register-repository.interface';
import { IPlaybooksRegister } from '../../../domain/entities/playbooks-register.entity';
import { API, Repositories } from 'ssm-shared-lib';
import { NotFoundError } from '../../../../../middlewares/api/ApiError';
import { getModelToken } from '@nestjs/mongoose';
import { PlaybookRepository } from '../../../infrastructure/repositories/playbook.repository';

describe('LocalPlaybooksRepositoryController', () => {
  let controller: LocalPlaybooksRepositoryController;
  let mockLocalPlaybooksRegisterComponent: any;
  let mockPlaybooksRegisterService: any;
  let mockPlaybooksRegisterRepository: any;

  const mockLocalRegister: IPlaybooksRegister = {
    uuid: 'local-uuid',
    name: 'Local Repository',
    type: 'local',
    enabled: true,
    directory: '/path/to/local/repo',
    directoryExclusionList: ['.git'],
    vaults: ['vault1'],
  };

  beforeEach(async () => {
    mockLocalPlaybooksRegisterComponent = {
      addLocalRepository: vi.fn().mockResolvedValue(undefined),
      updateLocalRepository: vi.fn().mockResolvedValue(undefined),
      syncToDatabase: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybooksRegisterService = {
      deleteRepository: vi.fn().mockResolvedValue(undefined),
    };

    mockPlaybooksRegisterRepository = {
      findAllByType: vi.fn().mockResolvedValue([mockLocalRegister]),
      findByUuid: vi.fn().mockImplementation((uuid) => {
        if (uuid === 'local-uuid') return Promise.resolve(mockLocalRegister);
        return Promise.resolve(null);
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [LocalPlaybooksRepositoryController],
      providers: [
        {
          provide: LocalPlaybooksRegisterComponent,
          useValue: mockLocalPlaybooksRegisterComponent,
        },
        {
          provide: PlaybooksRegisterService,
          useValue: mockPlaybooksRegisterService,
        },
        {
          provide: getModelToken(PlaybookRepository.name),
          useValue: mockPlaybooksRegisterRepository,
        },
      ],
    }).compile();

    controller = moduleRef.get<LocalPlaybooksRepositoryController>(LocalPlaybooksRepositoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLocalRepositories', () => {
    it('should get all local repositories', async () => {
      const result = await controller.getLocalRepositories();
      
      expect(mockPlaybooksRegisterRepository.findAllByType).toHaveBeenCalledWith(Repositories.RepositoryType.LOCAL);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Local Repository');
    });
  });

  describe('updateLocalRepository', () => {
    it('should update a local repository', async () => {
      const repository: API.LocalPlaybooksRepository = {
        name: 'Updated Local Repository',
        directoryExclusionList: ['.git', 'node_modules'],
        vaults: ['vault1', 'vault2'],
      };

      await controller.updateLocalRepository('local-uuid', repository);
      
      expect(mockLocalPlaybooksRegisterComponent.updateLocalRepository).toHaveBeenCalledWith(
        'local-uuid',
        'Updated Local Repository',
        ['.git', 'node_modules'],
        ['vault1', 'vault2']
      );
    });
  });

  describe('deleteLocalRepository', () => {
    it('should delete a local repository', async () => {
      await controller.deleteLocalRepository('local-uuid');
      
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('local-uuid');
      expect(mockPlaybooksRegisterService.deleteRepository).toHaveBeenCalledWith(mockLocalRegister);
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(controller.deleteLocalRepository('nonexistent-uuid')).rejects.toThrow(NotFoundError);
    });
  });

  describe('addLocalRepository', () => {
    it('should add a local repository', async () => {
      const repository: API.LocalPlaybooksRepository = {
        name: 'New Local Repository',
        directoryExclusionList: ['.git'],
        vaults: ['vault1'],
      };

      await controller.addLocalRepository(repository);
      
      expect(mockLocalPlaybooksRegisterComponent.addLocalRepository).toHaveBeenCalledWith(
        'New Local Repository',
        ['.git'],
        ['vault1']
      );
    });
  });

  describe('syncToDatabaseLocalRepository', () => {
    it('should sync a local repository to the database', async () => {
      await controller.syncToDatabaseLocalRepository('local-uuid');
      
      expect(mockPlaybooksRegisterRepository.findByUuid).toHaveBeenCalledWith('local-uuid');
      expect(mockLocalPlaybooksRegisterComponent.syncToDatabase).toHaveBeenCalledWith(mockLocalRegister);
    });

    it('should throw NotFoundError when repository not found', async () => {
      await expect(controller.syncToDatabaseLocalRepository('nonexistent-uuid')).rejects.toThrow(NotFoundError);
    });
  });
});