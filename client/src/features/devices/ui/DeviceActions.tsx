/**
 * Device Actions Component
 * Action buttons for device operations
 */

import React from 'react';
import { Space, Button, Tooltip } from 'antd';
import {
  SyncOutlined,
  PoweroffOutlined,
  WifiOutlined,
  CodeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Device, DeviceOperation } from '@/shared/lib/device';
import { canPerformOperation } from '@/shared/lib/device';

interface DeviceActionsProps {
  device: Device;
  onOperation: (operation: DeviceOperation) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onOpenSSH?: () => void;
  loading?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export const DeviceActions: React.FC<DeviceActionsProps> = ({
  device,
  onOperation,
  onEdit,
  onDelete,
  onOpenSSH,
  loading = false,
  size = 'small',
}) => {
  const renderOperationButton = (
    operation: DeviceOperation,
    icon: React.ReactNode,
    title: string,
    type?: 'primary' | 'default' | 'dashed' | 'text' | 'link'
  ) => {
    const { canPerform, reason } = canPerformOperation(device, operation);
    
    const button = (
      <Button
        type={type}
        size={size}
        icon={icon}
        disabled={!canPerform || loading}
        loading={loading}
        onClick={() => onOperation(operation)}
      >
        {title}
      </Button>
    );
    
    if (!canPerform && reason) {
      return (
        <Tooltip title={reason}>
          {button}
        </Tooltip>
      );
    }
    
    return button;
  };
  
  return (
    <Space size="small" wrap>
      {device.status === 'offline' && 
        renderOperationButton('connect', <WifiOutlined />, 'Connect', 'primary')
      }
      
      {device.status === 'online' && (
        <>
          {renderOperationButton('refresh', <SyncOutlined />, 'Refresh')}
          {renderOperationButton('disconnect', <PoweroffOutlined />, 'Disconnect')}
          
          {onOpenSSH && (
            <Tooltip title="Open SSH Terminal">
              <Button
                size={size}
                icon={<CodeOutlined />}
                onClick={onOpenSSH}
              >
                SSH
              </Button>
            </Tooltip>
          )}
        </>
      )}
      
      {onEdit && (
        <Button
          size={size}
          icon={<EditOutlined />}
          onClick={onEdit}
        >
          Edit
        </Button>
      )}
      
      {onDelete && (
        <Tooltip 
          title={
            device.status === 'online' 
              ? 'Cannot delete online devices. Disconnect first.' 
              : 'Delete device'
          }
        >
          <Button
            danger
            size={size}
            icon={<DeleteOutlined />}
            disabled={device.status === 'online' || loading}
            onClick={onDelete}
          >
            Delete
          </Button>
        </Tooltip>
      )}
    </Space>
  );
};