import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export interface Device {
  uuid: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning' | 'unknown';
  type: 'linux' | 'docker' | 'proxmox';
  authType: 'password' | 'key' | 'agent';
  lastSeen?: Date;
  version?: string;
  capabilities?: {
    docker: boolean;
    proxmox: boolean;
    containers: boolean;
    monitoring: boolean;
  };
}

export interface DeviceState {
  // Current device selection
  selectedDeviceUuid: string | null;
  selectedDevice: Device | null;
  
  // Available devices
  devices: Device[];
  devicesLoading: boolean;
  devicesError: string | null;
  
  // Device filters
  filters: {
    status?: 'online' | 'offline' | 'warning';
    type?: 'linux' | 'docker' | 'proxmox';
    capabilities?: ('docker' | 'proxmox' | 'containers')[];
    search?: string;
  };
  
  // Actions
  setSelectedDevice: (uuid: string | null) => void;
  setDevices: (devices: Device[]) => void;
  updateDevice: (uuid: string, updates: Partial<Device>) => void;
  setDevicesLoading: (loading: boolean) => void;
  setDevicesError: (error: string | null) => void;
  setFilters: (filters: Partial<DeviceState['filters']>) => void;
  clearFilters: () => void;
  
  // Computed getters
  getFilteredDevices: () => Device[];
  getDeviceByUuid: (uuid: string) => Device | undefined;
  getOnlineDevices: () => Device[];
  getDevicesWithCapability: (capability: keyof Device['capabilities']) => Device[];
}

export const useDeviceStore = create<DeviceState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          // State
          selectedDeviceUuid: null,
          selectedDevice: null,
          devices: [],
          devicesLoading: false,
          devicesError: null,
          filters: {},

          // Actions
          setSelectedDevice: (uuid) => {
            const state = get();
            const device = uuid ? state.getDeviceByUuid(uuid) : null;
            set({
              selectedDeviceUuid: uuid,
              selectedDevice: device,
            });
          },

          setDevices: (devices) => {
            const state = get();
            const selectedDevice = state.selectedDeviceUuid 
              ? devices.find(d => d.uuid === state.selectedDeviceUuid)
              : null;
            
            set({
              devices,
              selectedDevice: selectedDevice || null,
              devicesError: null,
            });
          },

          updateDevice: (uuid, updates) => {
            const state = get();
            const devices = state.devices.map(device => 
              device.uuid === uuid ? { ...device, ...updates } : device
            );
            
            // Update selected device if it's the one being updated
            const selectedDevice = state.selectedDeviceUuid === uuid
              ? devices.find(d => d.uuid === uuid) || null
              : state.selectedDevice;

            set({
              devices,
              selectedDevice,
            });
          },

          setDevicesLoading: (loading) => set({ devicesLoading: loading }),

          setDevicesError: (error) => set({ devicesError: error }),

          setFilters: (newFilters) => {
            const state = get();
            set({
              filters: { ...state.filters, ...newFilters }
            });
          },

          clearFilters: () => set({ filters: {} }),

          // Computed getters
          getFilteredDevices: () => {
            const state = get();
            const { devices, filters } = state;
            
            return devices.filter(device => {
              // Status filter
              if (filters.status && device.status !== filters.status) {
                return false;
              }
              
              // Type filter
              if (filters.type && device.type !== filters.type) {
                return false;
              }
              
              // Capabilities filter
              if (filters.capabilities?.length) {
                const hasAllCapabilities = filters.capabilities.every(cap => 
                  device.capabilities?.[cap] === true
                );
                if (!hasAllCapabilities) return false;
              }
              
              // Search filter
              if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesName = device.name.toLowerCase().includes(searchLower);
                const matchesIp = device.ip.includes(searchLower);
                if (!matchesName && !matchesIp) return false;
              }
              
              return true;
            });
          },

          getDeviceByUuid: (uuid) => {
            const state = get();
            return state.devices.find(device => device.uuid === uuid);
          },

          getOnlineDevices: () => {
            const state = get();
            return state.devices.filter(device => device.status === 'online');
          },

          getDevicesWithCapability: (capability) => {
            const state = get();
            return state.devices.filter(device => device.capabilities?.[capability] === true);
          },
        }),
        {
          name: 'device-store',
          partialize: (state) => ({
            selectedDeviceUuid: state.selectedDeviceUuid,
            filters: state.filters,
          }),
        }
      )
    ),
    { name: 'DeviceStore' }
  )
);

// Convenience hooks
export function useSelectedDevice() {
  return useDeviceStore(state => ({
    device: state.selectedDevice,
    uuid: state.selectedDeviceUuid,
    setDevice: state.setSelectedDevice,
  }));
}

export function useDeviceList() {
  return useDeviceStore(state => ({
    devices: state.getFilteredDevices(),
    allDevices: state.devices,
    loading: state.devicesLoading,
    error: state.devicesError,
    setDevices: state.setDevices,
    setLoading: state.setDevicesLoading,
    setError: state.setDevicesError,
  }));
}

export function useDeviceFilters() {
  return useDeviceStore(state => ({
    filters: state.filters,
    setFilters: state.setFilters,
    clearFilters: state.clearFilters,
  }));
}

// React hook for device selection with container capabilities
export function useContainerDevices() {
  return useDeviceStore(state => ({
    devices: state.getDevicesWithCapability('containers'),
    selected: state.selectedDevice,
    selectedUuid: state.selectedDeviceUuid,
    setSelected: state.setSelectedDevice,
    hasDockerDevices: state.getDevicesWithCapability('docker').length > 0,
    hasProxmoxDevices: state.getDevicesWithCapability('proxmox').length > 0,
  }));
}