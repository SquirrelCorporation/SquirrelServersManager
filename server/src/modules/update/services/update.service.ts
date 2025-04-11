import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import * as semver from 'semver';
import { SettingsKeys } from 'ssm-shared-lib';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { IUpdateService } from '@modules/update/doma../../domain/interfaces/update-service.interface';
import { version } from '../../../../package.json';

@Injectable()
export class UpdateService implements IUpdateService {
  private readonly logger = new Logger(UpdateService.name);
  private readonly RELEASE_URL =
    'https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager/refs/heads/master/release.json';

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Initialize the service
   */
  onModuleInit() {
    this.logger.log('UpdateService initialized');
    try {
      try {
        // Try to delete any existing job first
        this.schedulerRegistry.deleteCronJob('checkVersion');
      } catch {
        // Job didn't exist, which is fine
      }
      this.logger.log('Version check cron job registered');
    } catch (error) {
      this.logger.error('Failed to register version check cron job:', error);
    }
  }

  /**
   * Fetches the latest version from the GitHub repository
   * @returns The latest version string or undefined if the fetch fails
   */
  private async fetchRemoteVersion(): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(this.httpService.get(this.RELEASE_URL));
      return response?.data?.version;
    } catch (error: any) {
      this.logger.error(`Failed to fetch remote version: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Compares the local version with the remote version
   * @param localVersion The local version to compare
   * @param remoteVersion The remote version to compare with
   * @returns 0 if versions are identical, 1 if local is newer, -1 if remote is newer, null if invalid version format
   */
  private compareVersions(localVersion: string, remoteVersion: string): number | null {
    if (!semver.valid(localVersion)) {
      this.logger.error('Invalid local version format');
      return null;
    }

    if (!semver.valid(remoteVersion)) {
      this.logger.error('Invalid remote version format');
      return null;
    }

    return semver.compare(localVersion, remoteVersion);
  }

  /**
   * Checks if an update is available and stores the result in cache
   * Runs every 30 minutes
   * @returns Promise that resolves when the check is complete
   */
  @Cron(CronExpression.EVERY_30_MINUTES, { name: 'checkVersion' })
  public async checkVersion(): Promise<void> {
    this.logger.log('Checking for updates...');
    const localVersion = version;
    const remoteVersion = await this.fetchRemoteVersion();

    if (!remoteVersion) {
      this.logger.error("Couldn't determine the latest remote version.");
      return;
    }

    const comparison = this.compareVersions(localVersion, remoteVersion);

    if (comparison === 0) {
      this.logger.log('SSM remote and current versions are identical, no update available.');
      await this.cacheManager.set(SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE, '');
    } else if (comparison === 1) {
      this.logger.log(
        `The SSM local version (${localVersion}) is newer than the remote version (${remoteVersion}).`,
      );
      await this.cacheManager.set(SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE, '');
    } else if (comparison === -1) {
      this.logger.log(
        `The SSM local version ${localVersion} is older than the remote version (${remoteVersion}).`,
      );
      await this.cacheManager.set(SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE, remoteVersion);
    }
  }

  /**
   * Gets the current local version
   * @returns The current local version
   */
  public getLocalVersion(): string {
    return version;
  }
}
