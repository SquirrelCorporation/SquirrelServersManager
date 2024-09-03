import { InputIcon } from '@/components/Icons/CustomIcons';
import ExtraVarIcon, {
  getExtraVarTooltipTitle,
} from '@/components/PlaybookSelection/ExtraVarIcon';
import {
  ArrowUpOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Popconfirm, PopconfirmProps, Space, Tag, Tooltip } from 'antd';
import React from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';

type ExtraVarViewProps = {
  extraVar: API.ExtraVar;
  setOverrideExtraVars: any;
  overrideExtraVars: any;
  smallView?: boolean;
};

const isButtonDisabled = (
  type?: SsmAnsible.ExtraVarsType,
  extraVarValue?: string,
) =>
  type !== SsmAnsible.ExtraVarsType.SHARED ||
  (type === SsmAnsible.ExtraVarsType.SHARED &&
    (extraVarValue === undefined ||
      extraVarValue === '' ||
      extraVarValue === 'AUTO'));

const ExtraVarView: React.FC<ExtraVarViewProps> = ({
  extraVar,
  setOverrideExtraVars,
  overrideExtraVars,
  smallView = false,
}) => {
  const [currentValue, setCurrentValue] = React.useState(
    extraVar.value ||
      (extraVar.type !== SsmAnsible.ExtraVarsType.MANUAL ? 'AUTO' : ''),
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setOverrideExtraVars((prevState: any[]) =>
      prevState.map((e) =>
        e.overrideVar === extraVar.extraVar
          ? { ...e, value: event.target.value }
          : e,
      ),
    );
    setCurrentValue(event.target.value);
  };

  const getPlaceholder = () => {
    if (extraVar.type === SsmAnsible.ExtraVarsType.MANUAL) {
      return extraVar.required ? 'Please enter' : '(Optional)';
    }
    return 'AUTO';
  };

  const confirm: PopconfirmProps['onConfirm'] = (e) => {
    console.log(e);
  };

  const OverwriteButton = ({ extraVarValue }: { extraVarValue?: string }) => (
    <Popconfirm
      title="Overwrite the variable"
      description="Are you sure to overwrite this variable?"
      onConfirm={confirm}
      okText="Yes"
      cancelText="No"
    >
      <Button
        disabled={isButtonDisabled(extraVar.type, extraVarValue)}
        style={{ marginTop: 0 }}
        icon={<ArrowUpOutlined />}
        danger
      >
        Overwrite
      </Button>
    </Popconfirm>
  );

  return (
    <Space direction="horizontal" align="center" key={extraVar.extraVar}>
      <ProForm.Item
        style={{ width: smallView ? undefined : 140 }}
        key={`${extraVar.extraVar}-form-item`}
      >
        <Tooltip
          title={getExtraVarTooltipTitle(
            extraVar.type as SsmAnsible.ExtraVarsType,
            true,
          )}
        >
          <Tag
            bordered={true}
            icon={
              <ExtraVarIcon
                extraVarType={extraVar.type as SsmAnsible.ExtraVarsType}
              />
            }
          >
            {!smallView && <>{extraVar.type} VAR</>}
          </Tag>
        </Tooltip>
      </ProForm.Item>
      <ProFormText
        name={['extraVars', extraVar.extraVar]}
        disabled
        fieldProps={{ value: extraVar.extraVar }}
        rules={[{ required: false }]}
      />
      <ProFormText
        name={['extraVars', extraVar.extraVar, 'value']}
        disabled={extraVar.type === SsmAnsible.ExtraVarsType.CONTEXT}
        placeholder={getPlaceholder()}
        rules={[
          {
            required:
              extraVar.type === SsmAnsible.ExtraVarsType.MANUAL &&
              extraVar.required,
          },
        ]}
        fieldProps={{
          onChange: handleChange,
          value: currentValue,
          prefix:
            extraVar.type === SsmAnsible.ExtraVarsType.CONTEXT ? (
              <LockOutlined />
            ) : extraVar.type === SsmAnsible.ExtraVarsType.SHARED ? (
              <UnlockOutlined />
            ) : (
              <InputIcon />
            ),
          defaultValue:
            extraVar.value ||
            (extraVar.type !== SsmAnsible.ExtraVarsType.MANUAL ? 'AUTO' : ''),
        }}
      />
      {!smallView && (
        <ProForm.Item>
          {extraVar.type === SsmAnsible.ExtraVarsType.SHARED ? (
            <Tooltip title="Overwrite the value in the database. It will modify the value for all the playbooks.">
              <OverwriteButton extraVarValue={currentValue} />
            </Tooltip>
          ) : (
            <OverwriteButton extraVarValue={currentValue} />
          )}
        </ProForm.Item>
      )}
    </Space>
  );
};

export default ExtraVarView;
