import Title, { TitleColors } from '@/components/Template/Title';
import ServerLogsColumns from '@/pages/Admin/Logs/ServerLogsColums';
import TaskLogsColumns from '@/pages/Admin/Logs/TaskLogsColumns';
import { getServerLogs, getTasksLogs } from '@/services/rest/logs';
import { UnorderedListOutlined } from '@ant-design/icons';
import {
  ColumnsState,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { history, useLocation, useSearchParams } from '@umijs/max';
import { TabsProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';

const Index: React.FC = () => {
  const [form] = ProForm.useForm<any>();
  const [searchParams] = useSearchParams();
  const location = useLocation();

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
      label: <div>Server Logs</div>,
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
      label: <div>Task Logs</div>,
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

  // Function to handle tab change
  const handleTabChange = (key: string) => {
    history.replace(`#${key}`);
  };

  // Sync active tab with the hash in the URL
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!logsTabItems.some((item) => item.key === hash)) return;
    // Sync the initially selected tab with the hash in the URL
    handleTabChange(hash);
  }, [location.hash]);

  return (
    <>
      <PageContainer
        header={{
          title: (
            <Title.MainTitle
              title={'Logs'}
              backgroundColor={TitleColors.LOGS}
              icon={<UnorderedListOutlined />}
            />
          ),
        }}
        tabList={logsTabItems}
        onTabChange={handleTabChange}
        tabActiveKey={location.hash.replace('#', '') || logsTabItems[0].key}
      />
    </>
  );
};

export default Index;
