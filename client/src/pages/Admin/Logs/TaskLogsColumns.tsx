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
    render: (dom, entity) => {
      return (
        <Tag
          bordered={false}
          color={entity.status === 'successful' ? 'success' : 'error'}
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
  },
];

export default TaskLogsColumns;
