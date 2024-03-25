import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import ServerLogsColumns from '@/pages/Admin/Logs/ServerLogsColums';
import { getServerLogs, getTasksLogs } from '@/services/rest/logs';
import {
  DatabaseOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import React from 'react';
import { Avatar, Col, Row, Tabs, Typography } from 'antd';
import TaskLogsColumns from '@/pages/Admin/Logs/TaskLogsColumns';
import { API } from 'ssm-shared-lib';

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
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Logs'}
            backgroundColor={PageContainerTitleColors.LOGS}
            icon={<UnorderedListOutlined />}
          />
        ),
      }}
      tabList={logsTabItem}
    />
  );
};

export default Index;
