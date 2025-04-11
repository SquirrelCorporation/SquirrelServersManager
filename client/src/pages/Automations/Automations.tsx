import { CarbonIbmEventAutomation } from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import AutomationsColumns from '@/pages/Automations/AutomationsColumns';
import AutomationEditionDrawer from '@/pages/Automations/components/Drawer/AutomationEditionDrawer';
import CronColumns from '@/pages/Automations/CronsColumns';
import { getAutomations } from '@/services/rest/automations/automations';
import { getCrons } from '@/services/rest/scheduler/scheduler';
import { InteractionOutlined, LockFilled } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import '@umijs/max';
import { history, useLocation } from '@umijs/max';
import { TabsProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';

const Automations: React.FC = () => {
  const [currentRow, setCurrentRow] = useState<API.Automation | undefined>();
  const actionRef = useRef<ActionType | undefined>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const location = useLocation();

  const reload = () => {
    actionRef.current?.reload();
  };

  const automationsTabItems: TabsProps['items'] = [
    {
      key: 'automations',
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
      key: 'system-automations',
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

  // Function to handle tab change
  const handleTabChange = (key: string) => {
    history.replace(`#${key}`);
  };

  // Sync active tab with the hash in the URL
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!automationsTabItems.some((item) => item.key === hash)) return;
    // Sync the initially selected tab with the hash in the URL
    handleTabChange(hash);
  }, [location.hash]);

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
      tabList={automationsTabItems}
      onTabChange={handleTabChange}
      tabActiveKey={
        location.hash.replace('#', '') || automationsTabItems[0].key
      }
    />
  );
};

export default Automations;
