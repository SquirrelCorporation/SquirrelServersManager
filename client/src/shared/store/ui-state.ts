import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Simplified UI State - Single Store for All Client-Side State
 * Server state is handled by TanStack Query exclusively
 */

export interface UIState {
  // Device selection (persisted)
  selectedDeviceUuid: string | null;
  
  // Feature flags (persisted)
  featureFlags: Record<string, boolean>;
  
  // Modal states (ephemeral)
  modals: {
    createContainer: boolean;
    deviceInfo: boolean;
    playbookExecution: boolean;
  };
  
  // Filter states (ephemeral) 
  filters: {
    containers: {
      search: string;
      status: string[];
      showStopped: boolean;
    };
    images: {
      search: string;
      inUse?: boolean;
    };
    volumes: {
      search: string;
      inUse?: boolean;
    };
  };
  
  // Notification state (ephemeral)
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
  
  // Actions
  setSelectedDevice: (uuid: string | null) => void;
  setFeatureFlag: (flag: string, enabled: boolean) => void;
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  setFilter: <T extends keyof UIState['filters']>(
    type: T, 
    filter: Partial<UIState['filters'][T]>
  ) => void;
  clearFilters: (type: keyof UIState['filters']) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedDeviceUuid: null,
      featureFlags: {
        containerImagesFSD: true,
        containerVolumesFSD: true,
        containerNetworksFSD: false,
        containerMainFSD: false,
        dashboardFSD: true,
        adminLogsFSD: true,
      },
      modals: {
        createContainer: false,
        deviceInfo: false,
        playbookExecution: false,
      },
      filters: {
        containers: {
          search: '',
          status: [],
          showStopped: false,
        },
        images: {
          search: '',
        },
        volumes: {
          search: '',
        },
      },
      notifications: [],

      // Actions
      setSelectedDevice: (uuid) => set({ selectedDeviceUuid: uuid }),
      
      setFeatureFlag: (flag, enabled) =>
        set((state) => ({
          featureFlags: { ...state.featureFlags, [flag]: enabled }
        })),
      
      openModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true }
        })),
      
      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false }
        })),
      
      setFilter: (type, filter) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [type]: { ...state.filters[type], ...filter }
          }
        })),
      
      clearFilters: (type) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [type]: type === 'containers' 
              ? { search: '', status: [], showStopped: false }
              : { search: '' }
          }
        })),
      
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Math.random().toString(36).substring(7),
              timestamp: new Date(),
            },
            ...state.notifications,
          ].slice(0, 10) // Keep only last 10 notifications
        })),
      
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
      
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ssm-ui-state',
      // Only persist certain parts
      partialize: (state) => ({
        selectedDeviceUuid: state.selectedDeviceUuid,
        featureFlags: state.featureFlags,
      }),
    }
  )
);

// Convenience hooks
export const useSelectedDevice = () => useUIStore((state) => ({
  uuid: state.selectedDeviceUuid,
  setDevice: state.setSelectedDevice,
}));

export const useFeatureFlags = () => useUIStore((state) => ({
  flags: state.featureFlags,
  setFlag: state.setFeatureFlag,
}));

export const useModal = (modal: keyof UIState['modals']) => useUIStore((state) => ({
  isOpen: state.modals[modal],
  open: () => state.openModal(modal),
  close: () => state.closeModal(modal),
}));

export const useFilters = <T extends keyof UIState['filters']>(type: T) => 
  useUIStore((state) => ({
    filters: state.filters[type],
    setFilter: (filter: Partial<UIState['filters'][T]>) => state.setFilter(type, filter),
    clearFilters: () => state.clearFilters(type),
  }));

export const useNotifications = () => useUIStore((state) => ({
  notifications: state.notifications,
  add: state.addNotification,
  remove: state.removeNotification,
  clear: state.clearNotifications,
}));