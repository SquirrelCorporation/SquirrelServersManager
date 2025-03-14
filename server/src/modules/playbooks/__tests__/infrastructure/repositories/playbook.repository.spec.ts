import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlaybookRepository } from '../../../infrastructure/repositories/playbook.repository';
import { Playbook, PlaybookDocument } from '../../../infrastructure/schemas/playbook.schema';
import { IPlaybook } from '../../../domain/entities/playbook.entity';
import { IPlaybooksRegister } from '../../../domain/entities/playbooks-register.entity';
import { PlaybookMapper } from '../../../infrastructure/mappers/playbook.mapper';
import { rootMongooseTestModule, closeInMongodConnection } from '../../../../common-test-helpers';

// Mock the PlaybookMapper
vi.mock('../../../infrastructure/mappers/playbook.mapper', () => ({
  PlaybookMapper: {
    toDomain: vi.fn().mockImplementation((doc) => doc),
    toDomainArray: vi.fn().mockImplementation((docs) => docs),
  },
}));

describe('PlaybookRepository', () => {
  let repository: PlaybookRepository;
  let model: Model<PlaybookDocument>;

  const mockPlaybook: IPlaybook = {
    uuid: 'playbook-uuid',
    name: 'Test Playbook',
    path: '/path/to/playbook.yml',
    custom: true,
    playbooksRepository: {
      uuid: 'repo-uuid',
      name: 'Test Repository',
      type: 'local',
      enabled: true,
      directory: '/path/to/repo',
    } as IPlaybooksRegister,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [rootMongooseTestModule()],
      providers: [
        PlaybookRepository,
        {
          provide: getModelToken(Playbook.name),
          useValue: {
            findOne: vi.fn().mockReturnThis(),
            find: vi.fn().mockReturnThis(),
            findOneAndUpdate: vi.fn().mockReturnThis(),
            deleteOne: vi.fn().mockReturnThis(),
            deleteMany: vi.fn().mockReturnThis(),
            create: vi.fn(),
            lean: vi.fn().mockReturnThis(),
            exec: vi.fn(),
            populate: vi.fn().mockReturnThis(),
            sort: vi.fn().mockReturnThis(),
          },
        },
      ],
    }).compile();

    repository = moduleRef.get<PlaybookRepository>(PlaybookRepository);
    model = moduleRef.get<Model<PlaybookDocument>>(getModelToken(Playbook.name));
  });

  afterEach(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new playbook', async () => {
      vi.spyOn(model, 'create').mockResolvedValueOnce(mockPlaybook as any);

      const result = await repository.create(mockPlaybook);
      expect(model.create).toHaveBeenCalledWith(mockPlaybook);
      expect(PlaybookMapper.toDomain).toHaveBeenCalledWith(mockPlaybook);
      expect(result).toEqual(mockPlaybook);
    });
  });

  describe('updateOrCreate', () => {
    it('should update an existing playbook or create a new one', async () => {
      vi.spyOn(model, 'findOneAndUpdate').mockReturnValue({
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce(mockPlaybook),
      } as any);

      const result = await repository.updateOrCreate(mockPlaybook);
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { path: mockPlaybook.path },
        mockPlaybook,
        { upsert: true }
      );
      expect(PlaybookMapper.toDomain).toHaveBeenCalledWith(mockPlaybook);
      expect(result).toEqual(mockPlaybook);
    });
  });

  describe('findAll', () => {
    it('should find all playbooks', async () => {
      vi.spyOn(model, 'find').mockReturnValue({
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce([mockPlaybook]),
      } as any);

      const result = await repository.findAll();
      expect(model.find).toHaveBeenCalled();
      expect(PlaybookMapper.toDomainArray).toHaveBeenCalledWith([mockPlaybook]);
      expect(result).toEqual([mockPlaybook]);
    });
  });

  describe('findAllWithActiveRepositories', () => {
    it('should find all playbooks with active repositories', async () => {
      vi.spyOn(model, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce([mockPlaybook]),
      } as any);

      const result = await repository.findAllWithActiveRepositories();
      expect(model.find).toHaveBeenCalled();
      expect(model.find().populate).toHaveBeenCalledWith({
        path: 'playbooksRepository',
        match: { enabled: { $eq: true } },
      });
      expect(PlaybookMapper.toDomainArray).toHaveBeenCalledWith([mockPlaybook]);
      expect(result).toEqual([mockPlaybook]);
    });
  });

  describe('findOneByName', () => {
    it('should find a playbook by name', async () => {
      vi.spyOn(model, 'findOne').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce(mockPlaybook),
      } as any);

      const result = await repository.findOneByName('Test Playbook');
      expect(model.findOne).toHaveBeenCalledWith({ name: 'Test Playbook' });
      expect(PlaybookMapper.toDomain).toHaveBeenCalledWith(mockPlaybook);
      expect(result).toEqual(mockPlaybook);
    });
  });

  describe('findOneByUuid', () => {
    it('should find a playbook by UUID', async () => {
      vi.spyOn(model, 'findOne').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce(mockPlaybook),
      } as any);

      const result = await repository.findOneByUuid('playbook-uuid');
      expect(model.findOne).toHaveBeenCalledWith({ uuid: 'playbook-uuid' });
      expect(PlaybookMapper.toDomain).toHaveBeenCalledWith(mockPlaybook);
      expect(result).toEqual(mockPlaybook);
    });
  });

  describe('listAllByRepository', () => {
    it('should list all playbooks for a repository', async () => {
      const mockRepository: IPlaybooksRegister = {
        uuid: 'repo-uuid',
        name: 'Test Repository',
        type: 'local',
        enabled: true,
        directory: '/path/to/repo',
      };

      vi.spyOn(model, 'find').mockReturnValue({
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce([mockPlaybook]),
      } as any);

      const result = await repository.listAllByRepository(mockRepository);
      expect(model.find).toHaveBeenCalledWith({ playbooksRepository: mockRepository });
      expect(PlaybookMapper.toDomainArray).toHaveBeenCalledWith([mockPlaybook]);
      expect(result).toEqual([mockPlaybook]);
    });
  });

  describe('deleteByUuid', () => {
    it('should delete a playbook by UUID', async () => {
      vi.spyOn(model, 'deleteOne').mockReturnValue({
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce({}),
      } as any);

      await repository.deleteByUuid('playbook-uuid');
      expect(model.deleteOne).toHaveBeenCalledWith({ uuid: 'playbook-uuid' });
    });
  });

  describe('findOneByPath', () => {
    it('should find a playbook by path', async () => {
      vi.spyOn(model, 'findOne').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce(mockPlaybook),
      } as any);

      const result = await repository.findOneByPath('/path/to/playbook.yml');
      expect(model.findOne).toHaveBeenCalledWith({ path: '/path/to/playbook.yml' });
      expect(PlaybookMapper.toDomain).toHaveBeenCalledWith(mockPlaybook);
      expect(result).toEqual(mockPlaybook);
    });
  });

  describe('findOneByUniqueQuickReference', () => {
    it('should find a playbook by unique quick reference', async () => {
      vi.spyOn(model, 'findOne').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValueOnce(mockPlaybook),
      } as any);

      const result = await repository.findOneByUniqueQuickReference('quick-ref');
      expect(model.findOne).toHaveBeenCalledWith({ uniqueQuickRef: 'quick-ref' });
      expect(PlaybookMapper.toDomain).toHaveBeenCalledWith(mockPlaybook);
      expect(result).toEqual(mockPlaybook);
    });
  });

  describe('deleteAllByRepository', () => {
    it('should delete all playbooks for a repository', async () => {
      const mockRepository: IPlaybooksRegister = {
        uuid: 'repo-uuid',
        name: 'Test Repository',
        type: 'local',
        enabled: true,
        directory: '/path/to/repo',
      };

      vi.spyOn(model, 'deleteMany').mockReturnValue({
        exec: vi.fn().mockResolvedValueOnce({}),
      } as any);

      await repository.deleteAllByRepository(mockRepository);
      expect(model.deleteMany).toHaveBeenCalledWith({ playbooksRepository: mockRepository });
    });
  });
});