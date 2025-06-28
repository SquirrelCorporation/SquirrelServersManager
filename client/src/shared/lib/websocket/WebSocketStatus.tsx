/**
 * WebSocket Status Indicator Component
 * Shows connection status and allows manual reconnection
 */

import React from 'react';
import { Badge, Button, Tooltip, Space } from 'antd';
import { 
  WifiOutlined, 
  DisconnectOutlined, 
  LoadingOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useWebSocketStatus } from './hooks';
import { ConnectionState } from './types';

export const WebSocketStatus: React.FC = () => {
  const { 
    connectionState, 
    error, 
    reconnectAttempt,
    connect,
    disconnect,
    retry,
  } = useWebSocketStatus();
  
  const getStatusConfig = (state: ConnectionState) => {
    switch (state) {
      case ConnectionState.CONNECTED:
        return {
          status: 'success' as const,
          icon: <WifiOutlined />,
          text: 'Connected',
          color: '#52c41a',
        };
      case ConnectionState.CONNECTING:
        return {
          status: 'processing' as const,
          icon: <LoadingOutlined spin />,
          text: reconnectAttempt > 0 
            ? `Reconnecting (${reconnectAttempt})...` 
            : 'Connecting...',
          color: '#1890ff',
        };
      case ConnectionState.DISCONNECTED:
        return {
          status: 'default' as const,
          icon: <DisconnectOutlined />,
          text: 'Disconnected',
          color: '#d9d9d9',
        };
      case ConnectionState.DISCONNECTING:
        return {
          status: 'warning' as const,
          icon: <LoadingOutlined spin />,
          text: 'Disconnecting...',
          color: '#faad14',
        };
      case ConnectionState.ERROR:
        return {
          status: 'error' as const,
          icon: <ExclamationCircleOutlined />,
          text: 'Connection Error',
          color: '#ff4d4f',
        };
    }
  };
  
  const config = getStatusConfig(connectionState);
  
  const content = (
    <Space size="small">
      <Badge status={config.status} text={config.text} />
      
      {connectionState === ConnectionState.DISCONNECTED && (
        <Button
          type="link"
          size="small"
          icon={<WifiOutlined />}
          onClick={() => connect()}
        >
          Connect
        </Button>
      )}
      
      {connectionState === ConnectionState.CONNECTED && (
        <Button
          type="link"
          size="small"
          icon={<DisconnectOutlined />}
          onClick={disconnect}
        >
          Disconnect
        </Button>
      )}
      
      {connectionState === ConnectionState.ERROR && (
        <Button
          type="link"
          size="small"
          icon={<ReloadOutlined />}
          onClick={retry}
        >
          Retry
        </Button>
      )}
    </Space>
  );
  
  if (error) {
    return (
      <Tooltip title={`Error: ${error.message}`}>
        {content}
      </Tooltip>
    );
  }
  
  return content;
};

/**
 * Minimal WebSocket status dot indicator
 */
export const WebSocketStatusDot: React.FC = () => {
  const { connectionState } = useWebSocketStatus();
  
  const getColor = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return '#52c41a';
      case ConnectionState.CONNECTING:
      case ConnectionState.DISCONNECTING:
        return '#1890ff';
      case ConnectionState.ERROR:
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };
  
  return (
    <Tooltip title={`WebSocket: ${connectionState}`}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: getColor(),
          display: 'inline-block',
        }}
      />
    </Tooltip>
  );
};