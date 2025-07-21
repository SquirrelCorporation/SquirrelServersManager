import { Label } from '@/components/Icons/CustomIcons';
import {
  ProCard,
  ProForm,
  ProFormList,
  ProFormText,
} from '@ant-design/pro-components';
import { Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type ProCardLabelsConfigurationProps = {
  template: API.Template;
};

const ProCardLabelsConfiguration: React.FC<ProCardLabelsConfigurationProps> = ({
  template,
}) => {
  return (
    <ProCard
      title={
        <>
          <Label /> Labels
        </>
      }
      direction="column"
      collapsible
      size={'small'}
      defaultCollapsed
    >
      <ProForm.Group>
        <ProFormList
          name="labels"
          creatorButtonProps={{
            creatorButtonText: 'Add a new label',
          }}
          copyIconProps={false}
          initialValue={template?.labels?.map((e) => {
            return {
              name: e.name,
              value: e.value,
            };
          })}
        >
          <Space direction={'horizontal'}>
            <ProFormText
              fieldProps={{
                addonBefore: 'name',
              }}
              name="name"
            />
            <ProFormText
              fieldProps={{
                addonBefore: 'value',
              }}
              name="value"
            />
          </Space>
        </ProFormList>
      </ProForm.Group>
    </ProCard>
  );
};

export default ProCardLabelsConfiguration;
