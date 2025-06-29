import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import React from 'react';
import { SsmStatus } from 'ssm-shared-lib';

export type StatusTagProps = {
  status?: string;
};

const tagStyle: React.CSSProperties = {
  color: '#FFFFFF',
  fontWeight: 500,
};

const StatusTag: React.FC<StatusTagProps> = (props: StatusTagProps) => {
  switch (props.status) {
    case SsmStatus.ContainerStatus.RUNNING:
      return (
        <Tag color="#38A169" style={tagStyle}>
          Running
        </Tag>
      );
    case SsmStatus.ContainerStatus.PAUSED:
      return (
        <Tag color="#DD6B20" style={tagStyle}>
          Paused
        </Tag>
      );
    case SsmStatus.ContainerStatus.UNREACHABLE:
      return (
        <Tooltip title={props.status}>
          <Tag
            icon={<ExclamationCircleOutlined />}
            color="#E53E3E"
            style={tagStyle}
          />
        </Tooltip>
      );
    case SsmStatus.ContainerStatus.STOPPED:
      return (
        <Tag color="#4A5568" style={tagStyle}>
          Stopped
        </Tag>
      );
    default:
      return <Tag style={tagStyle}>{props.status}</Tag>;
  }
};

export default StatusTag;
