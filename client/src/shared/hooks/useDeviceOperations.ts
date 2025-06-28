import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { queryKeys } from '@app/store';
import { useDeviceMonitor } from '@app/store';
import { apiClient } from '@shared/lib/api-client';

export interface Device {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning' | 'error';
  type: 'docker' | 'proxmox' | 'ssh';
  lastSeen: Date;
  specs?: {
    cpu: string;
    memory: string;
    os: string;
  };
}

export interface DeviceFilters {
  status?: string;
  type?: string;
  search?: string;
}

/**
 * Comprehensive hook for device operations combining server state, real-time data, and mutations
 */
export const useDeviceOperations = (filters: DeviceFilters = {}) => {
  const queryClient = useQueryClient();
  const deviceMonitor = useDeviceMonitor();

  // Query for device list
  const devicesQuery = useQuery({
    queryKey: queryKeys.devices.list(filters),
    queryFn: async () => {
      const response = await apiClient.get<Device[]>('/api/devices', { 
        params: filters 
      });
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds for device list
  });

  // Mutations for device operations
  const createDeviceMutation = useMutation({
    mutationFn: async (deviceData: Omit<Device, 'id' | 'lastSeen'>) => {
      return apiClient.post<Device>('/api/devices', deviceData);
    },
    onSuccess: (newDevice) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.lists() });
      message.success(`Device "${newDevice.name}" created successfully`);
    },
    onError: (error: any) => {
      message.error(`Failed to create device: ${error.message}`);
    },
  });

  const updateDeviceMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Device> & { id: string }) => {
      return apiClient.put<Device>(`/api/devices/${id}`, data);
    },
    onSuccess: (updatedDevice) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.detail(updatedDevice.id) });
      message.success(`Device "${updatedDevice.name}" updated successfully`);
    },
    onError: (error: any) => {
      message.error(`Failed to update device: ${error.message}`);
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      return apiClient.delete(`/api/devices/${deviceId}`);
    },
    onSuccess: (_, deviceId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.devices.detail(deviceId) });
      deviceMonitor.unsubscribeFromDevice(deviceId);
      message.success('Device deleted successfully');
    },
    onError: (error: any) => {
      message.error(`Failed to delete device: ${error.message}`);
    },
  });

  const restartDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      return apiClient.post(`/api/devices/${deviceId}/restart`);
    },
    onSuccess: (_, deviceId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.detail(deviceId) });
      message.success('Device restart initiated');
    },
    onError: (error: any) => {
      message.error(`Failed to restart device: ${error.message}`);
    },
  });

  // Enhance devices with real-time metrics
  const devicesWithMetrics = React.useMemo(() => {
    if (!devicesQuery.data) return [];
    
    return devicesQuery.data.map(device => {
      const metrics = deviceMonitor.getDeviceMetrics(device.id);
      return {
        ...device,
        realTimeMetrics: metrics,
        // Override status with real-time status if available
        status: metrics?.status || device.status,
      };
    });
  }, [devicesQuery.data, deviceMonitor]);

  // Bulk operations
  const bulkOperations = {
    restart: async (deviceIds: string[]) => {
      const results = await Promise.allSettled(
        deviceIds.map(id => restartDeviceMutation.mutateAsync(id))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed === 0) {
        message.success(`${successful} devices restarted successfully`);
      } else {
        message.warning(`${successful} devices restarted, ${failed} failed`);
      }
    },
    
    delete: async (deviceIds: string[]) => {
      const results = await Promise.allSettled(
        deviceIds.map(id => deleteDeviceMutation.mutateAsync(id))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (failed === 0) {
        message.success(`${successful} devices deleted successfully`);
      } else {
        message.warning(`${successful} devices deleted, ${failed} failed`);
      }
    },
  };

  return {
    // Data
    devices: devicesWithMetrics,
    isLoading: devicesQuery.isLoading,
    error: devicesQuery.error,
    
    // Mutations
    createDevice: createDeviceMutation.mutate,
    updateDevice: updateDeviceMutation.mutate,
    deleteDevice: deleteDeviceMutation.mutate,
    restartDevice: restartDeviceMutation.mutate,
    
    // Mutation states
    isCreating: createDeviceMutation.isPending,
    isUpdating: updateDeviceMutation.isPending,
    isDeleting: deleteDeviceMutation.isPending,
    isRestarting: restartDeviceMutation.isPending,
    
    // Bulk operations
    bulkOperations,
    
    // Real-time monitoring
    subscribeToDevice: deviceMonitor.subscribeToDevice,
    unsubscribeFromDevice: deviceMonitor.unsubscribeFromDevice,
    getDeviceMetrics: deviceMonitor.getDeviceMetrics,
    getDeviceHistory: deviceMonitor.getDeviceHistory,
    
    // Refresh
    refetch: devicesQuery.refetch,
  };
};