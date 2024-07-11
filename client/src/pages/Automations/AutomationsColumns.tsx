import { CarbonIbmEventAutomation } from '@/components/Icons/CustomIcons';
import AutomationQuickAction from '@/pages/Automations/components/AutomationQuickAction';
import { ProColumns } from '@ant-design/pro-components';
import { Avatar } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

const AutomationsColumns = (
  setCurrentRow: any,
  reload: () => void,
  setDrawerOpened: any,
) => {
  const columns: ProColumns<API.Automation>[] = [
    {
      align: 'center',
      render: () => (
        <div style={{ width: '100%' }}>
          <Avatar
            style={{
              backgroundColor: '#523f85',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            icon={<CarbonIbmEventAutomation />}
          />{' '}
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Last Execution Time',
      dataIndex: 'lastExecutionTime',
      valueType: 'dateTime',
    },
    {
      title: 'Last Execution Status',
      dataIndex: 'lastExecutionStatus',
      valueEnum: {
        failed: {
          text: 'On error',
          status: 'Error',
        },
        success: {
          text: 'Success',
          status: 'Success',
        },
      },
    },
    {
      title: 'Action',
      dataIndex: 'option',
      valueType: 'option',
      hideInSearch: true,
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            setCurrentRow(record);
            setDrawerOpened(true);
          }}
        >
          Configuration
        </a>,
        <a key="quickAction">
          <AutomationQuickAction record={record} reload={reload} />
        </a>,
      ],
    },
  ];
  return columns;
};

export default AutomationsColumns;
