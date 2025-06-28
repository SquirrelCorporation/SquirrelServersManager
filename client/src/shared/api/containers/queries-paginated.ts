/**
 * Paginated Container Queries
 * Implements efficient pagination with cache optimization
 */

import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '@app/store';
import { 
  createPaginatedQueryKey, 
  virtualPaginate,
  usePaginationState,
  CACHE_CONFIGS,
  type PaginatedResponse,
  type PaginationOptions 
} from '@shared/lib/cache/cache-strategies';
import { useSelectedDevice } from '@shared/store/ui-state';
import { 
  filterContainers,
  sortContainers,
  type Container,
  type ContainerFilters 
} from '@shared/lib/container/business-logic';
import { containersApi } from './containers-api';

// ============================================================================
// PAGINATED CONTAINER QUERIES
// ============================================================================

export interface ContainerQueryOptions {
  deviceUuid?: string;
  filters?: ContainerFilters;
  sortBy?: 'name' | 'status' | 'created' | 'cpu' | 'memory';
  sortOrder?: 'asc' | 'desc';
  pagination?: PaginationOptions;
}

/**
 * Server-side paginated containers query
 */
export function usePaginatedContainers(options: ContainerQueryOptions = {}) {
  const { uuid: selectedDevice } = useSelectedDevice();
  const finalDeviceUuid = options.deviceUuid || selectedDevice;
  
  const {
    filters = {},
    sortBy = 'name',
    sortOrder = 'asc',
    pagination = { page: 1, pageSize: 25 }
  } = options;

  return useQuery({
    queryKey: createPaginatedQueryKey(
      [...queryKeys.containers.list({ deviceUuid: finalDeviceUuid })],
      pagination,
      { filters, sortBy, sortOrder }
    ),
    queryFn: async () => {
      if (!finalDeviceUuid) {
        throw new Error('No device selected');
      }

      return containersApi.getPaginatedContainers({
        deviceUuid: finalDeviceUuid,
        page: pagination.page,
        pageSize: pagination.pageSize,
        filters,
        sortBy,
        sortOrder,
      });
    },
    enabled: !!finalDeviceUuid,
    staleTime: CACHE_CONFIGS.standard.staleTime,
    gcTime: CACHE_CONFIGS.standard.gcTime,
  });
}

/**
 * Client-side virtual pagination for smaller datasets
 */
export function useVirtualPaginatedContainers(options: ContainerQueryOptions = {}) {
  const { uuid: selectedDevice } = useSelectedDevice();
  const finalDeviceUuid = options.deviceUuid || selectedDevice;
  
  const {
    filters = {},
    sortBy = 'name',
    sortOrder = 'asc',
    pagination = { page: 1, pageSize: 25 }
  } = options;

  // Get all containers first
  const { data: allContainers = [], isLoading, error } = useQuery({
    queryKey: [...queryKeys.containers.list({ deviceUuid: finalDeviceUuid })],
    queryFn: () => containersApi.getContainers({ deviceUuid: finalDeviceUuid }),
    enabled: !!finalDeviceUuid,
    staleTime: CACHE_CONFIGS.standard.staleTime,
    gcTime: CACHE_CONFIGS.standard.gcTime,
  });

  // Apply business logic and pagination in memory
  const paginatedData = useMemo(() => {
    if (!allContainers.length) {
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize: pagination.pageSize,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // Apply business logic
    const filtered = filterContainers(allContainers, filters);
    const sorted = sortContainers(filtered, sortBy, sortOrder);
    
    // Apply virtual pagination
    return virtualPaginate(sorted, pagination.page, pagination.pageSize);
  }, [allContainers, filters, sortBy, sortOrder, pagination.page, pagination.pageSize]);

  return {
    data: paginatedData,
    isLoading,
    error,
    allContainers,
  };
}

/**
 * Infinite scroll containers query
 */
export function useInfiniteContainers(options: Omit<ContainerQueryOptions, 'pagination'> = {}) {
  const { uuid: selectedDevice } = useSelectedDevice();
  const finalDeviceUuid = options.deviceUuid || selectedDevice;
  
  const {
    filters = {},
    sortBy = 'name',
    sortOrder = 'asc'
  } = options;

  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.containers.list({ deviceUuid: finalDeviceUuid }),
      'infinite',
      { filters, sortBy, sortOrder }
    ],
    queryFn: async ({ pageParam = 1 }) => {
      if (!finalDeviceUuid) {
        throw new Error('No device selected');
      }

      return containersApi.getPaginatedContainers({
        deviceUuid: finalDeviceUuid,
        page: pageParam,
        pageSize: 20, // Smaller page size for infinite scroll
        filters,
        sortBy,
        sortOrder,
      });
    },
    enabled: !!finalDeviceUuid,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasNext 
        ? lastPage.pagination.page + 1 
        : undefined;
    },
    staleTime: CACHE_CONFIGS.standard.staleTime,
    gcTime: CACHE_CONFIGS.standard.gcTime,
  });
}

// ============================================================================
// PAGINATION HOOKS
// ============================================================================

