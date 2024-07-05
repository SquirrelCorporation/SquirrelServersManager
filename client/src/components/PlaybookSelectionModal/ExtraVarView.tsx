import React from 'react';
import { Button } from 'antd';
import { API } from 'ssm-shared-lib';
import { ProForm, ProFormText } from '@ant-design/pro-components';

export type ExtraVarViewProps = {
  extraVar: API.ExtraVar;
  setOverrideExtraVars: any;
  overrideExtraVars: any;
};

const ExtraVarView: React.FC<ExtraVarViewProps> = (props) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    props.setOverrideExtraVars((prevState: any[]) =>
      prevState.map((e) => {
        if (e.overrideVar === props.extraVar.extraVar) {
          return {
            overrideVar: e.overrideVar,
            value: event.target.value,
          };
        } else {
          return e;
        }
      }),
    );
  };
  return (
    <ProForm.Group>
      <ProFormText
        disabled
        fieldProps={{ value: props.extraVar.extraVar }}
        colProps={{ md: 12, xl: 8 }}
      />
      <ProFormText
        colProps={{ md: 12, xl: 8 }}
        disabled={!props.extraVar.canBeOverride}
        fieldProps={{
          onChange: handleChange,
          defaultValue:
            props.extraVar.value ||
            (!props.extraVar.canBeOverride ? '' : 'COMPUTED'),
        }}
      />
      <Button disabled={!props.extraVar.canBeOverride}>
        Save for future execution
      </Button>
    </ProForm.Group>
  );
};

export default ExtraVarView;
