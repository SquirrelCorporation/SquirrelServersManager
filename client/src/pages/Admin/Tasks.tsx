import { getTasks } from '@/services/ant-design-pro/ansible';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';

const columns: ProColumns<API.Task>[] = [
  {
    title: 'Identifier',
    dataIndex: 'ident',
    key: 'ident',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Command',
    dataIndex: 'cmd',
    key: 'cmd',
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    valueType: 'dateTime',
  },
];

const Tasks: React.FC = () => {
  const intl = useIntl();
  return (
    <PageContainer
      content={intl.formatMessage({
        id: 'pages.admin.subPage.title',
        defaultMessage: 'This page can only be viewed by admin',
      })}
    >
      <ProTable<API.Task>
        rowKey="name"
        request={getTasks}
        columns={columns}
        search={false}
        dateFormatter="string"
      />
    </PageContainer>
  );
};

export default Tasks;
