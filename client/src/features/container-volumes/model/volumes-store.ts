import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { ContainerVolume, VolumeBackup } from '@shared/api/containers';

export interface VolumeFilters {
  deviceUuid?: string;
  driver?: string;
  inUse?: boolean;
  search?: string;
}

export interface VolumesState {
  // Volume data
  volumes: ContainerVolume[];
  volumesLoading: boolean;
  volumesError: string | null;
  
  // Volume backups
  backups: VolumeBackup[];
  backupsLoading: boolean;
  backupsError: string | null;
  
  // Selected volumes for bulk operations
  selectedVolumeIds: Set<string>;
  
  // Filters
  filters: VolumeFilters;
  
  // Actions
  setVolumes: (volumes: ContainerVolume[]) => void;
  updateVolume: (volumeName: string, updates: Partial<ContainerVolume>) => void;
  removeVolume: (volumeName: string) => void;
  addVolume: (volume: ContainerVolume) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Backup actions
  setBackups: (backups: VolumeBackup[]) => void;
  updateBackup: (backupId: string, updates: Partial<VolumeBackup>) => void;
  removeBackup: (backupId: string) => void;
  addBackup: (backup: VolumeBackup) => void;
  setBackupsLoading: (loading: boolean) => void;
  setBackupsError: (error: string | null) => void;
  
  // Filter actions
  setFilters: (filters: Partial<VolumeFilters>) => void;
  clearFilters: () => void;
  
  // Selection actions
  selectVolume: (volumeName: string) => void;
  deselectVolume: (volumeName: string) => void;
  selectAllVolumes: () => void;
  clearSelection: () => void;
  toggleVolumeSelection: (volumeName: string) => void;
  
  // Computed getters
  getFilteredVolumes: () => ContainerVolume[];
  getVolumeByName: (name: string) => ContainerVolume | undefined;
  getVolumesByDevice: (deviceUuid: string) => ContainerVolume[];
  getUnusedVolumes: () => ContainerVolume[];
  getSelectedVolumes: () => ContainerVolume[];
  getVolumeStats: () => {
    total: number;
    inUse: number;
    unused: number;
    totalSize: number;
    byDevice: Record<string, number>;
    byDriver: Record<string, number>;
  };
  getBackupsByVolume: (volumeName: string) => VolumeBackup[];
}

