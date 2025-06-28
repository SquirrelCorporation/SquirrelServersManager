import React from 'react';
import { ProTable } from '@ant-design/pro-components';
import { TabsProps } from 'antd';
import { API } from 'ssm-shared-lib';
import {
  UnorderedListOutlined,
  FileTextOutlined,
  RobotOutlined,
} from '@ant-design/icons';

// Legacy imports - to be migrated later
import Title, { TitleColors } from '@shared/ui/templates/PageTitle';
import StyledTabContainer, {
  TabLabel,
  IconWrapper,
} from '@shared/ui/layouts/StyledTabContainer';
import { getServerLogs } from '@/services/rest/logs/logs';
import { getTasksLogs } from '@/services/rest/ansible/ansible.logs';

// New FSD imports
import { useLogsPageState } from '../../model/logs';
import { ServerLogsColumns } from './ServerLogsColumns';
import { TaskLogsColumns } from './TaskLogsColumns';

export const LogsPage: React.FC = () => {
  const { form, columnsStateMap, setColumnsStateMap } = useLogsPageState();

  const logsTabItems: TabsProps['items'] = [
    {
      key: 'server-logs',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #32D74B, #27AE60)">
            <FileTextOutlined />
          </IconWrapper>
          Server Logs
        </TabLabel>
      ),
      children: (
        <ProTable<API.ServerLog>
          rowKey="_id"
          request={getServerLogs}
          columns={ServerLogsColumns}
          search={{
            labelWidth: 120,
            form: form,
            filterType: 'light',
          }}
          dateFormatter="string"
          columnsState={{
            value: columnsStateMap,
            onChange: setColumnsStateMap,
          }}
        />
      ),
    },
    {
      key: 'task-logs',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #FF375F, #E31B4E)">
            <RobotOutlined />
          </IconWrapper>
          Task Logs
        </TabLabel>
      ),
      children: (
        <ProTable<API.Task>
          rowKey="ident"
          request={getTasksLogs}
          columns={TaskLogsColumns}
          search={{
            labelWidth: 120,
            filterType: 'light',
          }}
          dateFormatter="string"
        />
      ),
    },
  ];

  return (
    <StyledTabContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Logs'}
            backgroundColor={TitleColors.LOGS}
            icon={<UnorderedListOutlined />}
          />
        ),
      }}
      tabItems={logsTabItems}
    />
  );
};