import { VolumeBinding } from '@/components/Icons/CustomIcons';
import { Template } from '@/pages/Services/components/sub-components/ContainerStartModal';
import {
  ProCard,
  ProForm,
  ProFormList,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Space } from 'antd';
import React from 'react';

const ProCardVolumesConfiguration: React.FC<{ template: Template }> = (
  props,
) => {
  return (
    <ProCard
      title={
        <>
          <VolumeBinding /> Volumes
        </>
      }
      direction="column"
      collapsible
      size={'small'}
      defaultCollapsed
    >
      <ProForm.Group>
        <ProFormList
          name="volumes"
          creatorButtonProps={{
            creatorButtonText: 'Add a new volume',
          }}
          copyIconProps={false}
          initialValue={props.template?.volumes?.map((e) => {
            return {
              bind: e.bind,
              container: e.container,
              mode: e.mode,
              readonly: e.readonly,
            };
          })}
        >
          <Space direction={'horizontal'}>
            <ProFormText
              fieldProps={{
                addonBefore: 'bind',
              }}
              name="bind"
            />
            <ProFormText
              fieldProps={{
                addonBefore: 'container',
              }}
              name="container"
            />
            <ProFormText
              fieldProps={{
                addonBefore: 'mode',
              }}
              name="mode"
            />
            <ProFormSwitch
              name="readonly"
              fieldProps={{
                checkedChildren: 'readonly',
                unCheckedChildren: 'Readonly',
                size: 'small',
              }}
            />
          </Space>
        </ProFormList>
      </ProForm.Group>
    </ProCard>
  );
};
export default ProCardVolumesConfiguration;
