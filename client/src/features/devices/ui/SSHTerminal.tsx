/**
 * SSH Terminal Component
 * Web-based SSH terminal for device connections
 */

import React, { useEffect, useRef } from 'react';
import { Card, Space, Button, Tag } from 'antd';
import { CloseOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import type { Device } from '@/shared/lib/device';
import { useDeviceSSH } from '../api/queries';
import { useSSHSessions } from '../model/hooks';

interface SSHTerminalProps {
  device: Device;
  onClose?: () => void;
}

export const SSHTerminal: React.FC<SSHTerminalProps> = ({ device, onClose }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { data: sshConfig, isLoading } = useDeviceSSH(device.uuid);
  const { updateSession } = useSSHSessions();
  
  useEffect(() => {
    if (sshConfig && terminalRef.current) {
      // Initialize terminal here
      // This would use xterm.js or similar library
      updateSession(device.uuid, true);
      
      return () => {
        updateSession(device.uuid, false);
      };
    }
  }, [sshConfig, device.uuid, updateSession]);
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <Card
      title={
        <Space>
          <span>SSH Terminal - {device.name}</span>
          <Tag color="green">Connected</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button
            type="text"
            icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
            onClick={toggleFullscreen}
          />
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
          />
        </Space>
      }
      loading={isLoading}
      className={isFullscreen ? 'ssh-terminal-fullscreen' : 'ssh-terminal'}
      style={{
        height: isFullscreen ? '100vh' : '500px',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 1000 : undefined,
      }}
    >
      <div
        ref={terminalRef}
        style={{
          height: '100%',
          backgroundColor: '#000',
          color: '#fff',
          fontFamily: 'monospace',
          padding: '10px',
          overflow: 'auto',
        }}
      >
        {/* Terminal content would be rendered here by xterm.js */}
        <div>SSH Terminal for {device.name} ({device.ip})</div>
        <div>Connecting...</div>
      </div>
    </Card>
  );
};