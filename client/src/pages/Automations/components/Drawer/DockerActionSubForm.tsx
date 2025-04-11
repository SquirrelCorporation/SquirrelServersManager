import { getContainers } from '@/services/rest/containers/containers';
import {
  CheckCircleFilled,
  CloseCircleOutlined,
  PauseOutlined,
  PlayCircleFilled,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { ProFormSelect } from '@ant-design/pro-components';
import { Space } from 'antd';
import React from 'react';
import { API, SsmContainer } from 'ssm-shared-lib';

const options = [
  { label: 'Stop', value: SsmContainer.Actions.STOP, icon: <StopOutlined /> },
  {
    label: 'Restart',
    value: SsmContainer.Actions.RESTART,
    icon: <SwapOutlined />,
  },
  {
    label: 'Start',
    value: SsmContainer.Actions.START,
    icon: <PlayCircleFilled />,
  },
  {
    label: 'Kill',
    value: SsmContainer.Actions.KILL,
    icon: <CloseCircleOutlined />,
  },
  {
    label: 'Pause',
    value: SsmContainer.Actions.PAUSE,
    icon: <PauseOutlined />,
  },
];

const DockerActionSubForm: React.FC = () => {
  return (
    <>
      <ProFormSelect.SearchSelect
        name="dockerAction"
        placeholder={'Select an action'}
        fieldProps={{
          menuItemSelectedIcon: <CheckCircleFilled />,
          labelRender: (props) => (
            <Space>
              <span role="img" aria-label={props.label as string}>
                {options.find((option) => option.value === props.value)?.icon}{' '}
              </span>
              {props.label}
            </Space>
          ),
          optionRender: (option) => (
            <Space>
              <span role="img" aria-label={option.data.label as string}>
                {option.data.icon}
              </span>
              {option.data.label}
            </Space>
          ),
          mode: undefined,
          style: {
            minWidth: 240,
          },
        }}
        rules={[{ required: true, message: 'Please select an action!' }]}
        options={options}
      />
      <ProFormSelect.SearchSelect
        name="dockerContainers"
        placeholder={'Select at least one container'}
        fieldProps={{
          menuItemSelectedIcon: <CheckCircleFilled />,
          style: {
            minWidth: 240,
          },
        }}
        rules={[
          { required: true, message: 'Please select at least one container!' },
        ]}
        request={async () => {
          return getContainers().then((response) => {
            return response.data.map((e: API.Container) => {
              return {
                label: `${e.customName || e.name} (${e.device?.ip})`,
                value: e.id,
              };
            });
          });
        }}
      />
    </>
  );
};

export default DockerActionSubForm;
