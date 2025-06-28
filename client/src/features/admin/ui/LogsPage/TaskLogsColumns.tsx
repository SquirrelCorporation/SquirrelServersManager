import React from 'react';
import { ProColumns } from '@ant-design/pro-components';
import { Tag, Typography } from 'antd';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { TaskLogsTerminalModal } from './TaskLogsTerminalModal';

const { Text } = Typography;

const EllipsisMiddle: React.FC<{ suffixCount: number; children: string }> = ({
  suffixCount,
  children,
}) => {
  try {
    const start = children.slice(0, children.length - suffixCount);
    const suffix = children.slice(-suffixCount).trim();
    return (
      <Text style={{ maxWidth: '100%' }} ellipsis={{ suffix }} code>
        {start}
      </Text>
    );
  } catch (error) {
    return (
      <Text style={{ maxWidth: '100%' }} ellipsis={{ suffix: children }} code>
        {children}
      </Text>
    );
  }
};

export const TaskLogsColumns: ProColumns<API.Task>[] = [
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    valueType: 'dateTime',
  },
  {
    title: 'Task Identifier',
    dataIndex: 'ident',
    key: 'ident',
  },
  {
    title: 'Task Status',
    dataIndex: 'status',
    key: 'status',
    valueType: 'select',
    valueEnum: {
      failed: { text: 'failed' },
      successful: { text: 'successful' },
      starting: { text: 'starting' },
      timeout: { text: 'timeout' },
      canceled: { text: 'canceled' },
    },
    render: (dom, entity) => {
      return (
        <Tag
          bordered={false}
          color={
            entity.status === SsmAnsible.AnsibleTaskStatus.SUCCESS
              ? 'success'
              : entity.status === SsmAnsible.AnsibleTaskStatus.FAILED
                ? 'error'
                : 'default'
          }
        >
          {entity.status}
        </Tag>
      );
    },
  },
  {
    title: 'Command',
    dataIndex: 'cmd',
    key: 'cmd',
    render: (_, entity) => {
      return <EllipsisMiddle suffixCount={12}>{entity.cmd}</EllipsisMiddle>;
    },
  },
  {
    dataIndex: 'option',
    valueType: 'option',
    hideInSearch: true,
    render: (_, record) => [
      <TaskLogsTerminalModal key="terminal" task={record} />,
    ],
  },
];