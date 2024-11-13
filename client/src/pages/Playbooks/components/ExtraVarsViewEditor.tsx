import {
  CheckmarkUnderlineCircle24Regular,
  SelectiveTool,
} from '@/components/Icons/CustomIcons';
import ExtraVarIcon, {
  getExtraVarTooltipTitle,
} from '@/components/PlaybookSelection/ExtraVarIcon';
import CreateNewVarForm from '@/pages/Playbooks/components/CreateNewVarForm';
import {
  deletePlaybookExtraVar,
  postExtraVarSharedValue,
} from '@/services/rest/playbooks';
import { LockOutlined, PlusOutlined, UnlockOutlined } from '@ant-design/icons';
import { ProFormInstance, ProFormText } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import {
  Avatar,
  Button,
  Col,
  Collapse,
  Divider,
  message,
  Row,
  Tag,
  Tooltip,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';

export type ExtraVarsViewEditionProps = {
  playbook: API.PlaybookFile;
};

const ExtraVarsViewEditor: React.FC<ExtraVarsViewEditionProps> = ({
  playbook,
}) => {
  const [currentExtraVars, setCurrentExtraVars] = useState(
    playbook?.extraVars || [],
  );
  const [isOpened, setIsOpened] = useState(false);
  const [showCreateNewVarForm, setShowCreateNewVarForm] = useState(false);

  useEffect(() => {
    if (!isOpened) {
      setShowCreateNewVarForm(false);
    }
  }, [isOpened]);

  useEffect(() => {
    setCurrentExtraVars(playbook?.extraVars || []);
    setIsOpened(false);
  }, [playbook]);

  const onChange = (key: string | string[]) => {
    setIsOpened(key !== undefined && key[0] !== undefined);
  };

  const handleRemove = async (extraVarName: string) => {
    await deletePlaybookExtraVar(playbook.uuid, extraVarName);
    setCurrentExtraVars(
      currentExtraVars.filter((e) => e.extraVar !== extraVarName),
    );
  };

  const renderExtraVarTag = (extraVar: API.ExtraVar) => (
    <Tooltip
      title={getExtraVarTooltipTitle(extraVar.type as SsmAnsible.ExtraVarsType)}
    >
      <Tag
        bordered
        icon={
          <ExtraVarIcon
            extraVarType={extraVar.type as SsmAnsible.ExtraVarsType}
            style={{ fontSize: 15 }}
          />
        }
        style={{ width: 120, textAlign: 'center' }}
      >
        {extraVar.type} VAR
      </Tag>
    </Tooltip>
  );

  const renderAvatarIcon = (required: boolean) => (
    <Tooltip title={required ? 'Required variable' : 'Optional variable'}>
      <Avatar
        src={
          required ? (
            <CheckmarkUnderlineCircle24Regular
              style={{ fontSize: 28, color: 'rgba(255, 255, 255, 0.85)' }}
            />
          ) : (
            <SelectiveTool
              style={{ fontSize: 28, color: 'rgba(255, 255, 255, 0.85)' }}
            />
          )
        }
      />
    </Tooltip>
  );

  const getInitialValue = (type: string): string => {
    if (type === SsmAnsible.ExtraVarsType.CONTEXT) return 'AUTO';
    if (type === SsmAnsible.ExtraVarsType.MANUAL) return 'MANUAL';
    return '';
  };

  const renderActionButtons = (
    extraVar: API.ExtraVar,
    formRef: React.MutableRefObject<ProFormInstance | undefined>,
  ) => (
    <Button.Group>
      <Button
        key="submit"
        danger
        disabled={extraVar.type !== SsmAnsible.ExtraVarsType.SHARED}
        onClick={() => formRef.current?.submit()}
      >
        Overwrite
      </Button>
      <Button
        key="delete"
        danger
        disabled={!extraVar.deletable}
        onClick={() => handleRemove(extraVar.extraVar)}
        style={{ marginLeft: '10px' }}
      >
        Delete
      </Button>
    </Button.Group>
  );

  const ExtraVarRow = ({ extraVar }: { extraVar: API.ExtraVar }) => {
    const formRef = useRef<ProFormInstance>();
    return (
      <React.Fragment key={`row-${extraVar.extraVar}`}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ProForm
                key={`create-new-var-${extraVar.extraVar}`}
                style={{ marginTop: 10 }}
                layout="inline"
                grid
                formRef={formRef}
                onFinish={async (formData) => {
                  await postExtraVarSharedValue({
                    extraVar: formData.extraVarName,
                    value: formData.extraVarValue,
                  });
                  message.success({
                    content: 'Value updated',
                    duration: 6,
                  });
                }}
                submitter={{
                  resetButtonProps: { style: { display: 'none' } },
                  submitButtonProps: { style: { display: 'none' } },
                }}
              >
                <ProForm.Group>
                  <ProForm.Item>{renderExtraVarTag(extraVar)}</ProForm.Item>
                  <ProFormText
                    style={{ flex: 1 }}
                    disabled
                    initialValue={extraVar.extraVar}
                    name="extraVarName"
                  />
                  <ProFormText
                    style={{ flex: 1 }}
                    fieldProps={{
                      prefix:
                        extraVar.type === SsmAnsible.ExtraVarsType.CONTEXT ||
                        extraVar.type === SsmAnsible.ExtraVarsType.MANUAL ? (
                          <LockOutlined />
                        ) : (
                          <UnlockOutlined />
                        ),
                    }}
                    placeholder={
                      extraVar.type === SsmAnsible.ExtraVarsType.SHARED
                        ? 'AUTO'
                        : ''
                    }
                    disabled={
                      extraVar.type === SsmAnsible.ExtraVarsType.CONTEXT ||
                      extraVar.type === SsmAnsible.ExtraVarsType.MANUAL
                    }
                    name="extraVarValue"
                    initialValue={
                      extraVar.value ||
                      getInitialValue(extraVar.type as SsmAnsible.ExtraVarsType)
                    }
                  />
                  <ProForm.Item>
                    {renderAvatarIcon(extraVar.required as boolean)}
                  </ProForm.Item>
                  <ProForm.Item>
                    {renderActionButtons(extraVar, formRef)}
                  </ProForm.Item>
                </ProForm.Group>
              </ProForm>
            </div>
          </Col>
        </Row>
        <Divider style={{ marginTop: 15, marginBottom: 2 }} />
      </React.Fragment>
    );
  };

  return (
    <>
      <Collapse
        key={playbook.path}
        bordered={false}
        style={{ width: '100%', marginBottom: 10 }}
        size="small"
        onChange={onChange}
        items={[
          {
            key: '1',
            label: 'Configuration',
            extra: isOpened && (
              <Tooltip title="Add a variable">
                <Button
                  onClick={(event) => {
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
                {currentExtraVars.map((e) => (
                  <ExtraVarRow key={e.extraVar} extraVar={e} />
                ))}
                {showCreateNewVarForm && (
                  <CreateNewVarForm
                    extraVarViewEditorProps={{ playbook }}
                    setShowCreateNewVarForm={setShowCreateNewVarForm}
                    setCurrentExtraVars={setCurrentExtraVars}
                    currentExtraVars={currentExtraVars}
                  />
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
