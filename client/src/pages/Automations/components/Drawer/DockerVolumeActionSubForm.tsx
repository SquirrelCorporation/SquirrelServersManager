import { BackupSolid } from '@/components/Icons/CustomIcons';
import { getVolumes } from '@/services/rest/services';
import { CheckCircleFilled } from '@ant-design/icons';
import { ProFormSelect } from '@ant-design/pro-components';
import { Space } from 'antd';
import React from 'react';
import { API, SsmContainer } from 'ssm-shared-lib';

const options = [
  {
    label: 'Backup',
    value: SsmContainer.VolumeActions.BACKUP,
    icon: <BackupSolid />,
  },
];

const DockerVolumeActionSubForm: React.FC = () => {
  return (
    <>
      <ProFormSelect.SearchSelect
        name="dockerVolumeAction"
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
        name="dockerVolumes"
        placeholder={'Select at least one volume'}
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
          return getVolumes().then((response) => {
            return response.data.map((e: API.ContainerVolume) => {
              return {
                label: `${e.name} (${e.device?.ip})`,
                value: e.uuid,
              };
            });
          });
        }}
      />
    </>
  );
};

export default DockerVolumeActionSubForm;
