import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { Container } from '@shared/api/containers';
import { SsmContainer } from 'ssm-shared-lib';

export interface ContainerFilters {
  deviceUuid?: string;
  status?: SsmContainer.Status;
  type?: 'docker' | 'proxmox';
  search?: string;
  showOnlyRunning?: boolean;
  image?: string;
}

export interface ContainerState {
  // Container data
  containers: Container[];
  containersLoading: boolean;
  containersError: string | null;
  
  // Selected containers for bulk operations
  selectedContainerIds: Set<string>;
  
  // Filters
  filters: ContainerFilters;
  
  // Real-time updates
  realTimeEnabled: boolean;
  lastUpdateTime: Date | null;
  
  // Actions
  setContainers: (containers: Container[]) => void;
  updateContainer: (containerId: string, updates: Partial<Container>) => void;
  removeContainer: (containerId: string) => void;
  addContainer: (container: Container) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ContainerFilters>) => void;
  clearFilters: () => void;
  
  // Selection actions
  selectContainer: (containerId: string) => void;
  deselectContainer: (containerId: string) => void;
  selectAllContainers: () => void;
  clearSelection: () => void;
  toggleContainerSelection: (containerId: string) => void;
  
  // Real-time actions
  setRealTimeEnabled: (enabled: boolean) => void;
  updateLastUpdateTime: () => void;
  
  // Computed getters
  getFilteredContainers: () => Container[];
  getContainerById: (id: string) => Container | undefined;
  getContainersByDevice: (deviceUuid: string) => Container[];
  getContainersByStatus: (status: SsmContainer.Status) => Container[];
  getRunningContainers: () => Container[];
  getSelectedContainers: () => Container[];
  getContainerStats: () => {
    total: number;
    running: number;
    stopped: number;
    failed: number;
    byDevice: Record<string, number>;
  };
}

