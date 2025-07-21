import { More } from '@/components/Icons/CustomIcons';
import {
  ProCard,
  ProForm,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import React from 'react';
import { API } from 'ssm-shared-lib';

type ProCardExtrasConfigurationProps = {
  template: API.Template;
};

const ProCardExtrasConfiguration: React.FC<ProCardExtrasConfigurationProps> = ({
  template,
}) => {
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
          initialValue={template.command}
        />
        <ProFormSwitch
          name="privileged"
          label="Privileged Mode"
          initialValue={template.privileged}
        />
      </ProForm.Group>
    </ProCard>
  );
};

export default ProCardExtrasConfiguration;
