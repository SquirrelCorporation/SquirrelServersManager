import NetworkTypes from '@/pages/Containers/components/sub-components/deploy-configuration-forms/NetworkTypes';
import { BarsOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import React from 'react';
import { API } from 'ssm-shared-lib';

const ProCardGeneralConfiguration: React.FC<{ template: API.Template }> = (
  props,
) => {
  return (
    <ProCard
      title={
        <>
          <BarsOutlined /> General
        </>
      }
      direction="column"
      collapsible
      defaultCollapsed
      size={'small'}
    >
      <ProForm.Group direction={'horizontal'}>
        <ProFormText
          name="name"
          label="Name"
          initialValue={props.template.name}
          rules={[{ required: true }]}
        />
        <ProFormSelect
          name="restart_policy"
          label="Restart Policy"
          initialValue={props.template.restart_policy}
          options={[
            { label: 'unless-stopped', value: 'unless-stopped' },
            { label: 'on-failure', value: 'on-failure' },
            { label: 'always', value: 'always' },
            { label: 'never', value: 'never' },
          ]}
        />
      </ProForm.Group>
      <ProForm.Item
        name="network"
        label="Network Mode"
        style={{ height: '100%' }}
      >
        <NetworkTypes network={props.template.network} />
      </ProForm.Item>
    </ProCard>
  );
};

export default ProCardGeneralConfiguration;
