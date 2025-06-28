import { PageTitle, TitleColors } from '@shared/ui/templates/PageTitle';
import ServerLogsColumns from '@/pages/Admin/Logs/ServerLogsColums';
import TaskLogsColumns from '@/pages/Admin/Logs/TaskLogsColumns';
import { getServerLogs } from '@/services/rest/logs/logs';
import { getTasksLogs } from '@/services/rest/ansible/ansible.logs';
import {
  UnorderedListOutlined,
  FileTextOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { ColumnsState, ProTable } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { useSearchParams } from '@umijs/max';
import { TabsProps } from 'antd';
import React, { useState } from 'react';
import { API } from 'ssm-shared-lib';
import { StyledTabContainer, TabLabel, IconWrapper } from '@shared/ui/layouts/StyledTabContainer';

const Index: React.FC = () => {
  const [form] = ProForm.useForm<any>();
  const [searchParams] = useSearchParams();

  const [columnsStateMap, setColumnsStateMap] = useState<
    Record<string, ColumnsState>
  >({
    req: {
      show: false,
    },
    res: {
      show: false,
    },
    err: {
      show: false,
    },
  });

  if (searchParams.get('module')) {
    form.setFieldsValue({ module: searchParams.get('module') });
  }
  if (searchParams.get('moduleId')) {
    form.setFieldsValue({ moduleId: searchParams.get('moduleId') });
  }
  if (searchParams.get('msg')) {
    form.setFieldsValue({ msg: searchParams.get('msg') });
  }

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
          <PageTitle
            title={'Logs'}
            backgroundColor={TitleColors.LOGS}
            icon={<UnorderedListOutlined />}
            isMain={true}
          />
        ),
      }}
      tabItems={logsTabItems}
    />
  );
};

export default Index;
