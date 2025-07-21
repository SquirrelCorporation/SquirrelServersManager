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
import { TabsProps, ConfigProvider, theme } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';
import styled from 'styled-components';
import StyledTabContainer, {
  TabLabel,
  IconWrapper,
} from '@/components/Layout/StyledTabContainer';
import InfoLinkWidget from '@/components/Shared/InfoLinkWidget';

const Automations: React.FC = () => {
  const [currentRow, setCurrentRow] = useState<API.Automation | undefined>();
  const actionRef = useRef<ActionType | undefined>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const location = useLocation();
  const { darkAlgorithm } = theme;

  const reload = () => {
    actionRef.current?.reload();
  };

  const automationsTabItems: TabsProps['items'] = [
    {
      key: 'automations',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #32D74B, #27AE60)">
            <CarbonIbmEventAutomation />
          </IconWrapper>
          Automations
        </TabLabel>
      ),
      children: (
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
            <InfoLinkWidget
              tooltipTitle="Help for automations."
              documentationLink="https://squirrelserversmanager.io/docs/user-guides/automations/overview"
            />,
          ]}
        />
      ),
    },
    {
      key: 'system-automations',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #FF375F, #E31B4E)">
            <LockFilled />
          </IconWrapper>
          System Automations
        </TabLabel>
      ),
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
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        components: {
          Tabs: {
            itemSelectedColor: '#fff',
            itemHoverColor: 'rgba(255, 255, 255, 0.85)',
            inkBarColor: 'transparent',
          },
        },
      }}
    >
      <StyledTabContainer
        tabItems={automationsTabItems}
      />
    </ConfigProvider>
  );
};

export default Automations;
