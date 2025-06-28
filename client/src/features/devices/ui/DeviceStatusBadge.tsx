/**
 * Device Status Badge Component
 * Displays device status with appropriate styling
 */

import React from 'react';
import { Badge } from 'antd';
import type { DeviceStatus } from '@/shared/lib/device';

interface DeviceStatusBadgeProps {
  status: DeviceStatus;
  showText?: boolean;
}

export const DeviceStatusBadge: React.FC<DeviceStatusBadgeProps> = ({ 
  status, 
  showText = false 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return { status: 'success' as const, text: 'Online' };
      case 'offline':
        return { status: 'error' as const, text: 'Offline' };
      case 'connecting':
        return { status: 'processing' as const, text: 'Connecting' };
      case 'error':
        return { status: 'error' as const, text: 'Error' };
      case 'unknown':
      default:
        return { status: 'default' as const, text: 'Unknown' };
    }
  };
  
  const config = getStatusConfig();
  
  return (
    <Badge 
      status={config.status} 
      text={showText ? config.text : undefined}
    />
  );
};