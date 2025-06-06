import { Test } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CronController } from '../../../presentation/controllers/cron.controller';
import { CronService } from '../../../application/services/cron.service';
import { ICron } from '../../../domain/entities/cron.entity';

describe('CronController', () => {
  let controller: CronController;
  let cronService: any;
  let schedulerRegistry: any;

  beforeEach(async () => {
    // Create mock implementations
    cronService = {
      findAll: vi.fn(),
      findByName: vi.fn(),
      updateOrCreateCron: vi.fn(),
      updateCron: vi.fn(),
      updateLastExecution: vi.fn(),
    };

    schedulerRegistry = {
      getCronJobs: vi.fn(),
    };

    // Set up testing module with direct instantiation of the controller
    controller = new CronController(cronService as any, schedulerRegistry as any);
  });

  describe('getCrons', () => {
    it('should return crons with active status', async () => {
      // Arrange
      const cronJobs: ICron[] = [
        { _id: '1', name: 'cron1', expression: '* * * * *', lastExecution: new Date() },
        { _id: '2', name: 'cron2', expression: '0 0 * * *' },
      ];

      const mockCronJobsMap = new Map();
      mockCronJobsMap.set('cron1', {});
      mockCronJobsMap.set('cron3', {});

      vi.spyOn(cronService, 'findAll').mockResolvedValue(cronJobs);
      vi.spyOn(schedulerRegistry, 'getCronJobs').mockReturnValue({
        keys: () => mockCronJobsMap.keys(),
      } as any);

      // Act
      const result = await controller.getCrons();

      // Assert
      expect(cronService.findAll).toHaveBeenCalled();
      expect(schedulerRegistry.getCronJobs).toHaveBeenCalled();

      // Check for correct enrichment with active status
      expect(result).toEqual([
        { ...cronJobs[0], active: true }, // cron1 is in active jobs
        { ...cronJobs[1], active: false }, // cron2 is not in active jobs
      ]);
    });

    it('should return empty array if no crons are found', async () => {
      // Arrange
      vi.spyOn(cronService, 'findAll').mockResolvedValue(null);
      vi.spyOn(schedulerRegistry, 'getCronJobs').mockReturnValue({
        keys: () => [],
      } as any);

      // Act
      const result = await controller.getCrons();

      // Assert
      expect(cronService.findAll).toHaveBeenCalled();
      expect(schedulerRegistry.getCronJobs).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
