import CronColumns from '@/pages/Admin/Crons/CronsColumns';
import { getCrons } from '@/services/rest/cron';
import {
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';

const Crons: React.FC = () => {
  return (
    <PageContainer content={'This page can only be viewed by Admin'}>
      <ProTable<API.Cron>
        rowKey="name"
        request={getCrons}
        columns={CronColumns}
        search={false}
        dateFormatter="string"
      />
    </PageContainer>
  );
};
export default Crons;
