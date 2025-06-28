/**
 * Application Cache Configuration
 * Centralized cache management with automatic cleanup and optimization
 */

import { QueryClient } from '@tanstack/react-query';
import { 
  CacheManager, 
  SmartPrefetcher, 
  createDebouncedInvalidator,
  CACHE_CONFIGS 
} from '@shared/lib/cache/cache-strategies';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

export function createOptimizedQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Use standard cache configuration as default
        staleTime: CACHE_CONFIGS.standard.staleTime,
        gcTime: CACHE_CONFIGS.standard.gcTime,
        
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        
        // Network mode configuration
        networkMode: 'online',
        
        // Refetch configuration
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        networkMode: 'online',
      },
    },
  });
}

// ============================================================================
// CACHE MANAGER SINGLETON
// ============================================================================

let cacheManager: CacheManager | null = null;
let smartPrefetcher: SmartPrefetcher | null = null;
let debouncedInvalidator: ReturnType<typeof createDebouncedInvalidator> | null = null;

export function initializeCacheManagement(queryClient: QueryClient) {
  // Initialize cache manager
  cacheManager = new CacheManager(queryClient);
  cacheManager.startCleanup();
  
  // Initialize smart prefetcher
  smartPrefetcher = new SmartPrefetcher(queryClient);
  
  // Initialize debounced invalidator
  debouncedInvalidator = createDebouncedInvalidator(queryClient);
  
  // Setup performance monitoring
  setupPerformanceMonitoring(queryClient);
  
  // Setup memory monitoring
  setupMemoryMonitoring();
  
  console.log('Cache management initialized');
}

export function cleanupCacheManagement() {
  if (cacheManager) {
    cacheManager.stopCleanup();
    cacheManager = null;
  }
  
  smartPrefetcher = null;
  debouncedInvalidator = null;
  
  console.log('Cache management cleaned up');
}

export function getCacheManager(): CacheManager | null {
  return cacheManager;
}

export function getSmartPrefetcher(): SmartPrefetcher | null {
  return smartPrefetcher;
}

