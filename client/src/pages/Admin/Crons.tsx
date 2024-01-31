import { getCrons } from '@/services/rest/cron';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';
const columns: ProColumns<API.Cron>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Expression',
    dataIndex: 'expression',
    key: 'expression',
  },
  {
    title: 'Last Execution',
    dataIndex: 'lastExecution',
    key: 'lastExecution',
    valueType: 'dateTime',
  },
];
const Crons: React.FC = () => {
  return (
    <PageContainer content={'This page can only be viewed by Admin'}>
      <ProTable<API.Cron>
        rowKey="name"
        request={getCrons}
        columns={columns}
        search={false}
        dateFormatter="string"
      />
    </PageContainer>
  );
};
export default Crons;
