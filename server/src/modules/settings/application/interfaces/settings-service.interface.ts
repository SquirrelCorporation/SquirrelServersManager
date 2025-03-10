export interface ISettingsService {
  /**
   * Get a setting by key
   * @param key The key to get
   * @returns The setting value, or null if not found
   */
  getSetting(key: string): Promise<string | null>;

  /**
   * Get a setting by key or throw if not found
   * @param key The key to get
   * @returns The setting value
   * @throws If key doesn't exist
   */
  getSettingOrThrow(key: string): Promise<string>;

  /**
   * Get an integer setting value
   * @param key The key to get
   * @returns The integer value
   * @throws If key doesn't exist or value isn't a valid integer
   */
  getIntSetting(key: string): Promise<number>;

  /**
   * Set a setting
   * @param key The key to set
   * @param value The value to set
   * @param ttl Optional TTL in seconds
   */
  setSetting(key: string, value: string, ttl?: number): Promise<void>;

  /**
   * Set setting only if it doesn't exist
   * @param key The key to set
   * @param value The value to set
   * @param ttl Optional TTL in seconds
   * @returns true if the setting was set, false if it already existed
   */
  setSettingIfNotExists(key: string, value: string, ttl?: number): Promise<boolean>;

  /**
   * Delete a setting
   * @param key The key to delete
   */
  deleteSetting(key: string): Promise<void>;

  /**
   * Reset all settings
   */
  resetSettings(): Promise<void>;

  /**
   * Initialize default settings
   */
  initializeDefaults(): Promise<void>;

  /**
   * Get a setting or return default value if not found
   * @param key The key to get
   * @param defaultValue The default value to return if key not found
   * @returns The setting value or the default value
   */
  getSettingWithDefault<T>(key: string, defaultValue: T): Promise<T>;
}