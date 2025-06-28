import React from 'react';
import { io, Socket } from 'socket.io-client';
import { SsmContainer } from 'ssm-shared-lib';

// Container socket events
export interface ContainerSocketEvents {
  // Inbound events
  'container:status': (data: {
    containerId: string;
    deviceUuid: string;
    status: SsmContainer.Status;
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
  
  'container:logs': (data: {
    containerId: string;
    deviceUuid: string;
    logs: string[];
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
  
  'container:error': (data: {
    containerId?: string;
    deviceUuid: string;
    error: string;
    action?: string;
    timestamp: Date;
  }) => void;

  // Outbound events
  'container:subscribe': (data: {
    containerId?: string;
    deviceUuid?: string;
    events: string[];
  }) => void;
  
  'container:unsubscribe': (data: {
    containerId?: string;
    deviceUuid?: string;
  }) => void;
}

export interface ContainerLogsSocketEvents {
  'logs:data': (data: {
    containerId: string;
    logs: string;
    timestamp: Date;
  }) => void;
  
  'logs:error': (data: {
    containerId: string;
    error: string;
    timestamp: Date;
  }) => void;
  
  'logs:end': (data: {
    containerId: string;
    timestamp: Date;
  }) => void;
  
  'logs:follow': (data: {
    containerId: string;
    tail?: number;
  }) => void;
  
  'logs:stop': (data: {
    containerId: string;
  }) => void;
}

class ContainerSocketService {
  private containerSocket: Socket | null = null;
  private logsSocket: Socket | null = null;
  private eventHandlers = new Map<string, Set<(...args: any[]) => void>>();
  private subscriptions = new Set<string>();

  /**
   * Initialize container socket connection
   */
  initContainerSocket() {
    if (this.containerSocket?.connected) return this.containerSocket;

    this.containerSocket = io('/containers', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.containerSocket.on('connect', () => {
      console.log('Container socket connected');
      // Re-subscribe to previous subscriptions
      this.resubscribeAll();
    });

    this.containerSocket.on('disconnect', () => {
      console.log('Container socket disconnected');
    });

    return this.containerSocket;
  }

  /**
   * Initialize container logs socket connection
   */
  initLogsSocket() {
    if (this.logsSocket?.connected) return this.logsSocket;

    this.logsSocket = io('/containers-live-logs', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.logsSocket.on('connect', () => {
      console.log('Container logs socket connected');
    });

    this.logsSocket.on('disconnect', () => {
      console.log('Container logs socket disconnected');
    });

    return this.logsSocket;
  }

  /**
   * Subscribe to container events
   */
  subscribe<K extends keyof ContainerSocketEvents>(
    event: K,
    handler: ContainerSocketEvents[K],
    options: {
      containerId?: string;
      deviceUuid?: string;
    } = {}
  ) {
    const socket = this.initContainerSocket();
    
    // Store handler for cleanup
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Subscribe to socket event
    socket.on(event, handler);

    // Send subscription request if needed
    if (['container:status', 'container:stats'].includes(event)) {
      const subscriptionKey = `${event}:${options.containerId || 'all'}:${options.deviceUuid || 'all'}`;
      if (!this.subscriptions.has(subscriptionKey)) {
        socket.emit('container:subscribe', {
          containerId: options.containerId,
          deviceUuid: options.deviceUuid,
          events: [event],
        });
        this.subscriptions.add(subscriptionKey);
      }
    }

    // Return unsubscribe function
    return () => this.unsubscribe(event, handler, options);
  }

  /**
   * Unsubscribe from container events
   */
  unsubscribe<K extends keyof ContainerSocketEvents>(
    event: K,
    handler: ContainerSocketEvents[K],
    options: {
      containerId?: string;
      deviceUuid?: string;
    } = {}
  ) {
    const socket = this.containerSocket;
    if (!socket) return;

    // Remove handler
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }

    socket.off(event, handler);

    // Send unsubscription if no more handlers
    if (!handlers || handlers.size === 0) {
      const subscriptionKey = `${event}:${options.containerId || 'all'}:${options.deviceUuid || 'all'}`;
      if (this.subscriptions.has(subscriptionKey)) {
        socket.emit('container:unsubscribe', {
          containerId: options.containerId,
          deviceUuid: options.deviceUuid,
        });
        this.subscriptions.delete(subscriptionKey);
      }
    }
  }

  /**
   * Subscribe to container logs
   */
  subscribeToLogs<K extends keyof ContainerLogsSocketEvents>(
    event: K,
    handler: ContainerLogsSocketEvents[K]
  ) {
    const socket = this.initLogsSocket();
    socket.on(event, handler);

    return () => socket.off(event, handler);
  }

  /**
   * Start following container logs
   */
  followLogs(containerId: string, tail = 100) {
    const socket = this.initLogsSocket();
    socket.emit('logs:follow', { containerId, tail });
  }

  /**
   * Stop following container logs
   */
  stopLogs(containerId: string) {
    const socket = this.initLogsSocket();
    socket.emit('logs:stop', { containerId });
  }

  /**
   * Re-subscribe to all previous subscriptions (used on reconnect)
   */
  private resubscribeAll() {
    if (!this.containerSocket) return;

    for (const subscriptionKey of this.subscriptions) {
      const [event, containerId, deviceUuid] = subscriptionKey.split(':');
      this.containerSocket.emit('container:subscribe', {
        containerId: containerId !== 'all' ? containerId : undefined,
        deviceUuid: deviceUuid !== 'all' ? deviceUuid : undefined,
        events: [event],
      });
    }
  }

  /**
   * Disconnect all sockets
   */
  disconnect() {
    this.containerSocket?.disconnect();
    this.logsSocket?.disconnect();
    this.containerSocket = null;
    this.logsSocket = null;
    this.eventHandlers.clear();
    this.subscriptions.clear();
  }

  /**
   * Get connection status
   */
  get isConnected() {
    return {
      containers: this.containerSocket?.connected || false,
      logs: this.logsSocket?.connected || false,
    };
  }
}

// Singleton instance
export const containerSocketService = new ContainerSocketService();

// React hook for container events
export function useContainerSocket<K extends keyof ContainerSocketEvents>(
  event: K,
  handler: ContainerSocketEvents[K],
  options: {
    containerId?: string;
    deviceUuid?: string;
    enabled?: boolean;
  } = {}
) {
  const { enabled = true, ...subscribeOptions } = options;

  React.useEffect(() => {
    if (!enabled || !handler) return;

    const unsubscribe = containerSocketService.subscribe(event, handler, subscribeOptions);
    return unsubscribe;
  }, [event, handler, enabled, subscribeOptions.containerId, subscribeOptions.deviceUuid]);
}

// React hook for container logs
export function useContainerLogs(
  containerId: string,
  options: {
    tail?: number;
    enabled?: boolean;
    onData?: (logs: string) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  } = {}
) {
  const { tail = 100, enabled = true, onData, onError, onEnd } = options;

  React.useEffect(() => {
    if (!enabled || !containerId) return;

    const unsubscribers: (() => void)[] = [];

    if (onData) {
      const unsubData = containerSocketService.subscribeToLogs('logs:data', (data) => {
        if (data.containerId === containerId) {
          onData(data.logs);
        }
      });
      unsubscribers.push(unsubData);
    }

    if (onError) {
      const unsubError = containerSocketService.subscribeToLogs('logs:error', (data) => {
        if (data.containerId === containerId) {
          onError(data.error);
        }
      });
      unsubscribers.push(unsubError);
    }

    if (onEnd) {
      const unsubEnd = containerSocketService.subscribeToLogs('logs:end', (data) => {
        if (data.containerId === containerId) {
          onEnd();
        }
      });
      unsubscribers.push(unsubEnd);
    }

    // Start following logs
    containerSocketService.followLogs(containerId, tail);

    return () => {
      containerSocketService.stopLogs(containerId);
      unsubscribers.forEach(unsub => unsub());
    };
  }, [containerId, tail, enabled, onData, onError, onEnd]);
}