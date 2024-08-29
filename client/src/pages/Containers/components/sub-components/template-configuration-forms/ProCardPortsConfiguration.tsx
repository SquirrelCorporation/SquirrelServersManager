import { PortInput } from '@/components/Icons/CustomIcons';
import { Template } from '@/pages/Containers/components/sub-components/ContainerStartModal';
import {
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormList,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Space } from 'antd';
import React from 'react';

const ProCardPortsConfiguration: React.FC<{ template: Template }> = (props) => {
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
          initialValue={props.template?.ports?.map((e) => {
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
