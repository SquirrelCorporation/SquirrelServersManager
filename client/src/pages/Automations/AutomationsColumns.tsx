import { CarbonIbmEventAutomation } from '@/components/Icons/CustomIcons';
import AutomationQuickAction from '@/pages/Automations/components/AutomationQuickAction';
import {
  ClockCircleFilled,
  DockerOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { Avatar, Tooltip } from 'antd';
import React from 'react';
import { API, Automations } from 'ssm-shared-lib';

const AutomationsColumns = (
  setCurrentRow: React.Dispatch<
    React.SetStateAction<API.Automation | undefined>
  >,
  reload: () => void,
  setDrawerOpened: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const columns: ProColumns<API.Automation>[] = [
    {
      align: 'center',
      render: (_, row) => (
        <div style={{ width: '100%' }}>
          <Avatar
            style={{
              backgroundColor: '#523f85',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
            icon={<CarbonIbmEventAutomation />}
          />{' '}
          {row.automationChains.trigger === Automations.Triggers.CRON && (
            <Tooltip title={row.automationChains.cronValue} placement="top">
              <Avatar
                size={'small'}
                style={{
                  backgroundColor: '#4c4c4e',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                icon={<ClockCircleFilled />}
              />
            </Tooltip>
          )}{' '}
          {row.automationChains.actions?.map((e) => {
            return (
              <>
                {e.action === Automations.Actions.PLAYBOOK && (
                  <Tooltip title={`${e.playbook}`} placement="top">
                    <Avatar
                      size={'small'}
                      style={{
                        backgroundColor: '#4c4c4e',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}
                      icon={<FileOutlined />}
                    />
                  </Tooltip>
                )}
                {e.action === Automations.Actions.DOCKER && (
                  <Tooltip title={`${e.dockerAction}`} placement="top">
                    <Avatar
                      size={'small'}
                      style={{
                        backgroundColor: '#4c4c4e',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}
                      icon={<DockerOutlined />}
                    />
                  </Tooltip>
                )}
              </>
            );
          })}
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
