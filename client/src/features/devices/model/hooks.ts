/**
 * Device Feature Hooks
 * Custom hooks for device operations and state management
 */

import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { Device, DeviceOperation } from '@/shared/lib/device';
import { 
  groupDevicesByStatus,
  groupDevicesByType,
  suggestBulkOperations,
  formatOperationResult,
  estimateOperationDuration,
  getRecommendedActions
} from '@/shared/lib/device';
import { useDevices, deviceKeys } from '../api/queries';
import { 
  useDeviceOperation, 
  useBulkDeviceOperation,
  useUpdateDevice,
  useDeleteDevice 
} from '../api/mutations';
import { useDeviceStore } from './store';

/**
 * Hook for managing device selection
 */
export function useDeviceSelection() {
  const { selectedDevices, toggleDeviceSelection, selectAllDevices, clearSelection } = useDeviceStore();
  const { data: devices = [] } = useDevices();
  
  const selectedDevicesList = useMemo(
    () => devices.filter(d => selectedDevices.has(d.uuid)),
    [devices, selectedDevices]
  );
  
  const isAllSelected = useMemo(
    () => devices.length > 0 && devices.every(d => selectedDevices.has(d.uuid)),
    [devices, selectedDevices]
  );
  
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAllDevices(devices.map(d => d.uuid));
    }
  }, [isAllSelected, clearSelection, selectAllDevices, devices]);
  
  return {
    selectedDevices: selectedDevicesList,
    selectedCount: selectedDevices.size,
    isAllSelected,
    toggleSelection: toggleDeviceSelection,
    selectAll: handleSelectAll,
    clearSelection,
  };
}

/**
 * Hook for device grouping
 */
export function useDeviceGroups() {
  const { data: devices = [] } = useDevices();
  const { expandedGroups, toggleGroup } = useDeviceStore();
  
  const groupedByStatus = useMemo(() => groupDevicesByStatus(devices), [devices]);
  const groupedByType = useMemo(() => groupDevicesByType(devices), [devices]);
  
  return {
    groupedByStatus,
    groupedByType,
    expandedGroups,
    toggleGroup,
  };
}

/**
 * Hook for bulk operations
 */
export function useBulkOperations() {
  const { selectedDevices, clearSelection } = useDeviceStore();
  const { data: devices = [] } = useDevices();
  const bulkMutation = useBulkDeviceOperation();
  
  const selectedDevicesList = useMemo(
    () => devices.filter(d => selectedDevices.has(d.uuid)),
    [devices, selectedDevices]
  );
  
  const suggestions = useMemo(
    () => suggestBulkOperations(selectedDevicesList),
    [selectedDevicesList]
  );
  
  const performBulkOperation = useCallback(
    async (operation: DeviceOperation) => {
      const deviceIds = Array.from(selectedDevices);
      
      try {
        const result = await bulkMutation.mutateAsync({
          deviceIds,
          operation,
        });
        
        message.success(formatOperationResult(operation, result));
        clearSelection();
      } catch (error) {
        message.error(`Failed to ${operation} devices: ${(error as Error).message}`);
      }
    },
    [selectedDevices, bulkMutation, clearSelection]
  );
  
  return {
    suggestions,
    performBulkOperation,
    isLoading: bulkMutation.isPending,
  };
}

/**
 * Hook for single device operations
 */
export function useDeviceOperations(device: Device) {
  const operationMutation = useDeviceOperation();
  const updateMutation = useUpdateDevice();
  const deleteMutation = useDeleteDevice();
  const queryClient = useQueryClient();
  
  const recommendations = useMemo(
    () => getRecommendedActions(device),
    [device]
  );
  
  const performOperation = useCallback(
    async (operation: DeviceOperation) => {
      const duration = estimateOperationDuration(device, operation);
      const hide = message.loading(`Performing ${operation}...`, 0);
      
      try {
        await operationMutation.mutateAsync({
          deviceId: device.uuid,
          operation,
        });
        
        hide();
        message.success(`Successfully ${operation}ed ${device.name}`);
      } catch (error) {
        hide();
        message.error(`Failed to ${operation}: ${(error as Error).message}`);
      }
    },
    [device, operationMutation]
  );
  
  const updateDevice = useCallback(
    async (updates: Partial<Device>) => {
      try {
        await updateMutation.mutateAsync({
          deviceId: device.uuid,
          updates,
        });
        
        message.success(`Successfully updated ${device.name}`);
      } catch (error) {
        message.error(`Failed to update: ${(error as Error).message}`);
      }
    },
    [device, updateMutation]
  );
  
  const deleteDevice = useCallback(
    async () => {
      try {
        await deleteMutation.mutateAsync({
          deviceId: device.uuid,
        });
        
        message.success(`Successfully deleted ${device.name}`);
      } catch (error) {
        message.error(`Failed to delete: ${(error as Error).message}`);
      }
    },
    [device, deleteMutation]
  );
  
  return {
    recommendations,
    performOperation,
    updateDevice,
    deleteDevice,
    isLoading: operationMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}

/**
 * Hook for SSH sessions
 */
export function useSSHSessions() {
  const { 
    activeSSHSessions, 
    addSSHSession, 
    updateSSHSession, 
    removeSSHSession 
  } = useDeviceStore();
  
  const queryClient = useQueryClient();
  
  const openSSHSession = useCallback(
    (device: Device) => {
      // Check if session already exists
      if (activeSSHSessions.has(device.uuid)) {
        message.info(`SSH session for ${device.name} is already open`);
        return;
      }
      
      // Add session
      addSSHSession(device.uuid, device.name);
      
      // Prefetch SSH config
      queryClient.prefetchQuery({
        queryKey: deviceKeys.ssh(device.uuid),
        queryFn: async () => {
          // This would be implemented in the actual API
          return { url: '', token: '' };
        },
      });
    },
    [activeSSHSessions, addSSHSession, queryClient]
  );
  
  const closeSSHSession = useCallback(
    (deviceId: string) => {
      removeSSHSession(deviceId);
      queryClient.removeQueries({ queryKey: deviceKeys.ssh(deviceId) });
    },
    [removeSSHSession, queryClient]
  );
  
  return {
    sessions: Array.from(activeSSHSessions.values()),
    openSession: openSSHSession,
    closeSession: closeSSHSession,
    updateSession: updateSSHSession,
  };
}