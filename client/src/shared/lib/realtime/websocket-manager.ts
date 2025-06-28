import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { queryKeys } from '@app/store';

/**
 * Simplified WebSocket Manager - No Memory Leaks
 * Integrates directly with TanStack Query for real-time updates
 */

export interface WebSocketEvents {
  'container:status': (data: {
    containerId: string;
    deviceUuid: string;
    status: string;
    timestamp: Date;
  }) => void;
  
  'container:stats': (data: {
    containerId: string;
    deviceUuid: string;
    stats: {
      cpu: number;
      memory: number;
      network: { rx: number; tx: number };
    };
    timestamp: Date;
  }) => void;
  
  'container:created': (data: {
    container: any;
    deviceUuid: string;
    timestamp: Date;
  }) => void;
  
  'container:removed': (data: {
    containerId: string;
    deviceUuid: string;
    timestamp: Date;
  }) => void;
}

class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private subscriptions = new Map<string, Set<Function>>();
  
  connect() {
    if (this.socket?.connected) return this.socket;

    this.socket = io('/containers', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed after max attempts');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.subscriptions.clear();
    }
  }

  subscribe<K extends keyof WebSocketEvents>(
    event: K,
    handler: WebSocketEvents[K]
  ): () => void {
    const socket = this.connect();
    
    // Track subscription for cleanup
    if (!this.subscriptions.has(event)) {
      this.subscriptions.set(event, new Set());
    }
    this.subscriptions.get(event)!.add(handler);
    
    socket.on(event, handler);

    // Return cleanup function
    return () => {
      socket.off(event, handler);
      const handlers = this.subscriptions.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscriptions.delete(event);
        }
      }
    };
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const websocketManager = new WebSocketManager();

/**
 * React hook for WebSocket events with automatic cleanup
 */
export function useWebSocketEvent<K extends keyof WebSocketEvents>(
  event: K,
  handler: WebSocketEvents[K],
  enabled = true
) {
  React.useEffect(() => {
    if (!enabled || !handler) return;

    const unsubscribe = websocketManager.subscribe(event, handler);
    return unsubscribe;
  }, [event, handler, enabled]);
}

/**
 * React hook that integrates WebSocket events with TanStack Query
 */
export function useRealtimeContainers(deviceUuid?: string) {
  const queryClient = useQueryClient();

  // Container status updates
  useWebSocketEvent('container:status', (data) => {
    if (deviceUuid && data.deviceUuid !== deviceUuid) return;
    
    // Update TanStack Query cache directly
    queryClient.setQueryData(
      [...queryKeys.containers.list({ deviceUuid: data.deviceUuid })],
      (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((container: any) =>
          container.id === data.containerId
            ? { ...container, status: data.status }
            : container
        );
      }
    );
  });

  // Container stats updates
  useWebSocketEvent('container:stats', (data) => {
    if (deviceUuid && data.deviceUuid !== deviceUuid) return;
    
    queryClient.setQueryData(
      [...queryKeys.containers.detail(data.containerId), 'stats'],
      data.stats
    );
  });

  // New container created
  useWebSocketEvent('container:created', (data) => {
    if (deviceUuid && data.deviceUuid !== deviceUuid) return;
    
    // Invalidate containers list to refetch
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.containers.list({ deviceUuid: data.deviceUuid })]
    });
  });

  // Container removed
  useWebSocketEvent('container:removed', (data) => {
    if (deviceUuid && data.deviceUuid !== deviceUuid) return;
    
    // Remove from cache and invalidate
    queryClient.removeQueries({
      queryKey: [...queryKeys.containers.detail(data.containerId)]
    });
    
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.containers.list({ deviceUuid: data.deviceUuid })]
    });
  });
}