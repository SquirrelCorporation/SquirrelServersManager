import React from 'react';
import { Button, Col, Collapse, Input, Row, Tooltip } from 'antd';
import { API } from 'ssm-shared-lib';
import { PlusOutlined } from '@ant-design/icons';
import { ProForm } from '@ant-design/pro-form/lib';
import { ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { postPlaybookExtraVars } from '@/services/rest/ansible';

export type ExtraVarsViewEditionProps = {
  playbook: API.PlaybookFileList;
};

const ExtraVarsViewEdition: React.FC<ExtraVarsViewEditionProps> = (props) => {
  const [extraVars, setExtraVars] = React.useState(
    props.playbook?.extraVars || [],
  );
  const [isOpened, setIsOpened] = React.useState(false);
  const [showCreateNewVarForm, setShowCreateNewVarForm] = React.useState(false);
  const onChange = (key: string | string[]) => {
    setIsOpened(key !== undefined && key[0] != undefined);
  };
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {};
  return (
    <>
      <Collapse
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
                {extraVars?.map((extraVar) => (
                  <Row
                    gutter={[24, 24]}
                    style={{ marginTop: 5, width: '100%' }}
                    key={extraVar.extraVar}
                  >
                    <Col>
                      <Input disabled value={extraVar.extraVar} />
                    </Col>
                    <Col>
                      <Input
                        disabled={!extraVar.canBeOverride}
                        onChange={handleChange}
                        defaultValue={
                          extraVar.value ||
                          (extraVar.canBeOverride ? '' : 'COMPUTED AT RUN')
                        }
                      />
                    </Col>
                    <Col>
                      <Button type="primary" disabled={!extraVar.canBeOverride}>
                        Save
                      </Button>
                    </Col>
                    <Col>
                      <Button type="primary" danger>
                        Delete
                      </Button>
                    </Col>
                  </Row>
                ))}
                {showCreateNewVarForm && (
                  <ProForm
                    key={`create-new-var`}
                    style={{ marginTop: 10 }}
                    onFinish={async (formData) => {
                      await postPlaybookExtraVars(props.playbook?.value, [
                        ...extraVars,
                        {
                          extraVar: formData.extraVarName,
                          value: formData.extraVarValue,
                          canBeOverride: formData.extraVarOps,
                        },
                      ]);
                      return true;
                    }}
                    submitter={{
                      // Configure the button text
                      searchConfig: {
                        resetText: 'reset',
                        submitText: 'submit',
                      },
                      // Configure the properties of the button
                      resetButtonProps: {
                        style: {
                          // Hide the reset button
                          display: 'none',
                        },
                      },
                      submitButtonProps: {},
                      // Fully customize the entire area
                      render: (props, doms) => {
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
                          <Button key="delete" type="primary" danger>
                            Delete
                          </Button>,
                        ];
                      },
                    }}
                  >
                    <ProForm.Group>
                      <ProFormText name={'extraVarName'} placeholder="Name" />

                      <ProFormText name={'extraVarValue'} placeholder="Value" />
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

export default ExtraVarsViewEdition;
