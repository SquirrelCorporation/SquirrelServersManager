import DeviceStatus from '@/utils/devicestatus';
import { Tag } from 'antd';
import React from 'react';

export type DeviceStatusTagType = {
  status: number;
};

// Updated color mapping with hex codes matching the image style
const statusMap: { [key: number]: { color: string; label: string } } = {
  [DeviceStatus.REGISTERING]: { color: '#DD6B20', label: 'Registering' }, // Orange
  [DeviceStatus.ONLINE]: { color: '#38A169', label: 'Online' }, // Green
  [DeviceStatus.OFFLINE]: { color: '#E53E3E', label: 'Down' }, // Pinkish-Red from image
  [DeviceStatus.UNMANAGED]: { color: '#4A5568', label: 'Unmanaged' }, // Gray
};

const DeviceStatusTag: React.FC<DeviceStatusTagType> = ({ status }) => {
  const statusInfo = statusMap[status];

  // Apply styles for white text and slightly bolder font
  const tagStyle: React.CSSProperties = {
    color: '#FFFFFF',
    fontWeight: 500,
  };

  return statusInfo ? (
    <Tag bordered={false} color={statusInfo.color} style={tagStyle}>
      {statusInfo.label}
    </Tag>
  ) : null;
};

export default DeviceStatusTag;
