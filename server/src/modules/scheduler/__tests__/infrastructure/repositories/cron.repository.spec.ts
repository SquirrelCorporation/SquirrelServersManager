import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CronRepository } from '../../../infrastructure/repositories/cron.repository';
import { CronRepositoryMapper } from '../../../infrastructure/mappers/cron-repository.mapper';
import { CRON } from '../../../infrastructure/schemas/cron.schema';
import { ICron } from '../../../domain/entities/cron.entity';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Helper to create a mock document with toObject method
const createMockDocument = (data: any) => ({
  ...data,
  toObject: () => data
});

describe('CronRepository', () => {
  let repository: CronRepository;
  let cronModel: any;
  let mapper: any;

  beforeEach(async () => {
    // Create model mock with methods that return chainable functions
    const modelMock = {
      findOneAndUpdate: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn()
    };

    // Mock the mapper with vi.fn() implementations
    const mapperMock = {
      toDomain: vi.fn(),
      toDomainList: vi.fn()
    };

    // Set up testing module
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: CronRepositoryMapper,
          useValue: mapperMock
        },
        {
          provide: getModelToken(CRON),
          useValue: modelMock
        },
        {
          provide: CronRepository,
          useFactory: () => {
            return new CronRepository(modelMock as any, mapperMock);
          }
        }
      ]
    }).compile();

    repository = moduleRef.get<CronRepository>(CronRepository);
    cronModel = moduleRef.get(getModelToken(CRON));
    mapper = moduleRef.get<CronRepositoryMapper>(CronRepositoryMapper);
  });

  describe('updateOrCreateIfNotExist', () => {
    it('should update an existing cron or create a new one', async () => {
      // Arrange
      const cronData: ICron = {
        name: 'test-cron',
        expression: '* * * * *'
      };
      
      const mockDocument = createMockDocument({
        _id: '123',
        name: 'test-cron',
        expression: '* * * * *'
      });

      const expectedDomainCron: ICron = {
        _id: '123',
        name: 'test-cron',
        expression: '* * * * *'
      };

      cronModel.findOneAndUpdate.mockResolvedValue(mockDocument);
      mapper.toDomain.mockReturnValue(expectedDomainCron);

      // Act
      const result = await repository.updateOrCreateIfNotExist(cronData);

      // Assert
      expect(cronModel.findOneAndUpdate).toHaveBeenCalledWith(
        { name: cronData.name },
        cronData,
        { upsert: true, new: true }
      );
      expect(mapper.toDomain).toHaveBeenCalledWith(mockDocument.toObject());
      expect(result).toEqual(expectedDomainCron);
    });
  });

  describe('updateCron', () => {
    it('should update a cron job', async () => {
      // Arrange
      const cronData: ICron = {
        name: 'test-cron',
        expression: '* * * * *',
        disabled: true
      };

      // Setup the chain for findOneAndUpdate
      cronModel.findOneAndUpdate.mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({})
        })
      });

      // Act
      await repository.updateCron(cronData);

      // Assert
      expect(cronModel.findOneAndUpdate).toHaveBeenCalledWith(
        { name: cronData.name },
        cronData
      );
    });
  });

  describe('findAll', () => {
    it('should return all cron jobs', async () => {
      // Arrange
      const cronDocuments = [
        { _id: '1', name: 'cron1', expression: '* * * * *' },
        { _id: '2', name: 'cron2', expression: '0 0 * * *' }
      ];

      const expectedDomainCrons = [
        { _id: '1', name: 'cron1', expression: '* * * * *' },
        { _id: '2', name: 'cron2', expression: '0 0 * * *' }
      ];

      // Setup the chain for find
      cronModel.find.mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(cronDocuments)
        })
      });
      
      mapper.toDomainList.mockReturnValue(expectedDomainCrons);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(cronModel.find).toHaveBeenCalled();
      expect(mapper.toDomainList).toHaveBeenCalledWith(cronDocuments);
      expect(result).toEqual(expectedDomainCrons);
    });
  });

  describe('findByName', () => {
    it('should return a cron job with the specified name', async () => {
      // Arrange
      const cronName = 'test-cron';
      
      const cronDocument = {
        _id: '1',
        name: cronName,
        expression: '* * * * *'
      };

      const expectedDomainCron = {
        _id: '1',
        name: cronName,
        expression: '* * * * *'
      };

      // Setup the chain for findOne
      cronModel.findOne.mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(cronDocument)
        })
      });
      
      mapper.toDomain.mockReturnValue(expectedDomainCron);

      // Act
      const result = await repository.findByName(cronName);

      // Assert
      expect(cronModel.findOne).toHaveBeenCalledWith({ name: cronName });
      expect(mapper.toDomain).toHaveBeenCalledWith(cronDocument);
      expect(result).toEqual(expectedDomainCron);
    });

    it('should return null if cron job is not found', async () => {
      // Arrange
      const cronName = 'non-existent-cron';

      // Setup the chain for findOne
      cronModel.findOne.mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null)
        })
      });
      
      mapper.toDomain.mockReturnValue(null);

      // Act
      const result = await repository.findByName(cronName);

      // Assert
      expect(cronModel.findOne).toHaveBeenCalledWith({ name: cronName });
      expect(mapper.toDomain).toHaveBeenCalledWith(null);
      expect(result).toBeNull();
    });
  });
});