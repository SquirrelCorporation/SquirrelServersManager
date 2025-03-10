// Export classes
export * from './cache.module';
export * from './cache.service';
export * from './cache-default.service';
export * from './cache.constants';
export * from './interfaces/cache-options.interface';
export * from './interfaces/cache.service.interface';

// Export legacy compatibility layer
export * from './legacy-compat';

// Service interface exports
export { ICacheService } from './interfaces/cache.service.interface';

// Service implementation exports
export { CacheService } from './cache.service';

// Module export
export { CacheModule } from './cache.module';

// Constants export
export { CACHE_MODULE_OPTIONS } from './cache.constants';

// Interfaces export
export { CacheModuleOptions } from './interfaces/cache-options.interface';