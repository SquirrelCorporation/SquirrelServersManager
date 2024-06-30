import React, { useEffect } from 'react';
import { Button, Collapse, message, Tooltip } from 'antd';
import { API } from 'ssm-shared-lib';
import { PlusOutlined } from '@ant-design/icons';
import { ProForm } from '@ant-design/pro-form/lib';
import {
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
  RequestOptionsType,
} from '@ant-design/pro-components';
import {
  deletePlaybookExtraVar,
  getPlaybooks,
  postExtraVarValue,
  postPlaybookExtraVar,
} from '@/services/rest/playbooks';

export type ExtraVarsViewEditionProps = {
  playbook: API.PlaybookFile;
};

const ExtraVarsViewEditor: React.FC<ExtraVarsViewEditionProps> = (
  extraVarViewEditorProps,
) => {
  const [currentExtraVars, setCurrentExtraVars] = React.useState(
    extraVarViewEditorProps.playbook?.extraVars || [],
  );
  const [isOpened, setIsOpened] = React.useState(false);
  const [showCreateNewVarForm, setShowCreateNewVarForm] = React.useState(false);
  const onChange = (key: string | string[]) => {
    setIsOpened(key !== undefined && key[0] != undefined);
  };
  const handleRemove = async (extraVarName: string) => {
    await deletePlaybookExtraVar(
      extraVarViewEditorProps.playbook.uuid,
      extraVarName,
    );
    setCurrentExtraVars(
      currentExtraVars?.filter((e) => e.extraVar !== extraVarName),
    );
  };
  useEffect(() => {
    setCurrentExtraVars(extraVarViewEditorProps.playbook?.extraVars || []);
    setIsOpened(false);
  }, [extraVarViewEditorProps.playbook]);
  return (
    <>
      <Collapse
        key={extraVarViewEditorProps.playbook.path}
        bordered={false}
        style={{ width: '100%', marginBottom: 10 }}
        size="small"
        onChange={onChange}
        items={[
          {
            key: '1',
            label: 'Configuration',
            extra: isOpened && (
              <Tooltip title={'Add ExtraVar'}>
                <Button
                  onClick={(event) => {
                    // If you don't want click extra trigger collapse, you can prevent this:
                    event.stopPropagation();
                    setShowCreateNewVarForm(true);
                  }}
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined />}
                />
              </Tooltip>
            ),
            children: (
              <>
                {currentExtraVars?.map((extraVar) => (
                  <ProForm
                    key={`create-new-var`}
                    style={{ marginTop: 10 }}
                    layout={'inline'}
                    onFinish={async (formData) => {
                      await postExtraVarValue(
                        formData.extraVarName,
                        formData.extraVarValue,
                      );
                      message.success({
                        content: 'Value updated',
                        duration: 6,
                      });
                    }}
                    submitter={{
                      // Configure the button text
                      searchConfig: {
                        resetText: 'reset',
                        submitText: 'save',
                      },
                      submitButtonProps: {},
                      // Fully customize the entire area
                      render: (props) => {
                        return [
                          <Button
                            type={'primary'}
                            key="submit"
                            disabled={!extraVar.canBeOverride}
                            onClick={() => props.form?.submit?.()}
                          >
                            Save
                          </Button>,
                          <Button
                            key="delete"
                            type="primary"
                            danger
                            onClick={() => handleRemove(extraVar.extraVar)}
                          >
                            Delete
                          </Button>,
                        ];
                      },
                    }}
                  >
                    <ProForm.Group>
                      <ProFormText
                        disabled
                        initialValue={extraVar.extraVar}
                        name={`extraVarName`}
                      />

                      <ProFormText
                        disabled={!extraVar.canBeOverride}
                        name={`extraVarValue`}
                        initialValue={
                          extraVar.value ||
                          (extraVar.canBeOverride ? '' : 'COMPUTED AT RUN')
                        }
                      />
                    </ProForm.Group>
                  </ProForm>
                ))}
                {showCreateNewVarForm && (
                  <ProForm
                    key={`create-new-var`}
                    style={{ marginTop: 10 }}
                    onFinish={async (formData) => {
                      const newExtraVar = {
                        extraVar: formData.extraVarName.value,
                        value: formData.extraVarValue,
                        canBeOverride:
                          (formData.extraVarOps &&
                            formData.extraVarOps[0] === 'Authorize override') ||
                          true,
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
                        resetText: 'reset',
                        submitText: 'create',
                      },
                      submitButtonProps: {},
                      // Fully customize the entire area
                      render: (props) => {
                        return [
                          <Button
                            key="rest"
                            onClick={() => props.form?.resetFields()}
                          >
                            Reset
                          </Button>,
                          <Button
                            type={'primary'}
                            key="submit"
                            onClick={() => props.form?.submit?.()}
                          >
                            Submit
                          </Button>,
                          <Button
                            key="delete"
                            type="primary"
                            danger
                            onClick={() => setShowCreateNewVarForm(false)}
                          >
                            Delete
                          </Button>,
                        ];
                      },
                    }}
                  >
                    <ProForm.Group>
                      <ProFormSelect.SearchSelect
                        name={'extraVarName'}
                        label="Select or create a var"
                        placeholder="Name"
                        fieldProps={{
                          labelInValue: true,
                          style: {
                            minWidth: 240,
                          },
                          mode: undefined,
                        }}
                        onChange={() => {}}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter or select a var name',
                          },
                          {
                            validator(_, value) {
                              if (
                                currentExtraVars?.findIndex(
                                  (e) => e.extraVar === value.value + 'r',
                                ) === -1
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject('Var name already exists');
                            },
                          },
                        ]}
                        debounceTime={300}
                        request={async ({ keyWords = '' }) => {
                          return (await getPlaybooks()
                            .then((e) => {
                              const result = e.data
                                ?.filter(({ extraVars }) => {
                                  return extraVars?.filter((extraVar) => {
                                    return extraVar.extraVar?.includes(
                                      keyWords,
                                    );
                                  });
                                })
                                .map((f) => {
                                  return f?.extraVars?.map((g) => {
                                    return {
                                      label: g.extraVar,
                                      value: g.extraVar,
                                    };
                                  });
                                })
                                .flat();
                              if (keyWords !== '') {
                                result?.push({
                                  // @ts-ignore
                                  label: <i> {keyWords} </i>,
                                  value: keyWords,
                                });
                              }
                              return result;
                            })
                            .catch((error) => {
                              message.error({
                                content: `Error retrieving playbooks list (${error.message})`,
                                duration: 6,
                              });
                              return [];
                            })) as RequestOptionsType[];
                        }}
                      />
                      <ProFormText
                        name={'extraVarValue'}
                        label="Set the value"
                        placeholder="Value"
                        rules={[{ required: true }]}
                      />
                      <ProFormCheckbox.Group
                        name="extraVarOps"
                        options={['Authorize override']}
                      />
                    </ProForm.Group>
                  </ProForm>
                )}
              </>
            ),
          },
        ]}
      />
    </>
  );
};

export default ExtraVarsViewEditor;
