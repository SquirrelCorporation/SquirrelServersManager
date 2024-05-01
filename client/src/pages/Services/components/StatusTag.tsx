import { Tag } from 'antd';
import React from 'react';

export type StatusTagProps = {
  status?: string;
};

const StatusTag: React.FC<StatusTagProps> = (props: StatusTagProps) => {
  switch (props.status) {
    case 'running':
      return <Tag color="success">Running</Tag>;
    case 'paused':
      return <Tag color="warning">Paused</Tag>;
    default:
      return <Tag>{props.status}</Tag>;
  }
};

export default StatusTag;