export const useContainerStore = create<ContainerState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // State
      containers: [],
      containersLoading: false,
      containersError: null,
      selectedContainerIds: new Set(),
      filters: {},
      realTimeEnabled: true,
      lastUpdateTime: null,

      // Actions
      setContainers: (containers) => {
        set({
          containers,
          containersError: null,
          lastUpdateTime: new Date(),
        });
      },

      updateContainer: (containerId, updates) => {
        const state = get();
        const containers = state.containers.map(container =>
          container.id === containerId
            ? { ...container, ...updates, updatedAt: new Date() }
            : container
        );
        set({
          containers,
          lastUpdateTime: new Date(),
        });
      },

      removeContainer: (containerId) => {
        const state = get();
        const containers = state.containers.filter(c => c.id !== containerId);
        const selectedContainerIds = new Set(state.selectedContainerIds);
        selectedContainerIds.delete(containerId);
        
        set({
          containers,
          selectedContainerIds,
          lastUpdateTime: new Date(),
        });
      },

      addContainer: (container) => {
        const state = get();
        // Check if container already exists
        const existingIndex = state.containers.findIndex(c => c.id === container.id);
        
        let containers;
        if (existingIndex >= 0) {
          // Update existing container
          containers = [...state.containers];
          containers[existingIndex] = container;
        } else {
          // Add new container
          containers = [container, ...state.containers];
        }
        
        set({
          containers,
          lastUpdateTime: new Date(),
        });
      },

      setLoading: (loading) => set({ containersLoading: loading }),

      setError: (error) => set({ containersError: error }),

      setFilters: (newFilters) => {
        const state = get();
        set({
          filters: { ...state.filters, ...newFilters }
        });
      },

      clearFilters: () => set({ filters: {} }),

      // Selection actions
      selectContainer: (containerId) => {
        const state = get();
        const selectedContainerIds = new Set(state.selectedContainerIds);
        selectedContainerIds.add(containerId);
        set({ selectedContainerIds });
      },

      deselectContainer: (containerId) => {
        const state = get();
        const selectedContainerIds = new Set(state.selectedContainerIds);
        selectedContainerIds.delete(containerId);
        set({ selectedContainerIds });
      },

      selectAllContainers: () => {
        const state = get();
        const filteredContainers = state.getFilteredContainers();
        const selectedContainerIds = new Set(filteredContainers.map(c => c.id));
        set({ selectedContainerIds });
      },

      clearSelection: () => set({ selectedContainerIds: new Set() }),

      toggleContainerSelection: (containerId) => {
        const state = get();
        if (state.selectedContainerIds.has(containerId)) {
          state.deselectContainer(containerId);
        } else {
          state.selectContainer(containerId);
        }
      },

      // Real-time actions
      setRealTimeEnabled: (enabled) => set({ realTimeEnabled: enabled }),

      updateLastUpdateTime: () => set({ lastUpdateTime: new Date() }),

      // Computed getters
      getFilteredContainers: () => {
        const state = get();
        const { containers, filters } = state;

        return containers.filter(container => {
          // Device filter
          if (filters.deviceUuid && container.deviceUuid !== filters.deviceUuid) {
            return false;
          }

          // Status filter
          if (filters.status && container.status !== filters.status) {
            return false;
          }

          // Type filter
          if (filters.type && container.type !== filters.type) {
            return false;
          }

          // Show only running filter
          if (filters.showOnlyRunning && container.status !== 'running') {
            return false;
          }

          // Image filter
          if (filters.image && !container.image.includes(filters.image)) {
            return false;
          }

          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesName = container.name.toLowerCase().includes(searchLower);
            const matchesCustomName = container.customName?.toLowerCase().includes(searchLower);
            const matchesImage = container.image.toLowerCase().includes(searchLower);
            const matchesId = container.id.toLowerCase().includes(searchLower);
            
            if (!matchesName && !matchesCustomName && !matchesImage && !matchesId) {
              return false;
            }
          }

          return true;
        });
      },

      getContainerById: (id) => {
        const state = get();
        return state.containers.find(container => container.id === id);
      },

      getContainersByDevice: (deviceUuid) => {
        const state = get();
        return state.containers.filter(container => container.deviceUuid === deviceUuid);
      },

      getContainersByStatus: (status) => {
        const state = get();
        return state.containers.filter(container => container.status === status);
      },

      getRunningContainers: () => {
        const state = get();
        return state.containers.filter(container => container.status === 'running');
      },

      getSelectedContainers: () => {
        const state = get();
        return state.containers.filter(container => 
          state.selectedContainerIds.has(container.id)
        );
      },

      getContainerStats: () => {
        const state = get();
        const containers = state.containers;
        
        const stats = {
          total: containers.length,
          running: 0,
          stopped: 0,
          failed: 0,
          byDevice: {} as Record<string, number>,
        };

        containers.forEach(container => {
          // Status counts
          switch (container.status) {
            case 'running':
              stats.running++;
              break;
            case 'exited':
            case 'stopped':
              stats.stopped++;
              break;
            case 'dead':
            case 'error':
              stats.failed++;
              break;
          }

          // Device counts
          stats.byDevice[container.deviceUuid] = (stats.byDevice[container.deviceUuid] || 0) + 1;
        });

        return stats;
      },
    })),
    { name: 'ContainerStore' }
  )
);

// Convenience hooks
export function useContainerList() {
  return useContainerStore(state => ({
    containers: state.getFilteredContainers(),
    allContainers: state.containers,
    loading: state.containersLoading,
    error: state.containersError,
    stats: state.getContainerStats(),
    lastUpdate: state.lastUpdateTime,
  }));
}

export function useContainerSelection() {
  return useContainerStore(state => ({
    selectedIds: state.selectedContainerIds,
    selectedContainers: state.getSelectedContainers(),
    selectContainer: state.selectContainer,
    deselectContainer: state.deselectContainer,
    selectAll: state.selectAllContainers,
    clearSelection: state.clearSelection,
    toggleSelection: state.toggleContainerSelection,
  }));
}

export function useContainerFilters() {
  return useContainerStore(state => ({
    filters: state.filters,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
  }));
}

export function useContainerActions() {
  return useContainerStore(state => ({
    setContainers: state.setContainers,
    updateContainer: state.updateContainer,
    removeContainer: state.removeContainer,
    addContainer: state.addContainer,
    setLoading: state.setLoading,
    setError: state.setError,
  }));
}