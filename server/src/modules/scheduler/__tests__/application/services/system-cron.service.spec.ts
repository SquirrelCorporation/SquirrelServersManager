import { Test } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { DEVICES_SERVICE } from '@modules/devices';
import { TASK_LOGS_SERVICE } from '@modules/ansible';
import { SERVER_LOGS_SERVICE } from '@modules/logs';
import { SettingsKeys } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CronService } from '../../../application/services/cron.service';
import { SystemCronService } from '../../../application/services/system-cron.service';

describe('SystemCronService', () => {
  let service: SystemCronService;
  let devicesService: { setDeviceOfflineAfter: vi.Mock };
  let taskLogsService: { cleanOldTasksAndLogs: vi.Mock };
  let serverLogsService: { deleteAllOld: vi.Mock };
  let cacheManager: { get: vi.Mock };
  let cronService: { updateLastExecution: vi.Mock };
  let schedulerRegistry: { deleteCronJob: vi.Mock; getCronJobs: vi.Mock };

  beforeEach(async () => {
    // Create mock implementations
    devicesService = {
      setDeviceOfflineAfter: vi.fn(),
    };

    taskLogsService = {
      cleanOldTasksAndLogs: vi.fn(),
    };

    serverLogsService = {
      deleteAllOld: vi.fn(),
    };

    cacheManager = {
      get: vi.fn(),
    };

    cronService = {
      updateLastExecution: vi.fn().mockResolvedValue(undefined),
    };

    schedulerRegistry = {
      deleteCronJob: vi.fn(),
      getCronJobs: vi.fn().mockReturnValue(new Map()),
    };

    // Create an instance directly, which is easier to mock and test
    service = new SystemCronService(
      devicesService as any,
      taskLogsService as any,
      serverLogsService as any,
      cacheManager as any,
      cronService as any,
      schedulerRegistry as any,
    );
  });

  describe('onModuleInit', () => {
    it('should try to delete existing cron jobs', async () => {
      // Arrange & Act
      await service.onModuleInit();

      // Assert - check that deleteCronJob was called at least 3 times
      expect(schedulerRegistry.deleteCronJob).toHaveBeenCalled();
      expect(schedulerRegistry.deleteCronJob.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle errors when cron jobs do not exist', async () => {
      // Arrange
      schedulerRegistry.deleteCronJob.mockImplementation(() => {
        throw new Error('Cron job not found');
      });

      // Act & Assert
      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });

  describe('checkOfflineDevices', () => {
    it('should set device offline after the configured delay', async () => {
      // Arrange
      const configuredDelay = '10';
      cacheManager.get.mockResolvedValue(configuredDelay);

      // Act
      await service.checkOfflineDevices();

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
      );
      expect(devicesService.setDeviceOfflineAfter).toHaveBeenCalledWith(10);
      // Check that updateLastExecution was called, but don't check the argument value
      expect(cronService.updateLastExecution).toHaveBeenCalled();
    });

    it('should use default delay if not configured', async () => {
      // Arrange
      cacheManager.get.mockResolvedValue(null);

      // Act
      await service.checkOfflineDevices();

      // Assert
      expect(devicesService.setDeviceOfflineAfter).toHaveBeenCalledWith(5);
    });

    it('should handle errors', async () => {
      // Arrange
      cacheManager.get.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(service.checkOfflineDevices()).resolves.not.toThrow();
    });
  });

  describe('cleanAnsibleLogs', () => {
    it('should clean ansible logs after the configured delay', async () => {
      // Arrange
      // Set delay to 1 day in seconds
      const delaySeconds = (24 * 60 * 60).toString();
      cacheManager.get.mockResolvedValue(delaySeconds);

      // Act
      await service.cleanAnsibleLogs();

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
      );
      expect(taskLogsService.cleanOldTasksAndLogs).toHaveBeenCalledWith(1);
      // Check that updateLastExecution was called, but don't check the argument value
      expect(cronService.updateLastExecution).toHaveBeenCalled();
    });

    it('should use default delay if not configured', async () => {
      // Arrange
      cacheManager.get.mockResolvedValue(null);

      // Act
      await service.cleanAnsibleLogs();

      // Assert
      // Default is 5 seconds, which should convert to 1 day minimum
      expect(taskLogsService.cleanOldTasksAndLogs).toHaveBeenCalledWith(1);
    });

    it('should handle errors', async () => {
      // Arrange
      cacheManager.get.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(service.cleanAnsibleLogs()).resolves.not.toThrow();
    });
  });

  describe('cleanServerLogs', () => {
    it('should clean server logs after the configured delay', async () => {
      // Arrange
      const configuredDelay = '30';
      cacheManager.get.mockResolvedValue(configuredDelay);

      // Act
      await service.cleanServerLogs();

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
      );
      expect(serverLogsService.deleteAllOld).toHaveBeenCalledWith(30);
      // Check that updateLastExecution was called, but don't check the argument value
      expect(cronService.updateLastExecution).toHaveBeenCalled();
    });

    it('should use default delay if not configured', async () => {
      // Arrange
      cacheManager.get.mockResolvedValue(null);

      // Act
      await service.cleanServerLogs();

      // Assert
      expect(serverLogsService.deleteAllOld).toHaveBeenCalledWith(5);
    });

    it('should handle errors', async () => {
      // Arrange
      cacheManager.get.mockRejectedValue(new Error('Cache error'));

      // Act & Assert
      await expect(service.cleanServerLogs()).resolves.not.toThrow();
    });
  });
});
