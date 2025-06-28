/**
 * Cache Management Strategies
 * Handles data cleanup, pagination, and memory optimization for TanStack Query
 */

import { QueryClient } from '@tanstack/react-query';

// ============================================================================
// CACHE CLEANUP STRATEGIES
// ============================================================================

export interface CacheCleanupConfig {
  maxAge: number; // milliseconds
  maxItems?: number;
  staleTime: number;
  gcTime: number; // garbage collection time (formerly cacheTime)
}

export const CACHE_CONFIGS = {
  // High-frequency data (real-time updates)
  realtime: {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxItems: 50,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  
  // Standard data (containers, images, etc.)
  standard: {
    maxAge: 15 * 60 * 1000, // 15 minutes
    maxItems: 100,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Long-lived data (settings, device info)
  persistent: {
    maxAge: 60 * 60 * 1000, // 1 hour
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  },
  
  // Static data (rarely changes)
  static: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

/**
 * Automatic cache cleanup based on data age and size
 */
export class CacheManager {
  private queryClient: QueryClient;
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }
  
  /**
   * Start automatic cache cleanup
   */
  startCleanup(intervalMs = 5 * 60 * 1000) { // Every 5 minutes
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, intervalMs);
  }
  
  /**
   * Stop automatic cache cleanup
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * Perform cache cleanup based on age and size limits
   */
  private performCleanup() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Group queries by cache strategy
    const queryGroups = this.groupQueriesByStrategy(queries);
    
    Object.entries(queryGroups).forEach(([strategy, queries]) => {
      const config = CACHE_CONFIGS[strategy as keyof typeof CACHE_CONFIGS];
      if (!config) return;
      
      // Remove old queries
      const now = Date.now();
      const oldQueries = queries.filter(query => {
        const age = now - (query.state.dataUpdatedAt || 0);
        return age > config.maxAge;
      });
      
      oldQueries.forEach(query => {
        cache.remove(query);
      });
      
      // Limit number of queries if configured
      if (config.maxItems && queries.length > config.maxItems) {
        const sortedByAge = queries
          .filter(q => !oldQueries.includes(q))
          .sort((a, b) => 
            (b.state.dataUpdatedAt || 0) - (a.state.dataUpdatedAt || 0)
          );
        
        const toRemove = sortedByAge.slice(config.maxItems);
        toRemove.forEach(query => cache.remove(query));
      }
    });
    
    console.log(`Cache cleanup completed. Active queries: ${cache.getAll().length}`);
  }
  
  /**
   * Group queries by their cache strategy based on query key patterns
   */
  private groupQueriesByStrategy(queries: any[]) {
    const groups: Record<string, any[]> = {
      realtime: [],
      standard: [],
      persistent: [],
      static: [],
    };
    
    queries.forEach(query => {
      const key = query.queryKey;
      if (!Array.isArray(key)) return;
      
      const keyString = key.join(':');
      
      // Real-time data patterns
      if (keyString.includes('stats') || keyString.includes('status')) {
        groups.realtime.push(query);
      }
      // Standard data patterns
      else if (keyString.includes('containers') || keyString.includes('images') || keyString.includes('volumes')) {
        groups.standard.push(query);
      }
      // Persistent data patterns
      else if (keyString.includes('settings') || keyString.includes('devices')) {
        groups.persistent.push(query);
      }
      // Everything else as static
      else {
        groups.static.push(query);
      }
    });
    
    return groups;
  }
  
  /**
   * Manually clear all cache data
   */
  clearAll() {
    this.queryClient.clear();
    console.log('All cache data cleared');
  }
  
  /**
   * Clear cache for specific patterns
   */
  clearPattern(pattern: string) {
    this.queryClient.removeQueries({
      predicate: (query) => {
        const keyString = query.queryKey.join(':');
        return keyString.includes(pattern);
      }
    });
    console.log(`Cache cleared for pattern: ${pattern}`);
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    const groups = this.groupQueriesByStrategy(queries);
    
    return {
      total: queries.length,
      byStrategy: Object.fromEntries(
        Object.entries(groups).map(([strategy, queries]) => [
          strategy, 
          { count: queries.length, size: this.estimateSize(queries) }
        ])
      ),
      memory: this.estimateSize(queries),
    };
  }
  
  /**
   * Estimate memory usage of queries (rough calculation)
   */
  private estimateSize(queries: any[]): number {
    return queries.reduce((total, query) => {
      try {
        const data = query.state.data;
        if (!data) return total;
        
        // Rough estimation: 1KB per object in array, 100B per primitive
        if (Array.isArray(data)) {
          return total + (data.length * 1024);
        } else if (typeof data === 'object') {
          return total + 1024;
        } else {
          return total + 100;
        }
      } catch {
        return total + 100;
      }
    }, 0);
  }
}

