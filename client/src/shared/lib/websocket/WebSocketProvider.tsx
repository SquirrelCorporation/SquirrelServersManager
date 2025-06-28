/**
 * WebSocket Provider Component
 * Initializes WebSocket connection at app level
 */

import React, { useEffect } from 'react';
import { useWebSocket, useDevicesWebSocket } from './hooks';

interface WebSocketProviderProps {
  children: React.ReactNode;
  token?: string;
  autoConnect?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  token,
  autoConnect = true,
}) => {
  const { connect, isConnected } = useWebSocket();
  
  // Auto-connect on mount if configured
  useEffect(() => {
    if (autoConnect && !isConnected && token) {
      connect(token);
    }
  }, [autoConnect, isConnected, token, connect]);
  
  // Set up global device subscriptions
  useDevicesWebSocket();
  
  return <>{children}</>;
};