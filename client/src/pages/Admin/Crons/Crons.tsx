import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import CronColumns from '@/pages/Admin/Crons/CronsColumns';
import { getCrons } from '@/services/rest/cron';
import { InteractionOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';
import { API } from 'ssm-shared-lib';

const Crons: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Crons'}
            backgroundColor={PageContainerTitleColors.CRONS}
            icon={<InteractionOutlined />}
          />
        ),
      }}
    >
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
