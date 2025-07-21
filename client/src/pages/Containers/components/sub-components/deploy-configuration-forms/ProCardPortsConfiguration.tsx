import { PortInput } from '@/components/Icons/CustomIcons';
import {
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormList,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type ProCardPortsConfigurationProps = {
  template: API.Template;
};

const ProCardPortsConfiguration: React.FC<ProCardPortsConfigurationProps> = ({
  template,
}) => {
  return (
    <ProCard
      title={
        <>
          <PortInput /> Ports
        </>
      }
      direction="column"
      collapsible
      size={'small'}
      defaultCollapsed
    >
      <ProForm.Group>
        <ProFormList
          name="ports"
          creatorButtonProps={{
            creatorButtonText: 'Add a new port',
          }}
          copyIconProps={false}
          initialValue={template?.ports?.map((e) => {
            return {
              host: e.host,
              protocol: e.protocol,
              container: e.container,
            };
          })}
        >
          <Space direction={'horizontal'}>
            <ProFormDigit
              width="sm"
              fieldProps={{
                addonBefore: 'host',
              }}
              name="host"
            />
            <ProFormDigit
              width="sm"
              fieldProps={{
                addonBefore: 'container',
              }}
              name="container"
            />
            <ProFormSelect
              width="sm"
              options={[
                { label: 'UDP', value: 'udp' },
                { label: 'TCP', value: 'tcp' },
              ]}
              name="protocol"
            />
          </Space>
        </ProFormList>
      </ProForm.Group>
    </ProCard>
  );
};

export default ProCardPortsConfiguration;
