import React from 'react';
import { Button, Space, Typography } from 'antd';
import { API } from 'ssm-shared-lib';
import { ProForm, ProFormText } from '@ant-design/pro-components';

export type ExtraVarViewProps = {
  extraVar: API.ExtraVar;
  setOverrideExtraVars: any;
  overrideExtraVars: any;
  smallView?: boolean;
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
    <Space direction="horizontal" align={'center'}>
      <ProFormText disabled fieldProps={{ value: props.extraVar.extraVar }} />
      <ProFormText
        disabled={!props.extraVar.canBeOverride}
        placeholder={
          !props.extraVar.canBeOverride ? 'COMPUTED' : 'Please enter'
        }
        fieldProps={{
          onChange: handleChange,
          defaultValue:
            props.extraVar.value ||
            (!props.extraVar.canBeOverride ? '' : 'COMPUTED'),
        }}
      />
      <ProForm.Item>
        <Button
          disabled={!props.extraVar.canBeOverride}
          style={{ marginTop: 0 }}
        >
          <Typography.Text
            ellipsis
            style={props.smallView ? { width: 50 } : {}}
          >
            {' '}
            Save for future execution
          </Typography.Text>
        </Button>
      </ProForm.Item>
    </Space>
  );
};

export default ExtraVarView;
