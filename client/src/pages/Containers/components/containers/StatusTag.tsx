import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import React from 'react';
import { SsmStatus } from 'ssm-shared-lib';

export type StatusTagProps = {
  status?: string;
};

const StatusTag: React.FC<StatusTagProps> = (props: StatusTagProps) => {
  switch (props.status) {
    case SsmStatus.ContainerStatus.RUNNING:
      return <Tag color="success">Running</Tag>;
    case SsmStatus.ContainerStatus.PAUSED:
      return <Tag color="warning">Paused</Tag>;
    case SsmStatus.ContainerStatus.UNREACHABLE:
      return (
        <Tooltip title={props.status}>
          <Tag icon={<ExclamationCircleOutlined />} color="error" />
        </Tooltip>
      );
    case SsmStatus.ContainerStatus.STOPPED:
      return <Tag color="default">Stopped</Tag>;
    default:
      return <Tag>{props.status}</Tag>;
  }
};

export default StatusTag;
