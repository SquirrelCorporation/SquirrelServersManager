import ExtraVarIcon, {
  getExtraVarTooltipTitle,
} from '@/components/PlaybookSelection/ExtraVarIcon';
import { ExtraVarsViewEditionProps } from '@/pages/Playbooks/components/ExtraVarsViewEditor';
import { getPlaybooks, postPlaybookExtraVar } from '@/services/rest/playbooks/playbooks';
import { ProFormDependency } from '@ant-design/pro-components';
import {
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import message from '@/components/Message/DynamicMessage';
import { Button, Col, Row, Select, Space, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';

export type CreateNewVarFormProps = {
  extraVarViewEditorProps: ExtraVarsViewEditionProps;
  setShowCreateNewVarForm: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentExtraVars: React.Dispatch<React.SetStateAction<API.ExtraVars>>;
  currentExtraVars: API.ExtraVars;
};

const asyncFetch = async (): Promise<any> => {
  return await getPlaybooks()
    .then((response) => {
      const { data } = response;
      const result = data
        ?.flatMap((f) =>
          f.extraVars?.map((g) => ({
            value: g.extraVar,
            type: g.type,
          })),
        )
        ?.filter((e) => e?.value !== undefined);

      // Use a Map to remove duplicates by the 'value' property
      return result
        ? Array.from(
            new Map(result.map((item) => [item?.value, item])).values(),
          )
        : [];
    })
    .catch((error) => {
      message.error({
        content: `Error retrieving playbooks list (${error.message})`,
        duration: 6,
      });
      return [];
    });
};
const CreateNewVarForm: React.FC<CreateNewVarFormProps> = ({
  extraVarViewEditorProps,
  setShowCreateNewVarForm,
  setCurrentExtraVars,
  currentExtraVars,
}) => {
  const [listOfPreExistingVariables, setListOfPreExistingVariables] =
    React.useState<any>();
  const [selectedVarType, setSelectedVarType] = React.useState<
    undefined | SsmAnsible.ExtraVarsType
  >();
  const [options, setOptions] = React.useState();
  const [customVar, setCustomVar] = React.useState<string | null>(null);

  useEffect(() => {
    asyncFetch().then((e) => {
      setListOfPreExistingVariables(e);
    });
  }, []);

  useEffect(() => {
    setOptions(
      listOfPreExistingVariables?.filter(
        (v: API.ExtraVar) => v.type === selectedVarType,
      ),
    );
  }, [selectedVarType]);

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ProForm
            key={`create-new-var`}
            style={{ marginTop: 10 }}
            grid
            onFinish={async (formData) => {
              const newExtraVar = {
                extraVar: formData.extraVarName.value,
                value: formData.extraVarValue,
                type: formData.extraVarType.value,
                required: formData.extraVarRequired,
              };
              await postPlaybookExtraVar(
                extraVarViewEditorProps.playbook?.uuid,
                newExtraVar,
              );
              setShowCreateNewVarForm(false);
              setCurrentExtraVars([...currentExtraVars, newExtraVar]);
              return true;
            }}
            submitter={{
              // Configure the button text
              searchConfig: {
                resetText: 'Reset',
                submitText: 'Create',
              },
              submitButtonProps: {},
              // Fully customize the entire area
              render: (props) => (
                <Space size="middle">
                  <Button key="reset" onClick={() => props.form?.resetFields()}>
                    Reset
                  </Button>
                  <Button
                    type="primary"
                    key="submit"
                    onClick={() => props.form?.submit?.()}
                  >
                    Submit
                  </Button>
                  <Button
                    key="delete"
                    type="primary"
                    danger
                    onClick={() => setShowCreateNewVarForm(false)}
                  >
                    Delete
                  </Button>
                </Space>
              ),
            }}
          >
            <ProForm.Group>
              <Space
                size="small"
                direction="horizontal"
                style={{ width: '100%' }}
              >
                <ProFormSelect
                  label="Type"
                  name="extraVarType"
                  options={Object.values(SsmAnsible.ExtraVarsType).map((e) => ({
                    value: e,
                  }))}
                  fieldProps={{
                    labelInValue: true,
                    optionRender: (option) => (
                      <Tooltip
                        title={getExtraVarTooltipTitle(
                          option.value as SsmAnsible.ExtraVarsType,
                        )}
                      >
                        <Space>
                          <span role="img" aria-label={option.value as string}>
                            <ExtraVarIcon
                              extraVarType={
                                option.value as SsmAnsible.ExtraVarsType
                              }
                            />
                          </span>
                          {option.value}
                        </Space>
                      </Tooltip>
                    ),
                    labelRender: (e) => (
                      <Space size="small">
                        <span role="img" aria-label={e.value as string}>
                          <ExtraVarIcon
                            extraVarType={e.value as SsmAnsible.ExtraVarsType}
                          />
                        </span>
                        {e.value}
                      </Space>
                    ),
                  }}
                  onChange={(option: { value: SsmAnsible.ExtraVarsType }) =>
                    setSelectedVarType(option?.value)
                  }
                  rules={[{ required: true }]}
                />
                <ProFormDependency name={['extraVarType']}>
                  {({ extraVarType }) => (
                    <ProForm.Item
                      name="extraVarName"
                      label={`Select ${
                        extraVarType?.value !== SsmAnsible.ExtraVarsType.CONTEXT
                          ? 'or create'
                          : ''
                      } a variable name`}
                      rules={[
                        {
                          required: true,
                          message: `Please select ${
                            extraVarType?.value !==
                            SsmAnsible.ExtraVarsType.CONTEXT
                              ? 'or create'
                              : ''
                          } a variable name`,
                        },
                        {
                          validator(_: any, value: any) {
                            if (
                              !value ||
                              currentExtraVars.findIndex(
                                (e) => e.extraVar === value.value,
                              ) === -1
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error('Var name already exists'),
                            );
                          },
                        },
                      ]}
                      wrapperCol={{ span: 24 }}
                    >
                      <Select
                        placeholder="Name"
                        labelInValue
                        disabled={!extraVarType}
                        style={{ minWidth: 240 }}
                        allowClear
                        showSearch
                        onBlur={() => setCustomVar(null)}
                        onSearch={(value) => setCustomVar(value)}
                        options={
                          options
                            ? [
                                ...options,
                                ...(customVar &&
                                extraVarType.value !==
                                  SsmAnsible.ExtraVarsType.CONTEXT
                                  ? [{ value: customVar }]
                                  : []),
                              ]
                            : undefined
                        }
                      />
                    </ProForm.Item>
                  )}
                </ProFormDependency>
                <ProFormDependency name={['extraVarType']}>
                  {({ extraVarType }) => (
                    <ProFormText
                      name="extraVarValue"
                      label="Set the value"
                      disabled={
                        extraVarType === undefined ||
                        extraVarType.value ===
                          SsmAnsible.ExtraVarsType.MANUAL ||
                        extraVarType.value === SsmAnsible.ExtraVarsType.CONTEXT
                      }
                      placeholder={
                        !extraVarType
                          ? undefined
                          : extraVarType?.value ===
                              SsmAnsible.ExtraVarsType.MANUAL
                            ? 'MANUAL'
                            : 'AUTO'
                      }
                    />
                  )}
                </ProFormDependency>
                <ProFormCheckbox name="extraVarRequired" label={'Required'} />
              </Space>
            </ProForm.Group>
          </ProForm>
        </div>
      </Col>
    </Row>
  );
};

export default CreateNewVarForm;
