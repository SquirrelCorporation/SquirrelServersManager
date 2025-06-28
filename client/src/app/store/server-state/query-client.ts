import { QueryClient } from '@tanstack/react-query';
import { 
  createOptimizedQueryClient,
  initializeCacheManagement,
  cleanupCacheManagement 
} from '@app/cache/cache-config';

/**
 * React Query client configuration optimized for enterprise applications
 * with automatic cache management and performance optimization
 */
export const queryClient = createOptimizedQueryClient();

// Initialize cache management on client creation
initializeCacheManagement(queryClient);

// Cleanup cache management on application shutdown
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupCacheManagement();
  });
}

// Import simplified query keys - NO BACKWARD COMPATIBILITY
import { queryKeys, QueryKeyPatterns, QueryKeyUtils } from '@shared/lib/query-keys/query-keys';

// Export for app usage
export { queryKeys, QueryKeyPatterns, QueryKeyUtils };