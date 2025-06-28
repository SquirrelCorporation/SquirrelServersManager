import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '@app/store';
import { containersApi, imagesApi, volumesApi, networksApi } from './index';
import { useSelectedDevice } from '@shared/store/ui-state';

/**
 * Unified Container Queries - TanStack Query as Single Source of Truth
 * All server state managed here, no Zustand duplication
 */

// ============================================================================
// CONTAINERS
// ============================================================================

export function useContainers(deviceUuid?: string) {
  const { uuid: selectedDevice } = useSelectedDevice();
  const finalDeviceUuid = deviceUuid || selectedDevice;

  return useQuery({
    queryKey: [...queryKeys.containers.list({ deviceUuid: finalDeviceUuid })],
    queryFn: () => containersApi.getContainers({ deviceUuid: finalDeviceUuid }),
    enabled: !!finalDeviceUuid,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useContainerDetails(containerId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.containers.detail(containerId)],
    queryFn: () => containersApi.getContainer(containerId),
    enabled: enabled && !!containerId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useContainerAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      containerId, 
      action, 
      deviceUuid 
    }: { 
      containerId: string; 
      action: 'start' | 'stop' | 'restart' | 'remove'; 
      deviceUuid: string;
    }) => containersApi.containerAction(containerId, action),
    
    onMutate: async ({ containerId, action, deviceUuid }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: [...queryKeys.containers.detail(containerId)] 
      });

      // Optimistic update
      const previousData = queryClient.getQueryData([...queryKeys.containers.detail(containerId)]);
      
      queryClient.setQueryData(
        [...queryKeys.containers.detail(containerId)],
        (old: any) => old ? { ...old, status: action === 'start' ? 'starting' : 'stopping' } : old
      );

      return { previousData, containerId, deviceUuid };
    },

    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(
          [...queryKeys.containers.detail(context.containerId)],
          context.previousData
        );
      }
    },

    onSettled: (data, error, variables, context) => {
      // Refresh related queries
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.containers.detail(variables.containerId)] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.containers.list({ deviceUuid: variables.deviceUuid })] 
      });
    },
  });
}

// ============================================================================
// IMAGES
// ============================================================================

export function useImages(deviceUuid?: string) {
  const { uuid: selectedDevice } = useSelectedDevice();
  const finalDeviceUuid = deviceUuid || selectedDevice;

  return useQuery({
    queryKey: [...queryKeys.containers.all, 'images', { deviceUuid: finalDeviceUuid }],
    queryFn: () => imagesApi.getImages({ deviceUuid: finalDeviceUuid }),
    enabled: !!finalDeviceUuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}

export function useImageAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      imageId, 
      action, 
      deviceUuid 
    }: { 
      imageId: string; 
      action: 'delete' | 'pull'; 
      deviceUuid: string;
      force?: boolean;
    }) => {
      if (action === 'delete') {
        return imagesApi.deleteImage(imageId);
      }
      throw new Error('Invalid action');
    },

    onMutate: async ({ imageId, action, deviceUuid }) => {
      if (action === 'delete') {
        // Optimistic removal
        await queryClient.cancelQueries({ 
          queryKey: [...queryKeys.containers.all, 'images', { deviceUuid }] 
        });

        const previousData = queryClient.getQueryData([...queryKeys.containers.all, 'images', { deviceUuid }]);
        
        queryClient.setQueryData(
          [...queryKeys.containers.all, 'images', { deviceUuid }],
          (old: any[]) => old ? old.filter(img => img.id !== imageId) : []
        );

        return { previousData, imageId, deviceUuid };
      }
    },

    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [...queryKeys.containers.all, 'images', { deviceUuid: context.deviceUuid }],
          context.previousData
        );
      }
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.containers.all, 'images', { deviceUuid: variables.deviceUuid }] 
      });
    },
  });
}

// ============================================================================
// VOLUMES
// ============================================================================

export function useVolumes(deviceUuid?: string) {
  const { uuid: selectedDevice } = useSelectedDevice();
  const finalDeviceUuid = deviceUuid || selectedDevice;

  return useQuery({
    queryKey: [...queryKeys.containers.all, 'volumes', { deviceUuid: finalDeviceUuid }],
    queryFn: () => volumesApi.getVolumes({ deviceUuid: finalDeviceUuid }),
    enabled: !!finalDeviceUuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVolumeAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      volumeId, 
      action, 
      deviceUuid 
    }: { 
      volumeId: string; 
      action: 'delete' | 'backup'; 
      deviceUuid: string;
    }) => volumesApi.volumeAction(volumeId, action),

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.containers.all, 'volumes', { deviceUuid: variables.deviceUuid }] 
      });
    },
  });
}

// ============================================================================
// MEMOIZED SELECTORS
// ============================================================================

/**
 * Memoized selector for filtered containers
 */
export function useFilteredContainers(filters: {
  search?: string;
  status?: string[];
  showStopped?: boolean;
}) {
  const { data: containers = [] } = useContainers();

  return useMemo(() => {
    return containers.filter(container => {
      // Search filter
      if (filters.search && !container.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status?.length && !filters.status.includes(container.status)) {
        return false;
      }

      // Show stopped filter
      if (!filters.showStopped && container.status === 'stopped') {
        return false;
      }

      return true;
    });
  }, [containers, filters]);
}

/**
 * Memoized selector for filtered images
 */
export function useFilteredImages(filters: {
  search?: string;
  inUse?: boolean;
}) {
  const { data: images = [] } = useImages();

  return useMemo(() => {
    return images.filter(image => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesRepo = image.repository.toLowerCase().includes(searchLower);
        const matchesTag = image.tag.toLowerCase().includes(searchLower);
        if (!matchesRepo && !matchesTag) return false;
      }

      // In use filter
      if (filters.inUse !== undefined && image.inUse !== filters.inUse) {
        return false;
      }

      return true;
    });
  }, [images, filters]);
}

/**
 * Memoized selector for filtered volumes
 */
export function useFilteredVolumes(filters: {
  search?: string;
  inUse?: boolean;
}) {
  const { data: volumes = [] } = useVolumes();

  return useMemo(() => {
    return volumes.filter(volume => {
      // Search filter
      if (filters.search && !volume.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // In use filter
      if (filters.inUse !== undefined && volume.inUse !== filters.inUse) {
        return false;
      }

      return true;
    });
  }, [volumes, filters]);
}