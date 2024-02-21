import ServerLogsColumns from '@/pages/Admin/Logs/ServerLogsColums';
import { getServerLogs, getTasksLogs } from '@/services/rest/logs';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import React from 'react';
import { Tabs } from 'antd';
import TaskLogsColumns from '@/pages/Admin/Logs/TaskLogsColumns';

const logsTabItem = [
  {
    key: '1',
    label: <div>Server Logs</div>,
    children: (
      <ProTable<API.ServerLog>
        rowKey="_id"
        request={getServerLogs}
        columns={ServerLogsColumns}
        search={{
          labelWidth: 120,
        }}
        dateFormatter="string"
      />
    ),
  },
  {
    key: '2',
    label: <div>Task Logs</div>,
    children: (
      <ProTable<API.Task>
        rowKey="ident"
        request={getTasksLogs}
        columns={TaskLogsColumns}
        search={{
          labelWidth: 120,
        }}
        dateFormatter="string"
      />
    ),
  },
];

const Index: React.FC = () => {
  return (
    <PageContainer>
      <Tabs items={logsTabItem} />
    </PageContainer>
  );
};

export default Index;
