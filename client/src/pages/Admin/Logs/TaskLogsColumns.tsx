import { ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';

const TaskLogsColumns: ProColumns<API.Task>[] = [
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
    valueType: 'code',
  },
];

export default TaskLogsColumns;
