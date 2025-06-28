import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { containersApi, ContainerQuery, ContainerAction } from '@shared/api/containers';
import { useContainerStore } from './container-store';
import { useSelectedDevice } from '@shared/store/device-store';
import { queryKeys } from '@app/store';

/**
 * Hook for fetching containers with real-time updates
 */
export function useContainers(query: ContainerQuery = {}) {
  const { device } = useSelectedDevice();
  const { setContainers, setLoading, setError } = useContainerStore();

  const finalQuery = {
    ...query,
    deviceUuid: query.deviceUuid || device?.uuid,
  };

  return useQuery({
    queryKey: [...queryKeys.containers.list, finalQuery],
    queryFn: () => containersApi.getContainers(finalQuery),
    enabled: !!finalQuery.deviceUuid,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    onSuccess: (data) => {
      setContainers(data.containers || []);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to load containers');
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

/**
 * Hook for container actions (start, stop, restart, etc.)
 */
export function useContainerAction() {
  const queryClient = useQueryClient();
  const { updateContainer } = useContainerStore();

  return useMutation({
    mutationFn: (action: ContainerAction) => containersApi.executeAction(action),
    onMutate: async (action) => {
      // Optimistic update
      updateContainer(action.containerId, {
        status: action.action === 'start' ? 'starting' : 
               action.action === 'stop' ? 'stopping' :
               action.action === 'restart' ? 'restarting' : 'unknown',
      });
    },
    onSuccess: (_, action) => {
      // Invalidate container queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.containers.list });
      
      // Update status based on action
      const newStatus = 
        action.action === 'start' ? 'running' :
        action.action === 'stop' ? 'exited' :
        'unknown';
      
      updateContainer(action.containerId, { status: newStatus });
    },
    onError: (error: any, action) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: queryKeys.containers.list });
      console.error(`Container action ${action.action} failed:`, error);
    },
  });
}

/**
 * Hook for updating container custom name
 */
export function useUpdateContainerName() {
  const queryClient = useQueryClient();
  const { updateContainer } = useContainerStore();

  return useMutation({
    mutationFn: ({ containerId, customName }: { containerId: string; customName: string }) =>
      containersApi.updateCustomName(containerId, customName),
    onMutate: async ({ containerId, customName }) => {
      // Optimistic update
      updateContainer(containerId, { customName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.containers.list });
    },
    onError: (error, { containerId }) => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: queryKeys.containers.list });
      console.error('Failed to update container name:', error);
    },
  });
}

/**
 * Hook for refreshing all containers
 */
export function useRefreshContainers() {
  const queryClient = useQueryClient();
  const { device } = useSelectedDevice();
  const { setLoading } = useContainerStore();

  return useMutation({
    mutationFn: () => containersApi.refreshAll(device?.uuid),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.containers.list });
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

/**
 * Hook for getting container details
 */
export function useContainerDetails(containerId: string, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.containers.detail, containerId],
    queryFn: () => containersApi.getContainer(containerId),
    enabled: enabled && !!containerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for container logs
 */
export function useContainerLogs(
  containerId: string,
  options: {
    tail?: number;
    since?: Date;
    follow?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { enabled = true, ...logOptions } = options;

  return useQuery({
    queryKey: [...queryKeys.containers.logs, containerId, logOptions],
    queryFn: () => containersApi.getLogs(containerId, logOptions),
    enabled: enabled && !!containerId,
    refetchInterval: logOptions.follow ? 2000 : false, // Auto-refresh if following
    staleTime: 10 * 1000, // 10 seconds
  });
}

/**
 * Hook for bulk container actions
 */
export function useBulkContainerActions() {
  const queryClient = useQueryClient();
  const { updateContainer } = useContainerStore();

  const executeBulkAction = async (containerIds: string[], action: ContainerAction['action'], type: ContainerAction['type']) => {
    const promises = containerIds.map(containerId =>
      containersApi.executeAction({ containerId, action, type })
    );

    // Optimistic updates
    containerIds.forEach(containerId => {
      updateContainer(containerId, {
        status: action === 'start' ? 'starting' : 
               action === 'stop' ? 'stopping' :
               action === 'restart' ? 'restarting' : 'unknown',
      });
    });

    try {
      await Promise.allSettled(promises);
      queryClient.invalidateQueries({ queryKey: queryKeys.containers.list });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: queryKeys.containers.list });
      throw error;
    }
  };

  return useMutation({
    mutationFn: ({ containerIds, action, type }: {
      containerIds: string[];
      action: ContainerAction['action'];
      type: ContainerAction['type'];
    }) => executeBulkAction(containerIds, action, type),
  });
}