export const useVolumesStore = create<VolumesState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      volumes: [],
      volumesLoading: false,
      volumesError: null,
      backups: [],
      backupsLoading: false,
      backupsError: null,
      selectedVolumeIds: new Set(),
      filters: {},

      // Volume actions
      setVolumes: (volumes) => {
        set({
          volumes,
          volumesError: null,
        });
      },

      updateVolume: (volumeName, updates) => {
        const state = get();
        const volumes = state.volumes.map(volume =>
          volume.name === volumeName ? { ...volume, ...updates } : volume
        );
        set({ volumes });
      },

      removeVolume: (volumeName) => {
        const state = get();
        const volumes = state.volumes.filter(vol => vol.name !== volumeName);
        const selectedVolumeIds = new Set(state.selectedVolumeIds);
        selectedVolumeIds.delete(volumeName);
        
        set({
          volumes,
          selectedVolumeIds,
        });
      },

      addVolume: (volume) => {
        const state = get();
        // Check if volume already exists
        const existingIndex = state.volumes.findIndex(vol => vol.name === volume.name && vol.deviceUuid === volume.deviceUuid);
        
        let volumes;
        if (existingIndex >= 0) {
          // Update existing volume
          volumes = [...state.volumes];
          volumes[existingIndex] = volume;
        } else {
          // Add new volume
          volumes = [volume, ...state.volumes];
        }
        
        set({ volumes });
      },

      setLoading: (loading) => set({ volumesLoading: loading }),

      setError: (error) => set({ volumesError: error }),

      // Backup actions
      setBackups: (backups) => {
        set({
          backups,
          backupsError: null,
        });
      },

      updateBackup: (backupId, updates) => {
        const state = get();
        const backups = state.backups.map(backup =>
          backup.id === backupId ? { ...backup, ...updates } : backup
        );
        set({ backups });
      },

      removeBackup: (backupId) => {
        const state = get();
        const backups = state.backups.filter(backup => backup.id !== backupId);
        set({ backups });
      },

      addBackup: (backup) => {
        const state = get();
        // Check if backup already exists
        const existingIndex = state.backups.findIndex(b => b.id === backup.id);
        
        let backups;
        if (existingIndex >= 0) {
          // Update existing backup
          backups = [...state.backups];
          backups[existingIndex] = backup;
        } else {
          // Add new backup
          backups = [backup, ...state.backups];
        }
        
        set({ backups });
      },

      setBackupsLoading: (loading) => set({ backupsLoading: loading }),

      setBackupsError: (error) => set({ backupsError: error }),

      // Filter actions
      setFilters: (newFilters) => {
        const state = get();
        set({
          filters: { ...state.filters, ...newFilters }
        });
      },

      clearFilters: () => set({ filters: {} }),

      // Selection actions
      selectVolume: (volumeName) => {
        const state = get();
        const selectedVolumeIds = new Set(state.selectedVolumeIds);
        selectedVolumeIds.add(volumeName);
        set({ selectedVolumeIds });
      },

      deselectVolume: (volumeName) => {
        const state = get();
        const selectedVolumeIds = new Set(state.selectedVolumeIds);
        selectedVolumeIds.delete(volumeName);
        set({ selectedVolumeIds });
      },

      selectAllVolumes: () => {
        const state = get();
        const filteredVolumes = state.getFilteredVolumes();
        const selectedVolumeIds = new Set(filteredVolumes.map(vol => vol.name));
        set({ selectedVolumeIds });
      },

      clearSelection: () => set({ selectedVolumeIds: new Set() }),

      toggleVolumeSelection: (volumeName) => {
        const state = get();
        if (state.selectedVolumeIds.has(volumeName)) {
          state.deselectVolume(volumeName);
        } else {
          state.selectVolume(volumeName);
        }
      },

      // Computed getters
      getFilteredVolumes: () => {
        const state = get();
        const { volumes, filters } = state;

        return volumes.filter(volume => {
          // Device filter
          if (filters.deviceUuid && volume.deviceUuid !== filters.deviceUuid) {
            return false;
          }

          // Driver filter
          if (filters.driver && volume.driver !== filters.driver) {
            return false;
          }

          // In use filter
          if (filters.inUse !== undefined && volume.inUse !== filters.inUse) {
            return false;
          }

          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesName = volume.name.toLowerCase().includes(searchLower);
            const matchesMountpoint = volume.mountpoint.toLowerCase().includes(searchLower);
            const matchesDriver = volume.driver.toLowerCase().includes(searchLower);
            
            if (!matchesName && !matchesMountpoint && !matchesDriver) {
              return false;
            }
          }

          return true;
        });
      },

      getVolumeByName: (name) => {
        const state = get();
        return state.volumes.find(volume => volume.name === name);
      },

      getVolumesByDevice: (deviceUuid) => {
        const state = get();
        return state.volumes.filter(volume => volume.deviceUuid === deviceUuid);
      },

      getUnusedVolumes: () => {
        const state = get();
        return state.volumes.filter(volume => !volume.inUse);
      },

      getSelectedVolumes: () => {
        const state = get();
        return state.volumes.filter(volume => 
          state.selectedVolumeIds.has(volume.name)
        );
      },

      getVolumeStats: () => {
        const state = get();
        const volumes = state.volumes;
        
        const stats = {
          total: volumes.length,
          inUse: 0,
          unused: 0,
          totalSize: 0,
          byDevice: {} as Record<string, number>,
          byDriver: {} as Record<string, number>,
        };

        volumes.forEach(volume => {
          // Usage counts
          if (volume.inUse) {
            stats.inUse++;
          } else {
            stats.unused++;
          }

          // Size calculation
          if (volume.size) {
            stats.totalSize += volume.size;
          }

          // Device counts
          stats.byDevice[volume.deviceUuid] = (stats.byDevice[volume.deviceUuid] || 0) + 1;

          // Driver counts
          stats.byDriver[volume.driver] = (stats.byDriver[volume.driver] || 0) + 1;
        });

        return stats;
      },

      getBackupsByVolume: (volumeName) => {
        const state = get();
        return state.backups.filter(backup => backup.volumeName === volumeName);
      },
    })),
    { name: 'VolumesStore' }
  )
);

// Convenience hooks
export function useVolumeList() {
  return useVolumesStore(state => ({
    volumes: state.getFilteredVolumes(),
    allVolumes: state.volumes,
    loading: state.volumesLoading,
    error: state.volumesError,
    stats: state.getVolumeStats(),
  }));
}

export function useVolumeSelection() {
  return useVolumesStore(state => ({
    selectedIds: state.selectedVolumeIds,
    selectedVolumes: state.getSelectedVolumes(),
    selectVolume: state.selectVolume,
    deselectVolume: state.deselectVolume,
    selectAll: state.selectAllVolumes,
    clearSelection: state.clearSelection,
    toggleSelection: state.toggleVolumeSelection,
  }));
}

export function useVolumeFilters() {
  return useVolumesStore(state => ({
    filters: state.filters,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
  }));
}

export function useVolumeActions() {
  return useVolumesStore(state => ({
    setVolumes: state.setVolumes,
    updateVolume: state.updateVolume,
    removeVolume: state.removeVolume,
    addVolume: state.addVolume,
    setLoading: state.setLoading,
    setError: state.setError,
  }));
}

export function useVolumeBackups() {
  return useVolumesStore(state => ({
    backups: state.backups,
    loading: state.backupsLoading,
    error: state.backupsError,
    getBackupsByVolume: state.getBackupsByVolume,
    setBackups: state.setBackups,
    updateBackup: state.updateBackup,
    removeBackup: state.removeBackup,
    addBackup: state.addBackup,
    setBackupsLoading: state.setBackupsLoading,
    setBackupsError: state.setBackupsError,
  }));
}