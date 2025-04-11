import { HttpService } from '@nestjs/axios';
import { Cache } from '@nestjs/cache-manager';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import * as semver from 'semver';
import { SettingsKeys } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateService } from '../../services/update.service';

// Mock dependencies
vi.mock('semver');

// Mock package.json version
vi.mock('../../../../../package.json', () => ({
  version: '1.0.0',
}));

// Mock @nestjs/schedule
vi.mock('@nestjs/schedule', () => {
  const original = vi.importActual('@nestjs/schedule');
  return {
    ...original,
    Cron: vi.fn().mockImplementation((cronTime) => {
      return (target, key, descriptor) => {
        // Store metadata on the descriptor for testing
        descriptor.__cron = cronTime;
        return descriptor;
      };
    }),
    CronExpression: {
      EVERY_30_MINUTES: '0 */30 * * * *',
      EVERY_10_SECONDS: '*/10 * * * * *',
    },
  };
});

describe('UpdateService', () => {
  let service: UpdateService;
  let httpService: HttpService;
  let cacheManager: Cache;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock HttpService
    httpService = {
      get: vi.fn(),
    } as unknown as HttpService;

    // Create mock CacheManager
    cacheManager = {
      set: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
    } as unknown as Cache;

    // Create mock SchedulerRegistry
    schedulerRegistry = {
      deleteCronJob: vi.fn(),
    } as unknown as SchedulerRegistry;

    // Create a new instance of the service for each test
    service = new UpdateService(httpService, cacheManager, schedulerRegistry);
  });

  describe('fetchRemoteVersion', () => {
    it('should return the version from the remote release.json', async () => {
      // Mock the HTTP response
      const mockResponse: AxiosResponse = {
        data: { version: '1.1.0' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as any,
      };
      vi.mocked(httpService.get).mockReturnValue(of(mockResponse));

      // Call the private method using type casting
      const result = await (service as any).fetchRemoteVersion();

      // Verify the result
      expect(result).toBe('1.1.0');
      expect(httpService.get).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager/refs/heads/master/release.json',
      );
    });

    it('should handle errors and return undefined', async () => {
      // Mock an error response
      vi.mocked(httpService.get).mockReturnValue(throwError(() => new Error('Network error')));

      // Call the private method using type casting
      const result = await (service as any).fetchRemoteVersion();

      // Verify the result
      expect(result).toBeUndefined();
    });
  });

  describe('compareVersions', () => {
    it('should return 0 when versions are identical', () => {
      // Mock semver.valid to return true for both versions
      vi.mocked(semver.valid).mockReturnValueOnce('1.0.0' as any);
      vi.mocked(semver.valid).mockReturnValueOnce('1.0.0' as any);

      // Mock semver.compare to return 0 (identical versions)
      vi.mocked(semver.compare).mockReturnValueOnce(0);

      // Call the private method using type casting
      const result = (service as any).compareVersions('1.0.0', '1.0.0');

      // Verify the result
      expect(result).toBe(0);
      expect(semver.compare).toHaveBeenCalledWith('1.0.0', '1.0.0');
    });

    it('should return 1 when local version is newer', () => {
      // Mock semver.valid to return true for both versions
      vi.mocked(semver.valid).mockReturnValueOnce('1.1.0' as any);
      vi.mocked(semver.valid).mockReturnValueOnce('1.0.0' as any);

      // Mock semver.compare to return 1 (local version is newer)
      vi.mocked(semver.compare).mockReturnValueOnce(1);

      // Call the private method using type casting
      const result = (service as any).compareVersions('1.1.0', '1.0.0');

      // Verify the result
      expect(result).toBe(1);
    });

    it('should return -1 when remote version is newer', () => {
      // Mock semver.valid to return true for both versions
      vi.mocked(semver.valid).mockReturnValueOnce('1.0.0' as any);
      vi.mocked(semver.valid).mockReturnValueOnce('1.1.0' as any);

      // Mock semver.compare to return -1 (remote version is newer)
      vi.mocked(semver.compare).mockReturnValueOnce(-1);

      // Call the private method using type casting
      const result = (service as any).compareVersions('1.0.0', '1.1.0');

      // Verify the result
      expect(result).toBe(-1);
    });

    it('should return null when local version is invalid', () => {
      // Mock semver.valid to return false for local version
      vi.mocked(semver.valid).mockReturnValueOnce(null);

      // Call the private method using type casting
      const result = (service as any).compareVersions('invalid', '1.0.0');

      // Verify the result
      expect(result).toBeNull();
      expect(semver.compare).not.toHaveBeenCalled();
    });

    it('should return null when remote version is invalid', () => {
      // Mock semver.valid to return true for local but false for remote
      vi.mocked(semver.valid).mockReturnValueOnce('1.0.0' as any);
      vi.mocked(semver.valid).mockReturnValueOnce(null);

      // Call the private method using type casting
      const result = (service as any).compareVersions('1.0.0', 'invalid');

      // Verify the result
      expect(result).toBeNull();
      expect(semver.compare).not.toHaveBeenCalled();
    });
  });

  describe('checkVersion', () => {
    it('should set cache to empty string when versions are identical', async () => {
      // Mock fetchRemoteVersion to return a version
      vi.spyOn(service as any, 'fetchRemoteVersion').mockResolvedValueOnce('1.0.0');

      // Mock compareVersions to return 0 (identical versions)
      vi.spyOn(service as any, 'compareVersions').mockReturnValueOnce(0);

      // Call the method
      await service.checkVersion();

      // Verify the result
      expect(cacheManager.set).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE,
        '',
      );
    });

    it('should set cache to empty string when local version is newer', async () => {
      // Mock fetchRemoteVersion to return a version
      vi.spyOn(service as any, 'fetchRemoteVersion').mockResolvedValueOnce('0.9.0');

      // Mock compareVersions to return 1 (local version is newer)
      vi.spyOn(service as any, 'compareVersions').mockReturnValueOnce(1);

      // Call the method
      await service.checkVersion();

      // Verify the result
      expect(cacheManager.set).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE,
        '',
      );
    });

    it('should set cache to remote version when remote version is newer', async () => {
      // Mock fetchRemoteVersion to return a version
      vi.spyOn(service as any, 'fetchRemoteVersion').mockResolvedValueOnce('1.1.0');

      // Mock compareVersions to return -1 (remote version is newer)
      vi.spyOn(service as any, 'compareVersions').mockReturnValueOnce(-1);

      // Call the method
      await service.checkVersion();

      // Verify the result
      expect(cacheManager.set).toHaveBeenCalledWith(
        SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE,
        '1.1.0',
      );
    });
  });

  describe('getLocalVersion', () => {
    it('should return the current local version', () => {
      const result = service.getLocalVersion();
      expect(result).toBe('1.0.0');
    });
  });
});
