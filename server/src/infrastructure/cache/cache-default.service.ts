import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SettingsKeys } from 'ssm-shared-lib';
import { CacheService } from './cache.service';

@Injectable()
export class CacheDefaultService implements OnModuleInit {
  private readonly logger = new Logger(CacheDefaultService.name);

  // Default values for Redis cache
  private readonly REDIS_DEFAULT_VALUES: { key: string; value: string; nx: boolean }[] = [
    {
      key: SettingsKeys.GeneralSettingsKeys.SCHEME_VERSION,
      value: SettingsKeys.DefaultValue.SCHEME_VERSION,
      nx: false,
    },
    {
      key: SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
      value: SettingsKeys.DefaultValue.SERVER_LOG_RETENTION_IN_DAYS,
      nx: true,
    },
    {
      key: SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
      value: SettingsKeys.DefaultValue.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
      nx: true,
    },
    {
      key: SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
      value: SettingsKeys.DefaultValue.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
      nx: true,
    },
    {
      key: SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
      value: SettingsKeys.DefaultValue.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
      nx: true,
    },
    {
      key: SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
      value: SettingsKeys.DefaultValue.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
      nx: true,
    },
    {
      key: SettingsKeys.GeneralSettingsKeys.CONTAINER_STATS_RETENTION_IN_DAYS,
      value: SettingsKeys.DefaultValue.CONTAINER_STATS_RETENTION_IN_DAYS,
      nx: true,
    },
    {
      key: SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS,
      value: SettingsKeys.DefaultValue.DEVICE_STATS_RETENTION_IN_DAYS,
      nx: true,
    },
    {
      key: SettingsKeys.GeneralSettingsKeys.UPDATE_AVAILABLE,
      value: SettingsKeys.DefaultValue.UPDATE_AVAILABLE,
      nx: true,
    },
  ];

  constructor(private readonly cacheService: CacheService) {}

  async onModuleInit() {
    await this.initializeDefaults();
  }

  /**
   * Initialize default values in Redis cache
   */
  async initializeDefaults(): Promise<void> {
    this.logger.log('Initializing default Redis values');

    try {
      for (const item of this.REDIS_DEFAULT_VALUES) {
        if (item.nx) {
          // Set only if key doesn't exist yet
          await this.cacheService.setNX(item.key, item.value);
        } else {
          // Always set the key
          await this.cacheService.set(item.key, item.value);
        }
      }
      this.logger.log('Default Redis values initialized successfully');
    } catch (error) {
      this.logger.error(`Error initializing default Redis values: ${error.message}`);
    }
  }
}