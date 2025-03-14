import { Test } from '@nestjs/testing';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlaybooksRegisterRepository } from '../../../infrastructure/repositories/playbooks-register.repository';
import { PlaybooksRegister, PlaybooksRegisterDocument } from '../../../infrastructure/schemas/playbooks-register.schema';
import { IPlaybooksRegister } from '../../../domain/entities/playbooks-register.entity';
import { rootMongooseTestModule, closeInMongodConnection } from '../../../../common-test-helpers';

describe('PlaybooksRegisterRepository', () => {
  let repository: PlaybooksRegisterRepository;
  let model: Model<PlaybooksRegisterDocument>;

  const mockPlaybooksRegister = {
    uuid: 'test-uuid',
    name: 'Test Repository',
    type: 'local',
    enabled: true,
    directory: '/path/to/test',
    tree: { path: '/root', name: 'root', type: 'directory', children: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [rootMongooseTestModule()],
      providers: [
        PlaybooksRegisterRepository,
        {
          provide: getModelToken(PlaybooksRegister.name),
          useValue: {
            findOne: vi.fn().mockReturnThis(),
            find: vi.fn().mockReturnThis(),
            findOneAndUpdate: vi.fn().mockReturnThis(),
            findOneAndDelete: vi.fn().mockReturnThis(),
            create: vi.fn(),
            exec: vi.fn(),
          },
        },
      ],
    }).compile();

    repository = moduleRef.get<PlaybooksRegisterRepository>(PlaybooksRegisterRepository);
    model = moduleRef.get<Model<PlaybooksRegisterDocument>>(getModelToken(PlaybooksRegister.name));
  });

  afterEach(async () => {
    await closeInMongodConnection();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByUuid', () => {
    it('should find a repository by UUID', async () => {
      vi.spyOn(model, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValueOnce(mockPlaybooksRegister),
      } as any);

      const result = await repository.findByUuid('test-uuid');
      expect(model.findOne).toHaveBeenCalledWith({ uuid: 'test-uuid' });
      expect(result).toEqual(mockPlaybooksRegister);
    });

    it('should return null when repository not found', async () => {
      vi.spyOn(model, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await repository.findByUuid('nonexistent-uuid');
      expect(result).toBeNull();
    });
  });

  describe('findAllActive', () => {
    it('should find all active repositories', async () => {
      vi.spyOn(model, 'find').mockReturnValue({
        exec: vi.fn().mockResolvedValueOnce([mockPlaybooksRegister]),
      } as any);

      const result = await repository.findAllActive();
      expect(model.find).toHaveBeenCalledWith({ enabled: true });
      expect(result).toEqual([mockPlaybooksRegister]);
    });

    it('should filter out null entities', async () => {
      const mockNullDoc = null;
      vi.spyOn(model, 'find').mockReturnValue({
        exec: vi.fn().mockResolvedValueOnce([mockPlaybooksRegister, mockNullDoc]),
      } as any);

      const result = await repository.findAllActive();
      expect(result).toEqual([mockPlaybooksRegister]);
    });
  });

  describe('update', () => {
    it('should update a repository', async () => {
      const updateData: Partial<IPlaybooksRegister> = {
        name: 'Updated Repository',
      };

      vi.spyOn(model, 'findOneAndUpdate').mockReturnValue({
        exec: vi.fn().mockResolvedValueOnce({ ...mockPlaybooksRegister, ...updateData }),
      } as any);

      const result = await repository.update('test-uuid', updateData);
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { uuid: 'test-uuid' },
        { $set: updateData },
        { new: true }
      );
      expect(result?.name).toBe('Updated Repository');
    });
  });

  describe('create', () => {
    it('should create a new repository', async () => {
      vi.spyOn(model, 'create').mockResolvedValueOnce(mockPlaybooksRegister as any);

      const result = await repository.create(mockPlaybooksRegister);
      expect(model.create).toHaveBeenCalledWith(mockPlaybooksRegister);
      expect(result).toEqual(mockPlaybooksRegister);
    });

    it('should throw error when creation fails', async () => {
      vi.spyOn(model, 'create').mockResolvedValueOnce(null as any);

      await expect(repository.create(mockPlaybooksRegister)).rejects.toThrow('Failed to create repository');
    });
  });

  describe('delete', () => {
    it('should delete a repository', async () => {
      vi.spyOn(model, 'findOneAndDelete').mockReturnValue({
        exec: vi.fn().mockResolvedValueOnce(mockPlaybooksRegister),
      } as any);

      const result = await repository.delete('test-uuid');
      expect(model.findOneAndDelete).toHaveBeenCalledWith({ uuid: 'test-uuid' });
      expect(result).toEqual(mockPlaybooksRegister);
    });
  });

  describe('findAllByType', () => {
    it('should find all repositories by type', async () => {
      vi.spyOn(model, 'find').mockReturnValue({
        exec: vi.fn().mockResolvedValueOnce([mockPlaybooksRegister]),
      } as any);

      const result = await repository.findAllByType('local');
      expect(model.find).toHaveBeenCalledWith({ type: 'local' });
      expect(result).toEqual([mockPlaybooksRegister]);
    });
  });
});