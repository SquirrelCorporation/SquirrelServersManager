/**
 * Device Card Component
 * Displays device information in a card format
 */

import React from 'react';
import { Card, Tag, Space, Dropdown, Button, Tooltip, Progress, Badge } from 'antd';
import {
  MoreOutlined,
  CloudServerOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  QuestionCircleOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import type { Device } from '@/shared/lib/device';
import { 
  getDeviceHealth, 
  getPerformanceScore,
  formatUptime,
  getLastSeenDuration,
  canPerformOperation
} from '@/shared/lib/device';
import { useDeviceWebSocket } from '@/shared/lib/websocket';
import { useDeviceOperations } from '../model/hooks';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import { DeviceActions } from './DeviceActions';

interface DeviceCardProps {
  device: Device;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: (device: Device) => void;
  onDelete?: (device: Device) => void;
  onOpenSSH?: (device: Device) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onOpenSSH,
}) => {
  const { performOperation, isLoading } = useDeviceOperations(device);
  
  // Enable real-time updates for this device
  useDeviceWebSocket(device.uuid);
  
  const health = getDeviceHealth(device);
  const performanceScore = getPerformanceScore(device);
  const uptime = formatUptime(device.uptime);
  const lastSeen = getLastSeenDuration(device);
  
  const getDeviceIcon = () => {
    switch (device.type) {
      case 'server':
        return <CloudServerOutlined style={{ fontSize: 24 }} />;
      case 'desktop':
        return <DesktopOutlined style={{ fontSize: 24 }} />;
      case 'proxmox':
        return <DatabaseOutlined style={{ fontSize: 24 }} />;
      case 'docker':
        return <DatabaseOutlined style={{ fontSize: 24 }} />;
      default:
        return <QuestionCircleOutlined style={{ fontSize: 24 }} />;
    }
  };
  
  const getHealthColor = () => {
    switch (health) {
      case 'healthy':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'critical':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };
  
  const menuItems = [
    {
      key: 'connect',
      label: 'Connect',
      icon: <WifiOutlined />,
      disabled: !canPerformOperation(device, 'connect').canPerform,
      onClick: () => performOperation('connect'),
    },
    {
      key: 'disconnect',
      label: 'Disconnect',
      icon: <DisconnectOutlined />,
      disabled: !canPerformOperation(device, 'disconnect').canPerform,
      onClick: () => performOperation('disconnect'),
    },
    {
      key: 'refresh',
      label: 'Refresh',
      disabled: !canPerformOperation(device, 'refresh').canPerform,
      onClick: () => performOperation('refresh'),
    },
    { type: 'divider' },
    {
      key: 'ssh',
      label: 'Open SSH',
      disabled: device.status !== 'online',
      onClick: () => onOpenSSH?.(device),
    },
    {
      key: 'edit',
      label: 'Edit',
      onClick: () => onEdit?.(device),
    },
    {
      key: 'delete',
      label: 'Delete',
      danger: true,
      disabled: !canPerformOperation(device, 'delete').canPerform,
      onClick: () => onDelete?.(device),
    },
  ];
  
  return (
    <Badge.Ribbon 
      text={device.status} 
      color={device.status === 'online' ? 'green' : device.status === 'offline' ? 'red' : 'orange'}
    >
      <Card
        hoverable
        loading={isLoading}
        className={isSelected ? 'ant-card-selected' : ''}
        onClick={onSelect}
        extra={
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        }
      >
        <Card.Meta
          avatar={getDeviceIcon()}
          title={
            <Space>
              {device.name}
              <DeviceStatusBadge status={device.status} />
            </Space>
          }
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space size="small" wrap>
                <Tag>{device.type}</Tag>
                {device.ip && <Tag icon={<WifiOutlined />}>{device.ip}</Tag>}
              </Space>
              
              {device.status === 'online' && device.stats && (
                <>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>CPU</span>
                    <Progress
                      percent={device.stats.cpu}
                      size="small"
                      style={{ width: 100 }}
                      strokeColor={device.stats.cpu > 80 ? '#ff4d4f' : undefined}
                    />
                  </Space>
                  
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>Memory</span>
                    <Progress
                      percent={device.stats.memory}
                      size="small"
                      style={{ width: 100 }}
                      strokeColor={device.stats.memory > 80 ? '#ff4d4f' : undefined}
                    />
                  </Space>
                  
                  {device.stats.disk !== undefined && (
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span>Disk</span>
                      <Progress
                        percent={device.stats.disk}
                        size="small"
                        style={{ width: 100 }}
                        strokeColor={device.stats.disk > 90 ? '#ff4d4f' : undefined}
                      />
                    </Space>
                  )}
                </>
              )}
              
              {uptime && (
                <Tooltip title="Uptime">
                  <small>Up: {uptime}</small>
                </Tooltip>
              )}
              
              {lastSeen && (
                <Tooltip title="Last seen">
                  <small>Last seen: {lastSeen}</small>
                </Tooltip>
              )}
              
              {performanceScore !== null && (
                <div style={{ marginTop: 8 }}>
                  <span>Health: </span>
                  <Tag color={getHealthColor()}>{health}</Tag>
                </div>
              )}
            </Space>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};