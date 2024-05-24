import { Tag } from 'antd';
import React from 'react';
import { ContainerStatus } from 'ssm-shared-lib/distribution/enums/status';

export type StatusTagProps = {
  status?: string;
};

const StatusTag: React.FC<StatusTagProps> = (props: StatusTagProps) => {
  switch (props.status) {
    case ContainerStatus.RUNNING:
      return <Tag color="success">Running</Tag>;
    case ContainerStatus.PAUSED:
      return <Tag color="warning">Paused</Tag>;
    default:
      return <Tag>{props.status}</Tag>;
  }
};

export default StatusTag;
