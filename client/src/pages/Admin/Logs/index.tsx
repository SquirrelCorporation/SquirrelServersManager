import { getServerLogs, getTasksLogs } from '@/services/rest/logs';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import React from 'react';
import { Tabs } from 'antd';
import ColumnsServerLogs from '@/pages/Admin/Logs/ColumsServerLogs';
import ColumnsTaskLogs from '@/pages/Admin/Logs/ColumnsTaskLogs';

const logsTabItem = [
  {
    key: '1',
    label: (
      <div>
        Server Logs
      </div>
    ),
    children: <ProTable<API.ServerLog>
      rowKey="_id"
      request={getServerLogs}
      columns={ColumnsServerLogs}
      search={true}
      dateFormatter="string"
    />,
  },
  {
    key: '2',
    label: (
      <div>
        Task Logs
      </div>
    ),
    children: <ProTable<API.Task>
      rowKey="ident"
      request={getTasksLogs}
      columns={ColumnsTaskLogs}
      search={true}
      dateFormatter="string"
    />,
  },
];


const Index: React.FC = () => {
  return (
    <PageContainer >
      <Tabs items={logsTabItem} />
    </PageContainer>
  );
};

export default Index;