// ============================================================================
// PAGINATION STRATEGIES
// ============================================================================

export interface PaginationOptions {
  page: number;
  pageSize: number;
  totalCount?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Create paginated query keys that are cache-efficient
 */
export function createPaginatedQueryKey(
  baseKey: string[], 
  options: PaginationOptions,
  filters?: Record<string, any>
) {
  return [
    ...baseKey,
    'paginated',
    {
      page: options.page,
      pageSize: options.pageSize,
      filters: filters || {},
    }
  ];
}

/**
 * Merge paginated responses for infinite scroll scenarios
 */
export function mergePaginatedData<T>(
  existingData: PaginatedResponse<T> | undefined,
  newData: PaginatedResponse<T>
): PaginatedResponse<T> {
  if (!existingData) {
    return newData;
  }
  
  return {
    data: [...existingData.data, ...newData.data],
    pagination: newData.pagination,
  };
}

/**
 * Virtual pagination for large datasets already in memory
 */
export function virtualPaginate<T>(
  data: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(data.length / pageSize);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      totalCount: data.length,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Optimized pagination hook that manages cache efficiently
 */
export function usePaginationState(initialPageSize = 25) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);
  
  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);
  
  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);
  
  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);
  
  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  }, []);
  
  return {
    page,
    pageSize,
    setPage: goToPage,
    setPageSize: changePageSize,
    nextPage,
    prevPage,
    resetPagination,
  };
}

// ============================================================================
// MEMORY OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Debounced cache invalidation to prevent excessive API calls
 */
export function createDebouncedInvalidator(
  queryClient: QueryClient,
  delayMs = 1000
) {
  const timeouts = new Map<string, NodeJS.Timeout>();
  
  return (queryKey: unknown[]) => {
    const keyString = JSON.stringify(queryKey);
    
    // Clear existing timeout
    const existingTimeout = timeouts.get(keyString);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey });
      timeouts.delete(keyString);
    }, delayMs);
    
    timeouts.set(keyString, timeout);
  };
}

/**
 * Smart prefetching based on user behavior patterns
 */
export class SmartPrefetcher {
  private queryClient: QueryClient;
  private accessPatterns = new Map<string, number>();
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }
  
  /**
   * Track access to queries for intelligent prefetching
   */
  trackAccess(queryKey: unknown[]) {
    const keyString = JSON.stringify(queryKey);
    const count = this.accessPatterns.get(keyString) || 0;
    this.accessPatterns.set(keyString, count + 1);
  }
  
  /**
   * Prefetch related data based on access patterns
   */
  prefetchRelated(baseQueryKey: unknown[], relatedQueries: unknown[][]) {
    const baseKeyString = JSON.stringify(baseQueryKey);
    const accessCount = this.accessPatterns.get(baseKeyString) || 0;
    
    // Only prefetch if this query is accessed frequently
    if (accessCount >= 3) {
      relatedQueries.forEach(queryKey => {
        this.queryClient.prefetchQuery({
          queryKey,
          staleTime: CACHE_CONFIGS.standard.staleTime,
        });
      });
    }
  }
  
  /**
   * Get prefetch recommendations
   */
  getRecommendations(): Array<{ queryKey: string; accessCount: number }> {
    return Array.from(this.accessPatterns.entries())
      .map(([queryKey, count]) => ({ queryKey, accessCount: count }))
      .filter(item => item.accessCount >= 2)
      .sort((a, b) => b.accessCount - a.accessCount);
  }
}

// Missing import
import { useState, useCallback } from 'react';