import { CarbonIbmEventAutomation } from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import AutomationsColumns from '@/pages/Automations/AutomationsColumns';
import AutomationEditionDrawer from '@/pages/Automations/components/Drawer/AutomationEditionDrawer';
import CronColumns from '@/pages/Automations/CronsColumns';
import { getAutomations } from '@/services/rest/automations';
import { getCrons } from '@/services/rest/cron';
import { InteractionOutlined, LockFilled } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import '@umijs/max';
import { Tabs, TabsProps } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const Automations: React.FC = () => {
  const [currentRow, setCurrentRow] = React.useState<
    API.Automation | undefined
  >();
  const actionRef = React.useRef<ActionType | undefined>(null);
  const [drawerOpened, setDrawerOpened] = React.useState(false);
  const reload = () => {
    actionRef.current?.reload();
  };

  const automationsTabItem: TabsProps['items'] = [
    {
      key: '1',
      label: 'Automations',
      icon: <CarbonIbmEventAutomation />,
      animated: true,
      children: (
        <>
          <ProTable<API.Automation>
            actionRef={actionRef}
            rowKey="name"
            request={getAutomations}
            columns={AutomationsColumns(setCurrentRow, reload, setDrawerOpened)}
            search={false}
            dateFormatter="string"
            toolBarRender={() => [
              <AutomationEditionDrawer
                key={'automation-edit'}
                open={drawerOpened}
                setOpen={setDrawerOpened}
                reload={reload}
                selectedRow={currentRow}
                setSelectedRow={setCurrentRow}
              />,
            ]}
          />
        </>
      ),
    },
    {
      key: '2',
      label: 'System Automations',
      icon: <LockFilled />,
      animated: true,
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
  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Automations'}
            backgroundColor={TitleColors.CRONS}
            icon={<InteractionOutlined />}
          />
        ),
      }}
      tabList={automationsTabItem}
    />
  );
};
export default Automations;
