import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { imagesApi, ImageQuery, ImagePullRequest } from '@shared/api/containers';
import { useImagesStore } from './images-store';
import { useSelectedDevice } from '@shared/store/device-store';
import { queryKeys } from '@app/store';

/**
 * Hook for fetching container images
 */
export function useImages(query: ImageQuery = {}) {
  const { device } = useSelectedDevice();
  const { setImages, setLoading, setError } = useImagesStore();

  const finalQuery = {
    ...query,
    deviceUuid: query.deviceUuid || device?.uuid,
  };

  return useQuery({
    queryKey: [...queryKeys.containers.all, 'images', finalQuery],
    queryFn: () => imagesApi.getImages(finalQuery),
    enabled: !!finalQuery.deviceUuid,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    onSuccess: (data) => {
      setImages(data);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to load images');
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

/**
 * Hook for pulling container images
 */
export function usePullImage() {
  const queryClient = useQueryClient();
  const { addImage } = useImagesStore();

  return useMutation({
    mutationFn: (request: ImagePullRequest) => imagesApi.pullImage(request),
    onSuccess: () => {
      // Invalidate images queries to refetch data
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'images'] });
    },
    onError: (error: any) => {
      console.error('Failed to pull image:', error);
    },
  });
}

/**
 * Hook for deleting container images
 */
export function useDeleteImage() {
  const queryClient = useQueryClient();
  const { removeImage } = useImagesStore();

  return useMutation({
    mutationFn: ({ imageId, force = false }: { imageId: string; force?: boolean }) =>
      imagesApi.deleteImage(imageId, force),
    onMutate: async ({ imageId }) => {
      // Optimistic update - remove image from store
      removeImage(imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'images'] });
    },
    onError: (error, { imageId }) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'images'] });
      console.error('Failed to delete image:', error);
    },
  });
}

/**
 * Hook for refreshing images list
 */
export function useRefreshImages() {
  const queryClient = useQueryClient();
  const { device } = useSelectedDevice();
  const { setLoading } = useImagesStore();

  return useMutation({
    mutationFn: () => imagesApi.refreshImages(device?.uuid),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        [...queryKeys.containers.all, 'images', { deviceUuid: device?.uuid }],
        data
      );
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

/**
 * Hook for getting image details
 */
export function useImageDetails(imageId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.containers.all, 'images', 'detail', imageId],
    queryFn: () => imagesApi.getImageDetails(imageId),
    enabled: enabled && !!imageId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for searching images in registries
 */
export function useSearchImages() {
  return useMutation({
    mutationFn: ({ term, registry }: { term: string; registry?: string }) =>
      imagesApi.searchImages(term, registry),
  });
}

/**
 * Hook for bulk image operations
 */
export function useBulkImageActions() {
  const queryClient = useQueryClient();
  const { removeImage } = useImagesStore();

  const deleteBulkImages = async (imageIds: string[], force = false) => {
    const promises = imageIds.map(imageId =>
      imagesApi.deleteImage(imageId, force)
    );

    // Optimistic updates
    imageIds.forEach(imageId => removeImage(imageId));

    try {
      await Promise.allSettled(promises);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'images'] });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'images'] });
      throw error;
    }
  };

  return useMutation({
    mutationFn: ({ imageIds, force = false }: { imageIds: string[]; force?: boolean }) =>
      deleteBulkImages(imageIds, force),
  });
}

/**
 * Hook for importing images from file
 */
export function useImportImage() {
  const queryClient = useQueryClient();
  const { device } = useSelectedDevice();

  return useMutation({
    mutationFn: (file: File) => {
      if (!device?.uuid) throw new Error('No device selected');
      return imagesApi.importImage(device.uuid, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'images'] });
    },
  });
}

/**
 * Hook for exporting images
 */
export function useExportImage() {
  return useMutation({
    mutationFn: (imageId: string) => imagesApi.exportImage(imageId),
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