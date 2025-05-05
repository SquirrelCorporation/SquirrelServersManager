import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from '../../../application/services/cron.service';
import { ICron } from '../../../domain/entities/cron.entity';
import { CRON_REPOSITORY } from '../../../domain/repositories/cron-repository.interface';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('CronService', () => {
  let service: CronService;
  let cronRepositoryMock: {
    updateOrCreateIfNotExist: vi.Mock;
    updateCron: vi.Mock;
    findAll: vi.Mock;
    findByName: vi.Mock;
  };

  beforeEach(async () => {
    // Create repository mock
    cronRepositoryMock = {
      updateOrCreateIfNotExist: vi.fn(),
      updateCron: vi.fn(),
      findAll: vi.fn(),
      findByName: vi.fn()
    };

    // Set up testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: CRON_REPOSITORY,
          useValue: cronRepositoryMock
        }
      ]
    }).compile();

    service = module.get<CronService>(CronService);
  });

  describe('updateOrCreateCron', () => {
    it('should call repository updateOrCreateIfNotExist with the correct parameters', async () => {
      // Arrange
      const cronData: ICron = {
        name: 'test-cron',
        expression: '* * * * *'
      };
      const expectedCron: ICron = {
        _id: '123',
        name: 'test-cron',
        expression: '* * * * *',
        createdAt: new Date()
      };
      cronRepositoryMock.updateOrCreateIfNotExist.mockResolvedValue(expectedCron);

      // Act
      const result = await service.updateOrCreateCron(cronData);

      // Assert
      expect(cronRepositoryMock.updateOrCreateIfNotExist).toHaveBeenCalledWith(cronData);
      expect(result).toEqual(expectedCron);
    });
  });

  describe('updateCron', () => {
    it('should call repository updateCron with the correct parameters', async () => {
      // Arrange
      const cronData: ICron = {
        name: 'test-cron',
        expression: '* * * * *',
        disabled: true
      };
      cronRepositoryMock.updateCron.mockResolvedValue(undefined);

      // Act
      await service.updateCron(cronData);

      // Assert
      expect(cronRepositoryMock.updateCron).toHaveBeenCalledWith(cronData);
    });
  });

  describe('updateLastExecution', () => {
    it('should call repository updateCron with correct name and lastExecution', async () => {
      // Arrange
      const cronName = 'test-cron';
      const now = new Date();
      vi.setSystemTime(now);
      cronRepositoryMock.updateCron.mockResolvedValue(undefined);

      // Act
      await service.updateLastExecution(cronName);

      // Assert
      expect(cronRepositoryMock.updateCron).toHaveBeenCalledWith({
        name: cronName,
        lastExecution: expect.any(Date),
        expression: '',
      });
      const updateCall = cronRepositoryMock.updateCron.mock.calls[0][0];
      expect(updateCall.lastExecution.getTime()).toBeCloseTo(now.getTime(), -2); // Within ~100ms
    });
  });

  describe('findAll', () => {
    it('should return all cron jobs from repository', async () => {
      // Arrange
      const cronJobs: ICron[] = [
        { _id: '1', name: 'cron1', expression: '* * * * *' },
        { _id: '2', name: 'cron2', expression: '0 0 * * *' }
      ];
      cronRepositoryMock.findAll.mockResolvedValue(cronJobs);

      // Act
      const result = await service.findAll();

      // Assert
      expect(cronRepositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(cronJobs);
    });

    it('should return null if repository returns null', async () => {
      // Arrange
      cronRepositoryMock.findAll.mockResolvedValue(null);

      // Act
      const result = await service.findAll();

      // Assert
      expect(cronRepositoryMock.findAll).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return the cron job with the specified name', async () => {
      // Arrange
      const cronName = 'test-cron';
      const cronJob: ICron = {
        _id: '1',
        name: cronName,
        expression: '* * * * *'
      };
      cronRepositoryMock.findByName.mockResolvedValue(cronJob);

      // Act
      const result = await service.findByName(cronName);

      // Assert
      expect(cronRepositoryMock.findByName).toHaveBeenCalledWith(cronName);
      expect(result).toEqual(cronJob);
    });

    it('should return null if repository returns null', async () => {
      // Arrange
      const cronName = 'non-existent-cron';
      cronRepositoryMock.findByName.mockResolvedValue(null);

      // Act
      const result = await service.findByName(cronName);

      // Assert
      expect(cronRepositoryMock.findByName).toHaveBeenCalledWith(cronName);
      expect(result).toBeNull();
    });
  });
});