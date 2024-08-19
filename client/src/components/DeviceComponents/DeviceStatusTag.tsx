import DeviceStatus from '@/utils/devicestatus';
import { Tag } from 'antd';
import React from 'react';

export type DeviceStatusTagType = {
  status: number;
};

const statusMap: { [key: number]: { color: string; label: string } } = {
  [DeviceStatus.REGISTERING]: { color: 'warning', label: 'Registering' },
  [DeviceStatus.ONLINE]: { color: 'success', label: 'Online' },
  [DeviceStatus.OFFLINE]: { color: 'error', label: 'Down' },
  [DeviceStatus.UNMANAGED]: { color: 'processing', label: 'Unmanaged' },
};

const DeviceStatusTag: React.FC<DeviceStatusTagType> = ({ status }) => {
  const statusInfo = statusMap[status];

  return statusInfo ? (
    <Tag bordered={false} color={statusInfo.color}>
      {statusInfo.label}
    </Tag>
  ) : null;
};

export default DeviceStatusTag;
