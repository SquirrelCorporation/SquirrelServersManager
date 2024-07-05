import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import AutomationEditionDrawer from '@/pages/Automations/components/AutomationEditionDrawer';
import CronColumns from '@/pages/Automations/CronsColumns';
import { getCrons } from '@/services/rest/cron';
import { InteractionOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';
import { API } from 'ssm-shared-lib';

const automationsTabItem = [
  {
    key: '1',
    label: <div>Automations</div>,
    children: (
      <>
        <ProTable<API.Cron>
          rowKey="name"
          request={getCrons}
          columns={CronColumns}
          search={false}
          dateFormatter="string"
          toolBarRender={() => [
            <AutomationEditionDrawer key={'automation-edit'} />,
          ]}
        />
      </>
    ),
  },
  {
    key: '2',
    label: <div>Default</div>,
    children: (
      <ProTable<API.Cron>
        rowKey="name"
        request={getCrons}
        columns={CronColumns}
        search={false}
        dateFormatter="string"
      />
    ),
  },
];
const Automations: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Automations'}
            backgroundColor={PageContainerTitleColors.CRONS}
            icon={<InteractionOutlined />}
          />
        ),
      }}
      tabList={automationsTabItem}
    />
  );
};
export default Automations;
