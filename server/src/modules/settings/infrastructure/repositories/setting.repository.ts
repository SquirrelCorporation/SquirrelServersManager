import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ISetting } from '../../domain/entities/setting.entity';
import { ISettingRepository } from '../../domain/repositories/setting-repository.interface';

@Injectable()
export class SettingRepository implements ISettingRepository {
  private readonly logger = new Logger(SettingRepository.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Get a setting by key
   * @param key The key to get
   * @returns The setting value, or null if not found
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.cacheManager.get<string>(key);
    } catch (error: any) {
      this.logger.error(`Error getting key ${key} from cache: ${error.message}`);
      return null;
    }
  }

  /**
   * Get a setting by key or throw if not found
   * @param key The key to get
   * @returns The setting value
   * @throws If key doesn't exist
   */
  async getOrThrow(key: string): Promise<string> {
    const value = await this.get(key);
    if (value === null || value === undefined) {
      throw new Error(`Setting key ${key} doesn't exist`);
    }
    return value;
  }

  /**
   * Get an integer setting value
   * @param key The key to get
   * @returns The integer value
   * @throws If key doesn't exist or value isn't a valid integer
   */
  async getInt(key: string): Promise<number> {
    const value = await this.getOrThrow(key);
    return parseInt(value, 10);
  }

  /**
   * Set a setting
   * @param setting The setting to set
   * @param ttl Optional TTL in seconds
   */
  async set(setting: ISetting, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(setting.key, setting.value, ttl);
    } catch (error: any) {
      this.logger.error(`Error setting key ${setting.key} in cache: ${error.message}`);
    }
  }

  /**
   * Set setting only if it doesn't exist
   * @param setting The setting to set
   * @param ttl Optional TTL in seconds
   * @returns true if the setting was set, false if it already existed
   */
  async setNX(setting: ISetting, ttl?: number): Promise<boolean> {
    const exists = await this.get(setting.key);
    if (exists !== null && exists !== undefined) {
      return false;
    }

    await this.set(setting, ttl);
    return true;
  }

  /**
   * Delete a setting
   * @param key The key to delete
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error: any) {
      this.logger.error(`Error deleting key ${key} from cache: ${error.message}`);
    }
  }

  /**
   * Reset all settings
   */
  async reset(): Promise<void> {
    try {
      // Cache manager doesn't have a reset method, so we'll log a warning
      this.logger.warn('Cache reset not implemented in this repository');
    } catch (error: any) {
      this.logger.error(`Error resetting cache: ${error.message}`);
    }
  }

  /**
   * Get a setting or return default value if not found
   * @param key The key to get
   * @param defaultValue The default value to return if key not found
   * @returns The setting value or the default value
   */
  async getWithDefault<T>(key: string, defaultValue: T): Promise<T> {
    const value = await this.get(key);
    return value !== null && value !== undefined ? (value as unknown as T) : defaultValue;
  }
}