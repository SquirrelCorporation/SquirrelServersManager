import Title, { TitleColors } from '@/components/Template/Title';
import AutomationsColumns from '@/pages/Automations/AutomationsColumns';
import AutomationEditionDrawer from '@/pages/Automations/components/Drawer/AutomationEditionDrawer';
import CronColumns from '@/pages/Automations/CronsColumns';
import { getAutomations } from '@/services/rest/automations';
import { getCrons } from '@/services/rest/cron';
import { InteractionOutlined } from '@ant-design/icons';
import {
  ActionType,
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import '@umijs/max';
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

  const automationsTabItem = [
    {
      key: '1',
      label: <div>Automations</div>,
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
      label: <div>System Automations</div>,
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
