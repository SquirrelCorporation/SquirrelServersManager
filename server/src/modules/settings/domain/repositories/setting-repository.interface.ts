import { ISetting } from '../entities/setting.entity';

export const SETTING_REPOSITORY = 'SETTING_REPOSITORY';

/**
 * Setting repository interface in the domain layer
 */
export interface ISettingRepository {
  /**
   * Get a setting by key
   * @param key The key to get
   * @returns The setting, or null if not found
   */
  get(key: string): Promise<string | null>;

  /**
   * Get a setting by key or throw if not found
   * @param key The key to get
   * @returns The setting value
   * @throws If key doesn't exist
   */
  getOrThrow(key: string): Promise<string>;

  /**
   * Get an integer setting value
   * @param key The key to get
   * @returns The integer value
   * @throws If key doesn't exist or value isn't a valid integer
   */
  getInt(key: string): Promise<number>;

  /**
   * Set a setting
   * @param setting The setting to set
   * @param ttl Optional TTL in seconds
   */
  set(setting: ISetting, ttl?: number): Promise<void>;

  /**
   * Set setting only if it doesn't exist
   * @param setting The setting to set
   * @param ttl Optional TTL in seconds
   * @returns true if the setting was set, false if it already existed
   */
  setNX(setting: ISetting, ttl?: number): Promise<boolean>;

  /**
   * Delete a setting
   * @param key The key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Reset all settings
   */
  reset(): Promise<void>;

  /**
   * Get a setting or return default value if not found
   * @param key The key to get
   * @param defaultValue The default value to return if key not found
   * @returns The setting value or the default value
   */
  getWithDefault<T>(key: string, defaultValue: T): Promise<T>;
}
