export const CACHE_SERVICE = 'ICacheService';

export interface ICacheService {
  /**
   * Get a value from the cache
   * @param key The key to get
   * @returns The value, or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Get a value from cache or throw if not found
   * @param key The key to get
   * @returns The value
   * @throws If key doesn't exist
   */
  getOrThrow<T>(key: string): Promise<T>;

  /**
   * Get an integer value from cache
   * @param key The key to get
   * @returns The integer value
   * @throws If key doesn't exist or value isn't a valid integer
   */
  getInt(key: string): Promise<number>;

  /**
   * Set a value in the cache
   * @param key The key to set
   * @param value The value to set
   * @param ttl Optional TTL in seconds
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Set key only if it doesn't exist (NX option)
   * @param key The key to set
   * @param value The value to set
   * @param ttl Optional TTL in seconds
   * @returns true if the key was set, false if it already existed
   */
  setNX<T>(key: string, value: T, ttl?: number): Promise<boolean>;

  /**
   * Delete a key from the cache
   * @param key The key to delete
   */
  del(key: string): Promise<void>;

  /**
   * Reset the cache (delete all keys)
   */
  reset(): Promise<void>;

  /**
   * Get a value from cache or return default value if not found
   * @param key The key to get
   * @param defaultValue The default value to return if key not found
   * @returns The value from cache or the default value
   */
  getFromCache<T>(key: string, defaultValue: T): Promise<T>;
}