/**
 * Complete pagination hook with business logic integration
 */
export function useContainerPagination(initialPageSize = 25) {
  const paginationState = usePaginationState(initialPageSize);
  const queryClient = useQueryClient();
  
  // Optimized cache prefetching
  const prefetchNextPage = useMemo(() => {
    return (currentOptions: ContainerQueryOptions) => {
      if (!currentOptions.pagination) return;
      
      const nextPageOptions = {
        ...currentOptions,
        pagination: {
          ...currentOptions.pagination,
          page: currentOptions.pagination.page + 1,
        },
      };
      
      const nextPageKey = createPaginatedQueryKey(
        [...queryKeys.containers.list({ deviceUuid: currentOptions.deviceUuid })],
        nextPageOptions.pagination,
        { 
          filters: currentOptions.filters, 
          sortBy: currentOptions.sortBy, 
          sortOrder: currentOptions.sortOrder 
        }
      );
      
      queryClient.prefetchQuery({
        queryKey: nextPageKey,
        staleTime: CACHE_CONFIGS.standard.staleTime,
      });
    };
  }, [queryClient]);
  
  return {
    ...paginationState,
    prefetchNextPage,
  };
}

/**
 * Smart pagination that switches between server and client pagination
 * based on dataset size
 */
export function useSmartContainerPagination(options: ContainerQueryOptions = {}) {
  const { uuid: selectedDevice } = useSelectedDevice();
  const finalDeviceUuid = options.deviceUuid || selectedDevice;
  
  // First, check dataset size
  const { data: containerCount } = useQuery({
    queryKey: [...queryKeys.containers.list({ deviceUuid: finalDeviceUuid }), 'count'],
    queryFn: () => containersApi.getContainerCount({ deviceUuid: finalDeviceUuid }),
    enabled: !!finalDeviceUuid,
    staleTime: CACHE_CONFIGS.persistent.staleTime,
  });
  
  const useServerPagination = (containerCount || 0) > 100; // Threshold for server pagination
  
  // Use appropriate pagination strategy
  const serverResult = usePaginatedContainers({
    ...options,
    pagination: options.pagination || { page: 1, pageSize: 25 }
  });
  
  const clientResult = useVirtualPaginatedContainers({
    ...options,
    pagination: options.pagination || { page: 1, pageSize: 25 }
  });
  
  return {
    ...(useServerPagination ? serverResult : clientResult),
    paginationStrategy: useServerPagination ? 'server' : 'client',
    totalCount: containerCount,
  };
}

// ============================================================================
// OPTIMIZED CONTAINER STATISTICS WITH PAGINATION
// ============================================================================

/**
 * Paginated container statistics to avoid loading all data at once
 */
export function usePaginatedContainerStats(deviceUuid?: string) {
  const { uuid: selectedDevice } = useSelectedDevice();
  const finalDeviceUuid = deviceUuid || selectedDevice;
  
  return useQuery({
    queryKey: [...queryKeys.containers.list({ deviceUuid: finalDeviceUuid }), 'stats'],
    queryFn: () => containersApi.getContainerStats({ deviceUuid: finalDeviceUuid }),
    enabled: !!finalDeviceUuid,
    staleTime: CACHE_CONFIGS.standard.staleTime,
    gcTime: CACHE_CONFIGS.standard.gcTime,
    select: (data) => ({
      total: data.total,
      running: data.running,
      stopped: data.stopped,
      paused: data.paused,
      totalMemory: data.totalMemory,
      totalCpu: data.totalCpu,
      // Add computed statistics
      utilizationRate: data.total > 0 ? (data.running / data.total) * 100 : 0,
      healthScore: calculateHealthScore(data),
    }),
  });
}

function calculateHealthScore(stats: any): number {
  const runningRatio = stats.total > 0 ? stats.running / stats.total : 0;
  const memoryEfficiency = stats.totalMemory > 0 ? Math.min(stats.totalMemory / 8192, 1) : 1; // 8GB baseline
  const cpuEfficiency = Math.min(stats.totalCpu / 80, 1); // 80% baseline
  
  return Math.round((runningRatio * 0.5 + memoryEfficiency * 0.3 + cpuEfficiency * 0.2) * 100);
}

// ============================================================================
// BATCH OPERATIONS WITH PAGINATION
// ============================================================================

/**
 * Batch operations that work efficiently with paginated data
 */
export function useBatchContainerOperations() {
  const queryClient = useQueryClient();
  const { uuid: deviceUuid } = useSelectedDevice();
  
  const performBatchOperation = async (
    operation: 'start' | 'stop' | 'restart' | 'delete',
    containerIds: string[],
    batchSize = 5
  ) => {
    const results = [];
    
    // Process in batches to avoid overwhelming the server
    for (let i = 0; i < containerIds.length; i += batchSize) {
      const batch = containerIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(id => 
        containersApi.performOperation(id, operation)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < containerIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Invalidate all container-related queries
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.containers.list({ deviceUuid }) 
    });
    
    return results;
  };
  
  return { performBatchOperation };
}