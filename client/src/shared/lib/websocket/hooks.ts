/**
 * WebSocket React Hooks
 * Provides React integration for WebSocket functionality
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WebSocketManager } from './WebSocketManager';
import { 
  ConnectionState,
  type SubscriptionHandler,
  type SubscriptionOptions,
  type DeviceStatusUpdate,
  type DeviceStatsUpdate,
} from './types';
import { deviceKeys } from '@/features/devices/api/queries';
import type { Device } from '@/shared/lib/device';

/**
 * Core WebSocket hook
 */
export function useWebSocket() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [error, setError] = useState<Error | null>(null);
  const managerRef = useRef<WebSocketManager | null>(null);
  
  useEffect(() => {
    // Initialize WebSocket manager
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws';
      managerRef.current = WebSocketManager.getInstance({
        url: wsUrl,
        debug: process.env.NODE_ENV === 'development',
      });
      
      // Set up event listeners
      const manager = managerRef.current;
      
      const handleStateChange = (state: ConnectionState) => {
        setConnectionState(state);
        if (state !== ConnectionState.ERROR) {
          setError(null);
        }
      };
      
      const handleError = (err: Error) => {
        setError(err);
      };
      
      manager.on('state:change', handleStateChange);
      manager.on('error', handleError);
      
      // Get initial state
      setConnectionState(manager.getState());
      
      return () => {
        manager.off('state:change', handleStateChange);
        manager.off('error', handleError);
      };
    } catch (err) {
      setError(err as Error);
    }
  }, []);
  
  const connect = useCallback((token?: string) => {
    if (managerRef.current) {
      managerRef.current.connect({ token });
    }
  }, []);
  
  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disconnect();
    }
  }, []);
  
  const subscribe = useCallback(<T = unknown>(
    topic: string,
    handler: SubscriptionHandler<T>,
    options?: SubscriptionOptions
  ) => {
    if (!managerRef.current) {
      throw new Error('WebSocket manager not initialized');
    }
    
    return managerRef.current.subscribe(topic, handler, options);
  }, []);
  
  return {
    connectionState,
    error,
    isConnected: connectionState === ConnectionState.CONNECTED,
    connect,
    disconnect,
    subscribe,
  };
}

/**
 * Device-specific WebSocket hook
 */
export function useDeviceWebSocket(deviceId: string | undefined) {
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useWebSocket();
  
  useEffect(() => {
    if (!deviceId || !isConnected) return;
    
    // Subscribe to device status updates
    const unsubscribeStatus = subscribe<DeviceStatusUpdate>(
      `device:${deviceId}:status`,
      (update) => {
        // Update device query data
        queryClient.setQueryData<Device>(
          deviceKeys.detail(deviceId),
          (oldData) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              status: update.status,
              lastSeen: update.timestamp,
            };
          }
        );
        
        // Also update in list queries
        queryClient.setQueriesData<Device[]>(
          { queryKey: deviceKeys.lists() },
          (oldData) => {
            if (!oldData) return oldData;
            
            return oldData.map(device => 
              device.uuid === deviceId
                ? { ...device, status: update.status, lastSeen: update.timestamp }
                : device
            );
          }
        );
      }
    );
    
    // Subscribe to device stats updates
    const unsubscribeStats = subscribe<DeviceStatsUpdate>(
      `device:${deviceId}:stats`,
      (update) => {
        // Update device query data
        queryClient.setQueryData<Device>(
          deviceKeys.detail(deviceId),
          (oldData) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              stats: update.stats,
            };
          }
        );
        
        // Also update in list queries
        queryClient.setQueriesData<Device[]>(
          { queryKey: deviceKeys.lists() },
          (oldData) => {
            if (!oldData) return oldData;
            
            return oldData.map(device => 
              device.uuid === deviceId
                ? { ...device, stats: update.stats }
                : device
            );
          }
        );
      }
    );
    
    return () => {
      unsubscribeStatus();
      unsubscribeStats();
    };
  }, [deviceId, isConnected, subscribe, queryClient]);
}

/**
 * All devices WebSocket hook
 */
export function useDevicesWebSocket() {
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useWebSocket();
  
  useEffect(() => {
    if (!isConnected) return;
    
    // Subscribe to all device updates
    const unsubscribe = subscribe<{
      type: 'created' | 'updated' | 'deleted';
      device?: Device;
      deviceId?: string;
    }>(
      'devices:*',
      (update) => {
        switch (update.type) {
          case 'created':
            if (update.device) {
              // Add to lists
              queryClient.setQueriesData<Device[]>(
                { queryKey: deviceKeys.lists() },
                (oldData) => {
                  if (!oldData) return [update.device!];
                  return [...oldData, update.device!];
                }
              );
            }
            break;
            
          case 'updated':
            if (update.device) {
              // Update specific device
              queryClient.setQueryData(
                deviceKeys.detail(update.device.uuid),
                update.device
              );
              
              // Update in lists
              queryClient.setQueriesData<Device[]>(
                { queryKey: deviceKeys.lists() },
                (oldData) => {
                  if (!oldData) return oldData;
                  
                  return oldData.map(device => 
                    device.uuid === update.device!.uuid
                      ? update.device!
                      : device
                  );
                }
              );
            }
            break;
            
          case 'deleted':
            if (update.deviceId) {
              // Remove from cache
              queryClient.removeQueries({
                queryKey: deviceKeys.detail(update.deviceId),
              });
              
              // Remove from lists
              queryClient.setQueriesData<Device[]>(
                { queryKey: deviceKeys.lists() },
                (oldData) => {
                  if (!oldData) return oldData;
                  
                  return oldData.filter(device => 
                    device.uuid !== update.deviceId
                  );
                }
              );
            }
            break;
        }
        
        // Invalidate stats
        queryClient.invalidateQueries({ queryKey: deviceKeys.stats() });
      }
    );
    
    return unsubscribe;
  }, [isConnected, subscribe, queryClient]);
}

/**
 * WebSocket status indicator hook
 */
export function useWebSocketStatus() {
  const { connectionState, error, connect, disconnect } = useWebSocket();
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const managerRef = useRef<WebSocketManager | null>(null);
  
  useEffect(() => {
    try {
      managerRef.current = WebSocketManager.getInstance();
      
      const handleReconnect = (attempt: number) => {
        setReconnectAttempt(attempt);
      };
      
      managerRef.current.on('reconnect', handleReconnect);
      
      return () => {
        managerRef.current?.off('reconnect', handleReconnect);
      };
    } catch {
      // Manager not initialized yet
    }
  }, []);
  
  const retry = useCallback(() => {
    setReconnectAttempt(0);
    connect();
  }, [connect]);
  
  return {
    connectionState,
    error,
    reconnectAttempt,
    connect,
    disconnect,
    retry,
  };
}