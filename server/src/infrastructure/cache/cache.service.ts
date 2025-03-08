import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Get a value from the cache
   * @param key The key to get
   * @returns The value, or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key} from cache: ${error.message}`);
      return null;
    }
  }

  /**
   * Get a value from cache or throw if not found
   * @param key The key to get
   * @returns The value
   * @throws If key doesn't exist
   */
  async getOrThrow<T>(key: string): Promise<T> {
    const value = await this.get<T>(key);
    if (value === null || value === undefined) {
      throw new Error(`Configuration key ${key} doesn't exist in cache`);
    }
    return value;
  }

  /**
   * Get an integer value from cache
   * @param key The key to get
   * @returns The integer value
   * @throws If key doesn't exist or value isn't a valid integer
   */
  async getInt(key: string): Promise<number> {
    const value = await this.getOrThrow<string>(key);
    return parseInt(value, 10);
  }

  /**
   * Set a value in the cache
   * @param key The key to set
   * @param value The value to set
   * @param ttl Optional TTL in seconds
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl ? { ttl: ttl * 1000 } : undefined);
    } catch (error) {
      this.logger.error(`Error setting key ${key} in cache: ${error.message}`);
    }
  }

  /**
   * Set key only if it doesn't exist (NX option)
   * @param key The key to set
   * @param value The value to set
   * @param ttl Optional TTL in seconds
   * @returns true if the key was set, false if it already existed
   */
  async setNX<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const exists = await this.get(key);
    if (exists !== null && exists !== undefined) {
      return false;
    }

    await this.set(key, value, ttl);
    return true;
  }

  /**
   * Delete a key from the cache
   * @param key The key to delete
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key} from cache: ${error.message}`);
    }
  }

  /**
   * Reset the cache (delete all keys)
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
    } catch (error) {
      this.logger.error(`Error resetting cache: ${error.message}`);
    }
  }
}