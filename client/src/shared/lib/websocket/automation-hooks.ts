/**
 * Automation WebSocket Hooks
 * React hooks for automation real-time updates
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './hooks';
import { queryKeys, QueryKeyPatterns } from '@/shared/lib/query-keys/query-keys';
import type { 
  AutomationStatusUpdate, 
  AutomationProgressUpdate, 
  AutomationLogUpdate,
  AutomationCompletionUpdate 
} from './types';
import type { API } from 'ssm-shared-lib';

/**
 * Hook for subscribing to automation status updates
 */
export function useAutomationWebSocket(automationId: string | undefined) {
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!automationId || !isConnected) return;

    // Subscribe to automation status updates
    const unsubscribeStatus = subscribe<AutomationStatusUpdate>(
      `automation:${automationId}:status`,
      (update) => {
        // Update automation in list cache
        queryClient.setQueryData<API.Automation[]>(
          queryKeys.automations.list(),
          (oldData) => {
            if (!oldData) return oldData;
            return oldData.map(automation => 
              automation.uuid === automationId
                ? {
                    ...automation,
                    lastExecutionStatus: update.status,
                    lastExecutionTime: update.timestamp,
                  }
                : automation
            );
          }
        );

        // Update individual automation cache
        queryClient.setQueryData<API.Automation>(
          QueryKeyPatterns.automationDetail(automationId),
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              lastExecutionStatus: update.status,
              lastExecutionTime: update.timestamp,
            };
          }
        );
      }
    );

    return () => unsubscribeStatus();
  }, [automationId, isConnected, subscribe, queryClient]);

  // Return current connection status
  return { isConnected };
}

/**
 * Hook for real-time automation execution monitoring
 */
export function useAutomationExecution(automationId: string | undefined) {
  const { subscribe, isConnected } = useWebSocket();

  const subscribeToExecution = useCallback((
    onProgress?: (update: AutomationProgressUpdate) => void,
    onLog?: (update: AutomationLogUpdate) => void,
    onCompletion?: (update: AutomationCompletionUpdate) => void
  ) => {
    if (!automationId || !isConnected) return () => {};

    const unsubscribers: (() => void)[] = [];

    // Subscribe to progress updates
    if (onProgress) {
      const unsubscribeProgress = subscribe<AutomationProgressUpdate>(
        `automation:${automationId}:progress`,
        onProgress
      );
      unsubscribers.push(unsubscribeProgress);
    }

    // Subscribe to log updates
    if (onLog) {
      const unsubscribeLog = subscribe<AutomationLogUpdate>(
        `automation:${automationId}:log`,
        onLog
      );
      unsubscribers.push(unsubscribeLog);
    }

    // Subscribe to completion updates
    if (onCompletion) {
      const unsubscribeCompletion = subscribe<AutomationCompletionUpdate>(
        `automation:${automationId}:completed`,
        onCompletion
      );
      unsubscribers.push(unsubscribeCompletion);
    }

    // Return cleanup function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [automationId, isConnected, subscribe]);

  return {
    subscribeToExecution,
    isConnected,
  };
}

/**
 * Hook for global automation events (create, update, delete)
 */
export function useGlobalAutomationEvents() {
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to automation CRUD events
    const unsubscribeCreated = subscribe<{ automation: API.Automation }>(
      'automation:created',
      (update) => {
        // Add new automation to list cache
        queryClient.setQueryData<API.Automation[]>(
          queryKeys.automations.list(),
          (oldData) => oldData ? [...oldData, update.automation] : [update.automation]
        );
      }
    );

    const unsubscribeUpdated = subscribe<{ automation: API.Automation }>(
      'automation:updated',
      (update) => {
        // Update automation in list cache
        queryClient.setQueryData<API.Automation[]>(
          queryKeys.automations.list(),
          (oldData) => {
            if (!oldData) return oldData;
            return oldData.map(automation => 
              automation.uuid === update.automation.uuid
                ? update.automation
                : automation
            );
          }
        );

        // Update individual automation cache
        queryClient.setQueryData(
          QueryKeyPatterns.automationDetail(update.automation.uuid),
          update.automation
        );
      }
    );

    const unsubscribeDeleted = subscribe<{ automationId: string }>(
      'automation:deleted',
      (update) => {
        // Remove automation from list cache
        queryClient.setQueryData<API.Automation[]>(
          queryKeys.automations.list(),
          (oldData) => oldData ? oldData.filter(a => a.uuid !== update.automationId) : []
        );

        // Remove individual automation cache
        queryClient.removeQueries({
          queryKey: QueryKeyPatterns.automationDetail(update.automationId),
        });
      }
    );

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [isConnected, subscribe, queryClient]);

  return { isConnected };
}

/**
 * Hook for monitoring multiple automations
 */
export function useAutomationListWebSocket() {
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to status updates for all automations
    const unsubscribeAllStatus = subscribe<AutomationStatusUpdate>(
      'automation:*:status',
      (update) => {
        // Update automation in list cache
        queryClient.setQueryData<API.Automation[]>(
          queryKeys.automations.list(),
          (oldData) => {
            if (!oldData) return oldData;
            return oldData.map(automation => 
              automation.uuid === update.automationId
                ? {
                    ...automation,
                    lastExecutionStatus: update.status,
                    lastExecutionTime: update.timestamp,
                  }
                : automation
            );
          }
        );
      }
    );

    return () => unsubscribeAllStatus();
  }, [isConnected, subscribe, queryClient]);

  return { isConnected };
}

/**
 * Hook for automation execution logs streaming
 */
export function useAutomationLogs(automationId: string | undefined, executionId?: string) {
  const { subscribe, isConnected } = useWebSocket();

  const subscribeToLogs = useCallback((
    onLog: (log: AutomationLogUpdate) => void
  ) => {
    if (!automationId || !isConnected) return () => {};

    const topic = executionId 
      ? `automation:${automationId}:execution:${executionId}:log`
      : `automation:${automationId}:log`;

    return subscribe<AutomationLogUpdate>(topic, onLog);
  }, [automationId, executionId, isConnected, subscribe]);

  return {
    subscribeToLogs,
    isConnected,
  };
}

/**
 * Hook for system-wide automation statistics
 */
export function useAutomationStatsWebSocket() {
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to automation stats updates
    const unsubscribeStats = subscribe<{
      totalAutomations: number;
      activeExecutions: number;
      successRate: number;
      recentFailures: string[];
    }>(
      'automation:stats',
      (stats) => {
        // Could store stats in a separate query or update UI store
        // For now, just invalidate automation queries to refresh data
        queryClient.invalidateQueries({
          queryKey: queryKeys.automations.list(),
        });
      }
    );

    return () => unsubscribeStats();
  }, [isConnected, subscribe, queryClient]);

  return { isConnected };
}