import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SettingsKeys } from 'ssm-shared-lib';
import { ISettingsService } from '../interfaces/settings-service.interface';
import { ISetting } from '../../domain/entities/setting.entity';
import { ISettingRepository, SETTING_REPOSITORY } from '../../domain/repositories/setting-repository.interface';

@Injectable()
export class SettingsService implements ISettingsService, OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  // Default values for settings
  private readonly DEFAULT_SETTINGS: ISetting[] = [
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

  constructor(
    @Inject(SETTING_REPOSITORY)
    private readonly settingRepository: ISettingRepository,
  ) {}

  async onModuleInit() {
    await this.initializeDefaults();
  }

  async getSetting(key: string): Promise<string | null> {
    return this.settingRepository.get(key);
  }

  async getSettingOrThrow(key: string): Promise<string> {
    return this.settingRepository.getOrThrow(key);
  }

  async getIntSetting(key: string): Promise<number> {
    return this.settingRepository.getInt(key);
  }

  async setSetting(key: string, value: string, ttl?: number): Promise<void> {
    const setting: ISetting = { key, value };
    return this.settingRepository.set(setting, ttl);
  }

  async setSettingIfNotExists(key: string, value: string, ttl?: number): Promise<boolean> {
    const setting: ISetting = { key, value, nx: true };
    return this.settingRepository.setNX(setting, ttl);
  }

  async deleteSetting(key: string): Promise<void> {
    return this.settingRepository.delete(key);
  }

  async resetSettings(): Promise<void> {
    return this.settingRepository.reset();
  }

  async getSettingWithDefault<T>(key: string, defaultValue: T): Promise<T> {
    return this.settingRepository.getWithDefault(key, defaultValue);
  }

  /**
   * Initialize default settings
   */
  async initializeDefaults(): Promise<void> {
    this.logger.log('Initializing default settings');

    try {
      for (const setting of this.DEFAULT_SETTINGS) {
        if (setting.nx) {
          // Set only if key doesn't exist yet
          await this.settingRepository.setNX(setting);
        } else {
          // Always set the key
          await this.settingRepository.set(setting);
        }
      }
      this.logger.log('Default settings initialized successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error initializing default settings: ${errorMessage}`);
    }
  }
}