import { Env } from '@shared/ui/icons/categories/containers';
import {
  ProCard,
  ProForm,
  ProFormList,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type ProCardEnvironmentConfigurationProps = {
  template: API.Template;
};

const ProCardEnvironmentConfiguration: React.FC<
  ProCardEnvironmentConfigurationProps
> = ({ template }) => {
  return (
    <ProCard
      title={
        <>
          <Env /> Environment
        </>
      }
      direction="column"
      collapsible
      size={'small'}
      defaultCollapsed
    >
      <ProForm.Group>
        <ProFormList
          name="env"
          creatorButtonProps={{
            creatorButtonText: 'Add a new env',
          }}
          copyIconProps={false}
          initialValue={template?.env?.map((e) => {
            return {
              name: e.name,
              label: e.label,
              default: e.default,
              preset: e.preset,
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
                addonBefore: 'label',
              }}
              name="label"
            />
            <ProFormText
              fieldProps={{
                addonBefore: 'default',
              }}
              name="default"
            />
            <ProFormSwitch
              name="preset"
              fieldProps={{
                checkedChildren: 'preset',
                unCheckedChildren: 'preset',
                size: 'small',
              }}
            />
          </Space>
        </ProFormList>
      </ProForm.Group>
    </ProCard>
  );
};

export default ProCardEnvironmentConfiguration;