export function getDebouncedInvalidator() {
  return debouncedInvalidator;
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

function setupPerformanceMonitoring(queryClient: QueryClient) {
  const cache = queryClient.getQueryCache();
  
  // Monitor cache hits/misses
  let cacheHits = 0;
  let cacheMisses = 0;
  
  cache.subscribe((event) => {
    if (event.type === 'queryAdded') {
      if (event.query.state.data !== undefined) {
        cacheHits++;
      } else {
        cacheMisses++;
      }
    }
  });
  
  // Log performance metrics every 5 minutes
  setInterval(() => {
    const hitRate = cacheHits + cacheMisses > 0 
      ? (cacheHits / (cacheHits + cacheMisses)) * 100 
      : 0;
    
    console.log(`Cache Performance: ${hitRate.toFixed(1)}% hit rate (${cacheHits} hits, ${cacheMisses} misses)`);
    
    // Reset counters
    cacheHits = 0;
    cacheMisses = 0;
  }, 5 * 60 * 1000);
}

function setupMemoryMonitoring() {
  // Monitor memory usage every 2 minutes
  setInterval(() => {
    if (cacheManager) {
      const stats = cacheManager.getStats();
      console.log('Cache Memory Stats:', {
        totalQueries: stats.total,
        estimatedMemory: `${(stats.memory / 1024 / 1024).toFixed(2)} MB`,
        breakdown: stats.byStrategy,
      });
      
      // Warn if memory usage is high
      if (stats.memory > 50 * 1024 * 1024) { // 50MB
        console.warn('High cache memory usage detected. Consider clearing old data.');
      }
    }
  }, 2 * 60 * 1000);
}

// ============================================================================
// CACHE OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Optimize cache for specific use cases
 */
export class CacheOptimizer {
  private queryClient: QueryClient;
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }
  
  /**
   * Optimize for real-time dashboard usage
   */
  optimizeForDashboard() {
    // Prefetch critical dashboard data
    const criticalQueries = [
      ['dashboard', 'stats'],
      ['containers', 'summary'],
      ['devices', 'status'],
    ];
    
    criticalQueries.forEach(queryKey => {
      this.queryClient.prefetchQuery({
        queryKey,
        staleTime: CACHE_CONFIGS.realtime.staleTime,
      });
    });
  }
  
  /**
   * Optimize for container management workflow
   */
  optimizeForContainers(deviceUuid: string) {
    const containerQueries = [
      ['containers', 'list', { deviceUuid }],
      ['containers', 'stats', { deviceUuid }],
      ['images', 'list', { deviceUuid }],
      ['volumes', 'list', { deviceUuid }],
    ];
    
    containerQueries.forEach(queryKey => {
      this.queryClient.prefetchQuery({
        queryKey,
        staleTime: CACHE_CONFIGS.standard.staleTime,
      });
    });
  }
  
  /**
   * Clear cache for device switch
   */
  optimizeForDeviceSwitch(oldDeviceUuid?: string, newDeviceUuid?: string) {
    // Clear old device data
    if (oldDeviceUuid) {
      this.queryClient.removeQueries({
        predicate: (query) => {
          const keyString = JSON.stringify(query.queryKey);
          return keyString.includes(oldDeviceUuid);
        }
      });
    }
    
    // Prefetch new device data
    if (newDeviceUuid) {
      this.optimizeForContainers(newDeviceUuid);
    }
  }
  
  /**
   * Optimize memory usage by removing stale data
   */
  optimizeMemory() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    const now = Date.now();
    
    // Remove queries that haven't been accessed in the last hour
    const staleQueries = queries.filter(query => {
      const lastAccess = query.state.dataUpdatedAt || 0;
      return (now - lastAccess) > 60 * 60 * 1000; // 1 hour
    });
    
    staleQueries.forEach(query => {
      cache.remove(query);
    });
    
    console.log(`Memory optimization: Removed ${staleQueries.length} stale queries`);
  }
}

// ============================================================================
// CACHE PRESETS FOR DIFFERENT SCENARIOS
// ============================================================================

export const CACHE_PRESETS = {
  /**
   * High-frequency trading dashboard
   */
  realTimeDashboard: {
    staleTime: 5 * 1000, // 5 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 10 * 1000, // 10 seconds
  },
  
  /**
   * Standard container management
   */
  containerManagement: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false,
  },
  
  /**
   * Settings and configuration
   */
  settings: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: false,
  },
  
  /**
   * Static reference data
   */
  staticData: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchInterval: false,
  },
} as const;

// ============================================================================
// DEVELOPMENT UTILITIES
// ============================================================================

export function createDevCacheUtils(queryClient: QueryClient) {
  if (process.env.NODE_ENV !== 'development') {
    return {};
  }
  
  return {
    /**
     * Debug cache state
     */
    debugCache() {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      console.group('Cache Debug Info');
      console.log('Total queries:', queries.length);
      console.log('Queries by state:', {
        fresh: queries.filter(q => q.state.status === 'success' && !q.isStale()).length,
        stale: queries.filter(q => q.isStale()).length,
        loading: queries.filter(q => q.state.status === 'pending').length,
        error: queries.filter(q => q.state.status === 'error').length,
      });
      console.log('All queries:', queries.map(q => ({
        key: q.queryKey,
        status: q.state.status,
        dataUpdatedAt: new Date(q.state.dataUpdatedAt || 0),
        isStale: q.isStale(),
      })));
      console.groupEnd();
    },
    
    /**
     * Force clear all cache
     */
    clearAllCache() {
      queryClient.clear();
      console.log('All cache cleared');
    },
    
    /**
     * Get cache statistics
     */
    getCacheStats() {
      if (cacheManager) {
        return cacheManager.getStats();
      }
      return null;
    },
  };
}

// Make debug utils available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).cacheUtils = createDevCacheUtils;
}