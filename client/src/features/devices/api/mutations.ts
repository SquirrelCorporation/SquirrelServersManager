/**
 * Device API Mutations
 * TanStack Query hooks for modifying device data
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import type { Device, DeviceConfig, DeviceOperation, BulkOperationResult } from '@/shared/lib/device';
import { 
  validateDeviceConfig, 
  validateDeviceUpdate,
  canPerformOperation,
  validateBulkSelection,
  requiresReconnection
} from '@/shared/lib/device';
import { api } from '@/shared/api';
import { deviceKeys } from './queries';

interface CreateDeviceParams {
  config: DeviceConfig;
}

interface UpdateDeviceParams {
  deviceId: string;
  updates: Partial<DeviceConfig>;
}

interface DeleteDeviceParams {
  deviceId: string;
}

interface DeviceOperationParams {
  deviceId: string;
  operation: DeviceOperation;
}

interface BulkOperationParams {
  deviceIds: string[];
  operation: DeviceOperation;
}

/**
 * Create a new device
 */
export function useCreateDevice(): UseMutationResult<Device, Error, CreateDeviceParams> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ config }: CreateDeviceParams) => {
      // Validate configuration
      const errors = validateDeviceConfig(config);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      const response = await api.post('/devices', config);
      return response.data as Device;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: deviceKeys.stats() });
    },
  });
}

/**
 * Update an existing device
 */
export function useUpdateDevice(): UseMutationResult<Device, Error, UpdateDeviceParams> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ deviceId, updates }: UpdateDeviceParams) => {
      // Get current device to validate update
      const currentDevice = queryClient.getQueryData<Device>(deviceKeys.detail(deviceId));
      if (!currentDevice) {
        throw new Error('Device not found');
      }
      
      // Validate update
      const errors = validateDeviceUpdate(currentDevice, updates);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }
      
      const response = await api.patch(`/devices/${deviceId}`, updates);
      return response.data as Device;
    },
    onSuccess: (data, { deviceId, updates }) => {
      // Update specific device
      queryClient.setQueryData(deviceKeys.detail(deviceId), data);
      
      // Check if reconnection is needed
      const currentDevice = queryClient.getQueryData<Device>(deviceKeys.detail(deviceId));
      if (currentDevice && requiresReconnection(currentDevice, { ...currentDevice, ...updates })) {
        // Trigger reconnection
        api.post(`/devices/${deviceId}/reconnect`).catch(console.error);
      }
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: deviceKeys.stats() });
    },
  });
}

/**
 * Delete a device
 */
export function useDeleteDevice(): UseMutationResult<void, Error, DeleteDeviceParams> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ deviceId }: DeleteDeviceParams) => {
      // Get device to check if it can be deleted
      const device = queryClient.getQueryData<Device>(deviceKeys.detail(deviceId));
      if (device) {
        const { canPerform, reason } = canPerformOperation(device, 'delete');
        if (!canPerform) {
          throw new Error(reason || 'Cannot delete device');
        }
      }
      
      await api.delete(`/devices/${deviceId}`);
    },
    onSuccess: (_, { deviceId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: deviceKeys.detail(deviceId) });
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: deviceKeys.stats() });
    },
  });
}

/**
 * Perform an operation on a device
 */
export function useDeviceOperation(): UseMutationResult<Device, Error, DeviceOperationParams> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ deviceId, operation }: DeviceOperationParams) => {
      // Get device to check if operation can be performed
      const device = queryClient.getQueryData<Device>(deviceKeys.detail(deviceId));
      if (device) {
        const { canPerform, reason } = canPerformOperation(device, operation);
        if (!canPerform) {
          throw new Error(reason || `Cannot perform ${operation}`);
        }
      }
      
      const response = await api.post(`/devices/${deviceId}/${operation}`);
      return response.data as Device;
    },
    onSuccess: (data, { deviceId }) => {
      // Update device
      queryClient.setQueryData(deviceKeys.detail(deviceId), data);
      queryClient.invalidateQueries({ queryKey: deviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: deviceKeys.stats() });
      
      // Invalidate SSH if disconnecting
      if (data.status !== 'online') {
        queryClient.removeQueries({ queryKey: deviceKeys.ssh(deviceId) });
      }
    },
  });
}

/**
 * Perform a bulk operation on multiple devices
 */
export function useBulkDeviceOperation(): UseMutationResult<BulkOperationResult, Error, BulkOperationParams> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ deviceIds, operation }: BulkOperationParams) => {
      // Get devices to validate
      const devices: Device[] = [];
      deviceIds.forEach(id => {
        const device = queryClient.getQueryData<Device>(deviceKeys.detail(id));
        if (device) devices.push(device);
      });
      
      // Validate bulk selection
      const validation = validateBulkSelection(devices, operation);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await api.post('/devices/bulk', {
        deviceIds,
        operation,
      });
      return response.data as BulkOperationResult;
    },
    onSuccess: () => {
      // Invalidate all device queries
      queryClient.invalidateQueries({ queryKey: deviceKeys.all });
    },
  });
}