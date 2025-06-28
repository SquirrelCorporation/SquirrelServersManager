import { useEffect, useRef, useState } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useNotificationsStore } from '../client-state/notifications.store';

export interface DeviceMetrics {
  deviceId: string;
  timestamp: Date;
  cpu: {
    usage: number;
    temperature?: number;
    cores: number;
  };
  memory: {
    usage: number;
    total: number;
    available: number;
  };
  disk: {
    usage: number;
    total: number;
    available: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  status: 'online' | 'offline' | 'warning' | 'error';
}

interface DeviceMonitorState {
  // Current metrics for all devices
  metrics: Map<string, DeviceMetrics>;
  
  // Historical data (last 100 points per device)
  history: Map<string, DeviceMetrics[]>;
  
  // Connection status
  connected: boolean;
  lastUpdate: Date | null;
  
  // Subscribed devices
  subscribedDevices: Set<string>;
  
  // Actions
  updateMetrics: (metrics: DeviceMetrics) => void;
  subscribeToDevice: (deviceId: string) => void;
  unsubscribeFromDevice: (deviceId: string) => void;
  setConnectionStatus: (connected: boolean) => void;
  clearMetrics: (deviceId?: string) => void;
  
  // Getters
  getDeviceMetrics: (deviceId: string) => DeviceMetrics | undefined;
  getDeviceHistory: (deviceId: string, limit?: number) => DeviceMetrics[];
  isDeviceSubscribed: (deviceId: string) => boolean;
}

export const useDeviceMonitorStore = create<DeviceMonitorState>()(
  devtools((set, get) => ({
    metrics: new Map(),
    history: new Map(),
    connected: false,
    lastUpdate: null,
    subscribedDevices: new Set(),
    
    updateMetrics: (newMetrics) => {
      const { notifications } = useNotificationsStore.getState();
      const currentMetrics = get().metrics.get(newMetrics.deviceId);
      
      // Check for status changes and send notifications
      if (currentMetrics && currentMetrics.status !== newMetrics.status) {
        if (newMetrics.status === 'offline') {
          notifications.deviceOffline(`Device ${newMetrics.deviceId}`);
        } else if (newMetrics.status === 'online' && currentMetrics.status === 'offline') {
          notifications.deviceOnline(`Device ${newMetrics.deviceId}`);
        }
      }
      
      set((state) => {
        const newMetricsMap = new Map(state.metrics);
        const newHistoryMap = new Map(state.history);
        
        // Update current metrics
        newMetricsMap.set(newMetrics.deviceId, newMetrics);
        
        // Update history (keep last 100 points)
        const deviceHistory = newHistoryMap.get(newMetrics.deviceId) || [];
        const updatedHistory = [...deviceHistory, newMetrics].slice(-100);
        newHistoryMap.set(newMetrics.deviceId, updatedHistory);
        
        return {
          metrics: newMetricsMap,
          history: newHistoryMap,
          lastUpdate: new Date()
        };
      }, false, 'deviceMonitor/updateMetrics');
    },
    
    subscribeToDevice: (deviceId) => 
      set((state) => ({
        subscribedDevices: new Set([...state.subscribedDevices, deviceId])
      }), false, 'deviceMonitor/subscribe'),
    
    unsubscribeFromDevice: (deviceId) => 
      set((state) => {
        const newSubscriptions = new Set(state.subscribedDevices);
        newSubscriptions.delete(deviceId);
        return { subscribedDevices: newSubscriptions };
      }, false, 'deviceMonitor/unsubscribe'),
    
    setConnectionStatus: (connected) => 
      set({ connected }, false, 'deviceMonitor/setConnectionStatus'),
    
    clearMetrics: (deviceId) => 
      set((state) => {
        if (deviceId) {
          const newMetrics = new Map(state.metrics);
          const newHistory = new Map(state.history);
          newMetrics.delete(deviceId);
          newHistory.delete(deviceId);
          return { metrics: newMetrics, history: newHistory };
        } else {
          return { metrics: new Map(), history: new Map() };
        }
      }, false, 'deviceMonitor/clearMetrics'),
    
    // Getters
    getDeviceMetrics: (deviceId) => get().metrics.get(deviceId),
    
    getDeviceHistory: (deviceId, limit = 100) => {
      const history = get().history.get(deviceId) || [];
      return history.slice(-limit);
    },
    
    isDeviceSubscribed: (deviceId) => get().subscribedDevices.has(deviceId),
  }), {
    name: 'device-monitor-store'
  })
);

/**
 * Hook for managing WebSocket connection to device monitoring service
 */
export const useDeviceMonitor = (autoConnect = true) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  const store = useDeviceMonitorStore();
  
  const connect = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      return;
    }
    
    try {
      // TODO: Replace with actual WebSocket endpoint
      const ws = new WebSocket('ws://localhost:3001/api/devices/monitor');
      
      ws.onopen = () => {
        console.log('Device monitor WebSocket connected');
        store.setConnectionStatus(true);
        reconnectAttempts.current = 0;
        
        // Subscribe to all currently subscribed devices
        const subscribedDevices = Array.from(store.subscribedDevices);
        if (subscribedDevices.length > 0) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            deviceIds: subscribedDevices
          }));
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'metrics' && data.metrics) {
            store.updateMetrics({
              ...data.metrics,
              timestamp: new Date(data.metrics.timestamp)
            });
          }
        } catch (error) {
          console.error('Error parsing device metrics:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('Device monitor WebSocket error:', error);
        store.setConnectionStatus(false);
      };
      
      ws.onclose = () => {
        console.log('Device monitor WebSocket disconnected');
        store.setConnectionStatus(false);
        setSocket(null);
        
        // Attempt to reconnect with exponential backoff
        if (autoConnect && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        }
      };
      
      setSocket(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      store.setConnectionStatus(false);
    }
  };
  
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close();
      setSocket(null);
    }
    
    store.setConnectionStatus(false);
  };
  
  const subscribeToDevice = (deviceId: string) => {
    store.subscribeToDevice(deviceId);
    
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        deviceIds: [deviceId]
      }));
    }
  };
  
  const unsubscribeFromDevice = (deviceId: string) => {
    store.unsubscribeFromDevice(deviceId);
    
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        deviceIds: [deviceId]
      }));
    }
  };
  
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect]);
  
  return {
    connect,
    disconnect,
    subscribeToDevice,
    unsubscribeFromDevice,
    isConnected: store.connected,
    getDeviceMetrics: store.getDeviceMetrics,
    getDeviceHistory: store.getDeviceHistory,
  };
};