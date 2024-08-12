import { More } from '@/components/Icons/CustomIcons';
import {
  ProCard,
  ProForm,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import React from 'react';
import { API } from 'ssm-shared-lib';

const ProCardExtrasConfiguration: React.FC<{ template: API.Template }> = (
  props,
) => {
  return (
    <ProCard
      title={
        <>
          <More /> Extras
        </>
      }
      direction="column"
      collapsible
      defaultCollapsed
      size={'small'}
    >
      <ProForm.Group direction={'horizontal'}>
        <ProFormText
          width={'lg'}
          name="command"
          label="Command"
          initialValue={props.template.command}
        />
        <ProFormSwitch
          name="privileged"
          label="Privileged Mode"
          initialValue={props.template.privileged}
        />
      </ProForm.Group>
    </ProCard>
  );
};

export default ProCardExtrasConfiguration;
