import {PageContainer, ProColumns, ProTable} from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import React from 'react';
import {getCrons} from "@/services/ant-design-pro/cron";

const columns : ProColumns<API.Cron>[] = [
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
  const intl = useIntl();
  return (
    <PageContainer
      content={intl.formatMessage({
        id: 'pages.admin.subPage.title',
        defaultMessage: 'This page can only be viewed by admin',
      })}
    >
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
