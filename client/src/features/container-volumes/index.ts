// Public API exports for container-volumes feature
export { VolumesPage } from './ui/VolumesPage';

// Export hooks for external use if needed
export {
  useVolumes,
  useCreateVolume,
  useDeleteVolume,
  useRefreshVolumes,
  useVolumeDetails,
  useBackupVolume,
  useVolumeBackups,
  useRestoreVolume,
  useDeleteBackup,
  useBackupStatus,
  useBulkVolumeActions,
  usePruneVolumes,
} from './model/volumes-queries';

export {
  useVolumeList,
  useVolumeSelection,
  useVolumeFilters,
  useVolumeActions,
  useVolumeBackups as useVolumeBackupsStore,
} from './model/volumes-store';

// Export types
export type { VolumeFilters, VolumesState } from './model/volumes-store';