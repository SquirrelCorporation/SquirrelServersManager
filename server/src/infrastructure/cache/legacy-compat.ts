/**
 * Compatibility layer for legacy code that uses the old Redis cache implementation
 * This file provides the same interface as the old implementation, but uses the new CacheService
 */

import { CacheService } from './cache.service';

let cacheService: CacheService;

/**
 * Get Redis client connection URI
 */
export const dbURI = `redis://${process.env.REDIS_HOST || ''}:${process.env.REDIS_PORT || '6379'}`;

/**
 * Get cache service instance
 */
export function getCacheService(): CacheService {
  if (!cacheService) {
    cacheService = globalThis.nestApp?.get(CacheService);
    if (!cacheService) {
      throw new Error('Cache service not available. Make sure the application is initialized.');
    }
  }
  return cacheService;
}

/**
 * Get a value from the cache
 * @param key The key to get
 * @returns The value or null if not found
 */
export async function getFromCache(key: string): Promise<string | null> {
  return getCacheService().get<string>(key);
}

/**
 * Get a value from cache, throwing if not found
 * @param key The key to get
 * @returns The value
 * @throws If key doesn't exist
 */
export async function getConfFromCache(key: string): Promise<string> {
  return getCacheService().getOrThrow<string>(key);
}

/**
 * Get an integer value from cache
 * @param key The key to get
 * @returns The integer value
 */
export async function getIntConfFromCache(key: string): Promise<number> {
  return getCacheService().getInt(key);
}

/**
 * Set a value in the cache
 * @param key The key to set
 * @param value The value to set
 * @param options Options like NX (only set if not exists)
 */
export async function setToCache(
  key: string,
  value: string,
  options?: { nx?: boolean; ttl?: number }
): Promise<void> {
  if (options?.nx) {
    await getCacheService().setNX(key, value, options.ttl);
  } else {
    await getCacheService().set(key, value, options?.ttl);
  }
} 