/**
 * Device API Queries
 * TanStack Query hooks for fetching device data
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Device, DeviceFilters } from '@/shared/lib/device';
import { filterDevices, sortDevices, calculateDeviceStats } from '@/shared/lib/device';
import { api } from '@/shared/api';

// Query Keys
export const deviceKeys = {
  all: ['devices'] as const,
  lists: () => [...deviceKeys.all, 'list'] as const,
  list: (filters?: DeviceFilters) => [...deviceKeys.lists(), filters] as const,
  details: () => [...deviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...deviceKeys.details(), id] as const,
  stats: () => [...deviceKeys.all, 'stats'] as const,
  ssh: (id: string) => [...deviceKeys.all, 'ssh', id] as const,
};

/**
 * Fetch all devices
 */
export function useDevices(filters?: DeviceFilters): UseQueryResult<Device[], Error> {
  return useQuery({
    queryKey: deviceKeys.list(filters),
    queryFn: async () => {
      const response = await api.get('/devices');
      const devices = response.data as Device[];
      
      // Apply client-side filtering and sorting
      if (filters) {
        const filtered = filterDevices(devices, filters);
        return sortDevices(filtered, filters.sortBy || 'name', filters.sortOrder || 'asc');
      }
      
      return devices;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single device by ID
 */
export function useDevice(deviceId: string): UseQueryResult<Device, Error> {
  return useQuery({
    queryKey: deviceKeys.detail(deviceId),
    queryFn: async () => {
      const response = await api.get(`/devices/${deviceId}`);
      return response.data as Device;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!deviceId,
  });
}

/**
 * Fetch device statistics
 */
export function useDeviceStats(): UseQueryResult<ReturnType<typeof calculateDeviceStats>, Error> {
  return useQuery({
    queryKey: deviceKeys.stats(),
    queryFn: async () => {
      const response = await api.get('/devices');
      const devices = response.data as Device[];
      return calculateDeviceStats(devices);
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch SSH configuration for a device
 */
export function useDeviceSSH(deviceId: string): UseQueryResult<{
  url: string;
  token: string;
}, Error> {
  return useQuery({
    queryKey: deviceKeys.ssh(deviceId),
    queryFn: async () => {
      const response = await api.get(`/devices/${deviceId}/ssh`);
      return response.data;
    },
    staleTime: 0, // Always fresh
    gcTime: 0, // Don't cache
    enabled: !!deviceId,
  });
}