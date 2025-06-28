import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { queryKeys } from '@app/store';
import { imagesApi } from '@shared/api/containers';
import { useSelectedDevice } from '@shared/store/ui-state';
import { 
  ContainerImage, 
  ImageFilters,
  filterImages, 
  sortImages, 
  calculateImageStats,
  validateImagePullConfig 
} from './images-service';

/**
 * Unified Images Queries - TanStack Query as Single Source of Truth
 * Integrates business logic from images-service.ts
 */

// ============================================================================
// CORE QUERIES
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
    select: (data: ContainerImage[]) => {
      // Clean and normalize data from API
      return data.map(image => ({
        ...image,
        created: new Date(image.created),
      }));
    },
  });
}

export function useImageDetails(imageId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.containers.all, 'images', 'detail', imageId],
    queryFn: () => imagesApi.getImageDetails(imageId),
    enabled: enabled && !!imageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MUTATIONS WITH BUSINESS LOGIC
// ============================================================================

export function usePullImage() {
  const queryClient = useQueryClient();
  const { uuid: deviceUuid } = useSelectedDevice();

  return useMutation({
    mutationFn: (config: {
      repository: string;
      tag?: string;
      registry?: string;
      auth?: { username: string; password: string };
    }) => {
      // Validate configuration using business logic
      const validation = validateImagePullConfig(config);
      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      if (!deviceUuid) {
        throw new Error('No device selected');
      }

      return imagesApi.pullImage({
        deviceUuid,
        repository: config.repository,
        tag: config.tag || 'latest',
        registry: config.registry,
        auth: config.auth,
      });
    },
    
    onSuccess: () => {
      // Invalidate images queries to refetch data
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.containers.all, 'images', { deviceUuid }] 
      });
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();
  const { uuid: deviceUuid } = useSelectedDevice();

  return useMutation({
    mutationFn: ({ imageId, force = false }: { imageId: string; force?: boolean }) => {
      return imagesApi.deleteImage(imageId, force);
    },

    onMutate: async ({ imageId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: [...queryKeys.containers.all, 'images', { deviceUuid }] 
      });

      // Optimistic update - remove image from cache
      const previousData = queryClient.getQueryData([
        ...queryKeys.containers.all, 
        'images', 
        { deviceUuid }
      ]);
      
      queryClient.setQueryData(
        [...queryKeys.containers.all, 'images', { deviceUuid }],
        (old: ContainerImage[]) => old ? old.filter(img => img.id !== imageId) : []
      );

      return { previousData, imageId };
    },

    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousData) {
        queryClient.setQueryData(
          [...queryKeys.containers.all, 'images', { deviceUuid }],
          context.previousData
        );
      }
    },

    onSettled: () => {
      // Refresh images list
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.containers.all, 'images', { deviceUuid }] 
      });
    },
  });
}

export function useBulkDeleteImages() {
  const queryClient = useQueryClient();
  const { uuid: deviceUuid } = useSelectedDevice();

  return useMutation({
    mutationFn: async ({ imageIds, force = false }: { imageIds: string[]; force?: boolean }) => {
      // Delete images in parallel
      const promises = imageIds.map(imageId =>
        imagesApi.deleteImage(imageId, force)
      );

      const results = await Promise.allSettled(promises);
      
      // Return success/failure summary
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return { succeeded, failed, total: imageIds.length };
    },

    onMutate: async ({ imageIds }) => {
      // Optimistic update - remove all images from cache
      await queryClient.cancelQueries({ 
        queryKey: [...queryKeys.containers.all, 'images', { deviceUuid }] 
      });

      const previousData = queryClient.getQueryData([
        ...queryKeys.containers.all, 
        'images', 
        { deviceUuid }
      ]);
      
      queryClient.setQueryData(
        [...queryKeys.containers.all, 'images', { deviceUuid }],
        (old: ContainerImage[]) => 
          old ? old.filter(img => !imageIds.includes(img.id)) : []
      );

      return { previousData };
    },

    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(
          [...queryKeys.containers.all, 'images', { deviceUuid }],
          context.previousData
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.containers.all, 'images', { deviceUuid }] 
      });
    },
  });
}

// ============================================================================
// MEMOIZED SELECTORS WITH BUSINESS LOGIC
// ============================================================================

/**
 * Hook that provides filtered and sorted images using business logic
 */
export function useFilteredImages(
  filters: ImageFilters,
  sortBy: 'name' | 'size' | 'created' | 'repository' | 'tag' | 'usage' = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const { data: images = [], isLoading, error } = useImages();

  const filteredAndSorted = useMemo(() => {
    // Apply business logic for filtering and sorting
    const filtered = filterImages(images, filters);
    const sorted = sortImages(filtered, sortBy, sortOrder);
    return sorted;
  }, [images, filters, sortBy, sortOrder]);

  return {
    images: filteredAndSorted,
    allImages: images,
    isLoading,
    error,
  };
}

/**
 * Hook that provides image statistics using business logic
 */
export function useImageStats() {
  const { data: images = [] } = useImages();

  const stats = useMemo(() => {
    return calculateImageStats(images);
  }, [images]);

  return stats;
}

/**
 * Hook that provides cleanup suggestions using business logic
 */
export function useImageCleanupSuggestions() {
  const { data: images = [] } = useImages();

  const suggestions = useMemo(() => {
    const unusedImages = images.filter(img => !img.inUse);
    const oldImages = images.filter(img => {
      const age = Math.floor((Date.now() - new Date(img.created).getTime()) / (1000 * 60 * 60 * 24));
      return age > 30;
    });
    
    const safeToDelete = unusedImages.filter(img => {
      const age = Math.floor((Date.now() - new Date(img.created).getTime()) / (1000 * 60 * 60 * 24));
      return age > 7; // Older than a week
    });

    const potentialSavings = safeToDelete.reduce((total, img) => total + img.size, 0);

    return {
      unused: unusedImages,
      old: oldImages,
      safeToDelete,
      potentialSavings,
    };
  }, [images]);

  return suggestions;
}

/**
 * Hook for searching images across registries
 */
export function useSearchImages() {
  return useMutation({
    mutationFn: ({ term, registry }: { term: string; registry?: string }) => {
      if (!term || term.trim().length < 2) {
        throw new Error('Search term must be at least 2 characters');
      }
      return imagesApi.searchImages(term, registry);
    },
  });
}

/**
 * Hook for importing images from file
 */
export function useImportImage() {
  const queryClient = useQueryClient();
  const { uuid: deviceUuid } = useSelectedDevice();

  return useMutation({
    mutationFn: (file: File) => {
      if (!deviceUuid) throw new Error('No device selected');
      if (!file) throw new Error('No file provided');
      
      // Validate file type
      if (!file.name.endsWith('.tar') && !file.name.endsWith('.tar.gz')) {
        throw new Error('Invalid file type. Only .tar and .tar.gz files are supported');
      }

      // Validate file size (max 2GB)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 2GB');
      }

      return imagesApi.importImage(deviceUuid, file);
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.containers.all, 'images', { deviceUuid }] 
      });
    },
  });
}

/**
 * Hook for exporting images
 */
export function useExportImage() {
  return useMutation({
    mutationFn: (imageId: string) => {
      if (!imageId) throw new Error('Image ID is required');
      return imagesApi.exportImage(imageId);
    },
    
    onSuccess: (blob, imageId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${imageId}.tar`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}