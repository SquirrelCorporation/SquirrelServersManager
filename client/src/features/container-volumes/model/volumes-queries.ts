import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { volumesApi, VolumeQuery, VolumeCreateRequest, VolumeBackupRequest } from '@shared/api/containers';
import { useVolumesStore } from './volumes-store';
import { useSelectedDevice } from '@shared/store/device-store';
import { queryKeys } from '@app/store';

/**
 * Hook for fetching container volumes
 */
export function useVolumes(query: VolumeQuery = {}) {
  const { device } = useSelectedDevice();
  const { setVolumes, setLoading, setError } = useVolumesStore();

  const finalQuery = {
    ...query,
    deviceUuid: query.deviceUuid || device?.uuid,
  };

  return useQuery({
    queryKey: [...queryKeys.containers.all, 'volumes', finalQuery],
    queryFn: () => volumesApi.getVolumes(finalQuery),
    enabled: !!finalQuery.deviceUuid,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    onSuccess: (data) => {
      setVolumes(data);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to load volumes');
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

/**
 * Hook for creating container volumes
 */
export function useCreateVolume() {
  const queryClient = useQueryClient();
  const { addVolume } = useVolumesStore();

  return useMutation({
    mutationFn: (request: VolumeCreateRequest) => volumesApi.createVolume(request),
    onSuccess: () => {
      // Invalidate volumes queries to refetch data
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volumes'] });
    },
    onError: (error: any) => {
      console.error('Failed to create volume:', error);
    },
  });
}

/**
 * Hook for deleting container volumes
 */
export function useDeleteVolume() {
  const queryClient = useQueryClient();
  const { removeVolume } = useVolumesStore();

  return useMutation({
    mutationFn: ({ volumeName, deviceUuid, force = false }: { 
      volumeName: string; 
      deviceUuid: string; 
      force?: boolean 
    }) => volumesApi.deleteVolume(volumeName, deviceUuid, force),
    onMutate: async ({ volumeName }) => {
      // Optimistic update - remove volume from store
      removeVolume(volumeName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volumes'] });
    },
    onError: (error, { volumeName }) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volumes'] });
      console.error('Failed to delete volume:', error);
    },
  });
}

/**
 * Hook for refreshing volumes list
 */
export function useRefreshVolumes() {
  const queryClient = useQueryClient();
  const { device } = useSelectedDevice();
  const { setLoading } = useVolumesStore();

  return useMutation({
    mutationFn: () => volumesApi.refreshVolumes(device?.uuid),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        [...queryKeys.containers.all, 'volumes', { deviceUuid: device?.uuid }],
        data
      );
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

/**
 * Hook for getting volume details
 */
export function useVolumeDetails(volumeName: string, deviceUuid?: string, enabled = true) {
  const { device } = useSelectedDevice();
  const finalDeviceUuid = deviceUuid || device?.uuid;

  return useQuery({
    queryKey: [...queryKeys.containers.all, 'volumes', 'detail', volumeName, finalDeviceUuid],
    queryFn: () => volumesApi.getVolumeDetails(volumeName, finalDeviceUuid!),
    enabled: enabled && !!volumeName && !!finalDeviceUuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for creating volume backups
 */
export function useBackupVolume() {
  const queryClient = useQueryClient();
  const { addBackup } = useVolumesStore();

  return useMutation({
    mutationFn: (request: VolumeBackupRequest) => volumesApi.backupVolume(request),
    onSuccess: (backup) => {
      addBackup(backup);
      // Invalidate backups queries
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volume-backups'] });
    },
    onError: (error: any) => {
      console.error('Failed to create volume backup:', error);
    },
  });
}

/**
 * Hook for fetching volume backups
 */
export function useVolumeBackups(deviceUuid?: string, volumeName?: string) {
  const { device } = useSelectedDevice();
  const { setBackups, setBackupsLoading, setBackupsError } = useVolumesStore();

  const finalDeviceUuid = deviceUuid || device?.uuid;

  return useQuery({
    queryKey: [...queryKeys.containers.all, 'volume-backups', { deviceUuid: finalDeviceUuid, volumeName }],
    queryFn: () => volumesApi.getVolumeBackups(finalDeviceUuid, volumeName),
    enabled: !!finalDeviceUuid,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 10 * 1000, // Refetch every 10 seconds to track backup progress
    onSuccess: (data) => {
      setBackups(data);
      setBackupsError(null);
    },
    onError: (error: any) => {
      setBackupsError(error.message || 'Failed to load volume backups');
      setBackupsLoading(false);
    },
    onSettled: () => {
      setBackupsLoading(false);
    },
  });
}

/**
 * Hook for restoring volume from backup
 */
export function useRestoreVolume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ backupId, targetVolumeName }: { 
      backupId: string; 
      targetVolumeName?: string 
    }) => volumesApi.restoreVolume(backupId, targetVolumeName),
    onSuccess: () => {
      // Invalidate both volumes and backups queries
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volumes'] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volume-backups'] });
    },
    onError: (error: any) => {
      console.error('Failed to restore volume:', error);
    },
  });
}

/**
 * Hook for deleting volume backups
 */
export function useDeleteBackup() {
  const queryClient = useQueryClient();
  const { removeBackup } = useVolumesStore();

  return useMutation({
    mutationFn: (backupId: string) => volumesApi.deleteBackup(backupId),
    onMutate: async (backupId) => {
      // Optimistic update - remove backup from store
      removeBackup(backupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volume-backups'] });
    },
    onError: (error, backupId) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volume-backups'] });
      console.error('Failed to delete backup:', error);
    },
  });
}

/**
 * Hook for getting backup status
 */
export function useBackupStatus(backupId: string, enabled = true) {
  const { updateBackup } = useVolumesStore();

  return useQuery({
    queryKey: [...queryKeys.containers.all, 'volume-backups', 'status', backupId],
    queryFn: () => volumesApi.getBackupStatus(backupId),
    enabled: enabled && !!backupId,
    refetchInterval: (data) => {
      // Stop polling when backup is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds for active backups
    },
    onSuccess: (backup) => {
      updateBackup(backupId, backup);
    },
  });
}

/**
 * Hook for bulk volume operations
 */
export function useBulkVolumeActions() {
  const queryClient = useQueryClient();
  const { removeVolume } = useVolumesStore();
  const { device } = useSelectedDevice();

  const deleteBulkVolumes = async (volumeNames: string[], force = false) => {
    if (!device?.uuid) throw new Error('No device selected');

    const promises = volumeNames.map(volumeName =>
      volumesApi.deleteVolume(volumeName, device.uuid, force)
    );

    // Optimistic updates
    volumeNames.forEach(volumeName => removeVolume(volumeName));

    try {
      await Promise.allSettled(promises);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volumes'] });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volumes'] });
      throw error;
    }
  };

  return useMutation({
    mutationFn: ({ volumeNames, force = false }: { 
      volumeNames: string[]; 
      force?: boolean 
    }) => deleteBulkVolumes(volumeNames, force),
  });
}

/**
 * Hook for pruning unused volumes
 */
export function usePruneVolumes() {
  const queryClient = useQueryClient();
  const { device } = useSelectedDevice();

  return useMutation({
    mutationFn: () => {
      if (!device?.uuid) throw new Error('No device selected');
      return volumesApi.pruneVolumes(device.uuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.containers.all, 'volumes'] });
    },
    onError: (error: any) => {
      console.error('Failed to prune volumes:', error);
    },
  });
}