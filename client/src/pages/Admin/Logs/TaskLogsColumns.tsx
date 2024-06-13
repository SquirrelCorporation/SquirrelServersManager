import { ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const TaskLogsColumns: ProColumns<API.Task>[] = [
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    valueType: 'dateTime',
  },
  {
    title: 'Identifier',
    dataIndex: 'ident',
    key: 'ident',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    valueType: 'select',
    valueEnum: {
      failed: { text: 'failed' },
      successful: { text: 'successful' },
      starting: { text: 'starting' },
    },
    render: (dom, entity) => {
      return (
        <Tag
          bordered={false}
          color={
            entity.status === 'successful'
              ? 'success'
              : entity.status === 'failed'
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
    valueType: 'code',
  },
];

export default TaskLogsColumns;
