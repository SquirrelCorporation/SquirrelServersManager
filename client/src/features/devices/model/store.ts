/**
 * Device Feature Store
 * Local state management for device-specific UI state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DeviceFilters, Device } from '@/shared/lib/device';

interface DeviceUIState {
  // View state
  viewMode: 'grid' | 'list' | 'table';
  selectedDevices: Set<string>;
  expandedGroups: Set<string>;
  
  // Filter state
  filters: DeviceFilters;
  
  // SSH Terminal state
  activeSSHSessions: Map<string, {
    deviceId: string;
    deviceName: string;
    isConnected: boolean;
    lastActivity: Date;
  }>;
  
  // Modal state
  isCreateModalOpen: boolean;
  editingDevice: Device | null;
  isDeletingDevice: Device | null;
  
  // Actions
  setViewMode: (mode: 'grid' | 'list' | 'table') => void;
  toggleDeviceSelection: (deviceId: string) => void;
  selectAllDevices: (deviceIds: string[]) => void;
  clearSelection: () => void;
  
  toggleGroup: (groupId: string) => void;
  
  updateFilters: (filters: Partial<DeviceFilters>) => void;
  resetFilters: () => void;
  
  addSSHSession: (deviceId: string, deviceName: string) => void;
  updateSSHSession: (deviceId: string, isConnected: boolean) => void;
  removeSSHSession: (deviceId: string) => void;
  
  openCreateModal: () => void;
  closeCreateModal: () => void;
  startEditing: (device: Device) => void;
  stopEditing: () => void;
  startDeleting: (device: Device) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
}

const defaultFilters: DeviceFilters = {
  search: '',
  status: [],
  type: [],
  capabilities: {
    containers: undefined,
    monitoring: undefined,
  },
  sortBy: 'name',
  sortOrder: 'asc',
};

export const useDeviceStore = create<DeviceUIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      viewMode: 'grid',
      selectedDevices: new Set(),
      expandedGroups: new Set(),
      filters: defaultFilters,
      activeSSHSessions: new Map(),
      isCreateModalOpen: false,
      editingDevice: null,
      isDeletingDevice: null,
      
      // View actions
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Selection actions
      toggleDeviceSelection: (deviceId) => set((state) => {
        const newSelection = new Set(state.selectedDevices);
        if (newSelection.has(deviceId)) {
          newSelection.delete(deviceId);
        } else {
          newSelection.add(deviceId);
        }
        return { selectedDevices: newSelection };
      }),
      
      selectAllDevices: (deviceIds) => set({
        selectedDevices: new Set(deviceIds),
      }),
      
      clearSelection: () => set({
        selectedDevices: new Set(),
      }),
      
      // Group actions
      toggleGroup: (groupId) => set((state) => {
        const newExpanded = new Set(state.expandedGroups);
        if (newExpanded.has(groupId)) {
          newExpanded.delete(groupId);
        } else {
          newExpanded.add(groupId);
        }
        return { expandedGroups: newExpanded };
      }),
      
      // Filter actions
      updateFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
      })),
      
      resetFilters: () => set({
        filters: defaultFilters,
      }),
      
      // SSH actions
      addSSHSession: (deviceId, deviceName) => set((state) => {
        const newSessions = new Map(state.activeSSHSessions);
        newSessions.set(deviceId, {
          deviceId,
          deviceName,
          isConnected: false,
          lastActivity: new Date(),
        });
        return { activeSSHSessions: newSessions };
      }),
      
      updateSSHSession: (deviceId, isConnected) => set((state) => {
        const newSessions = new Map(state.activeSSHSessions);
        const session = newSessions.get(deviceId);
        if (session) {
          newSessions.set(deviceId, {
            ...session,
            isConnected,
            lastActivity: new Date(),
          });
        }
        return { activeSSHSessions: newSessions };
      }),
      
      removeSSHSession: (deviceId) => set((state) => {
        const newSessions = new Map(state.activeSSHSessions);
        newSessions.delete(deviceId);
        return { activeSSHSessions: newSessions };
      }),
      
      // Modal actions
      openCreateModal: () => set({ isCreateModalOpen: true }),
      closeCreateModal: () => set({ isCreateModalOpen: false }),
      
      startEditing: (device) => set({ editingDevice: device }),
      stopEditing: () => set({ editingDevice: null }),
      
      startDeleting: (device) => set({ isDeletingDevice: device }),
      confirmDelete: () => set({ isDeletingDevice: null }),
      cancelDelete: () => set({ isDeletingDevice: null }),
    }),
    {
      name: 'device-store',
    }
  )
);