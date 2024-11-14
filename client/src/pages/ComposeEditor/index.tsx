import FloatingButtonsBar from '@/components/ComposeEditor/FloatingButtonsBar';
import { MenuElements } from '@/components/ComposeEditor/Menu/MenuElements';
import DockerComposeStackBuilder from '@/components/ComposeEditor/DockerComposeStackBuilder';
import {
  StackIcon,
  StackIconSelector,
} from '@/components/ComposeEditor/StackIconSelector';
import { MenuElementType } from '@/components/ComposeEditor/types';
import { Validate } from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import {
  deleteContainerCustomStack,
  getCustomStacks,
  patchContainerCustomStack,
  postContainerCustomStack,
  postContainerCustomStackDryRun,
  postTransformContainerCustomStack,
} from '@/services/rest/containers';
import {
  ApartmentOutlined,
  CheckOutlined,
  FrownOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-form';
import Editor, { Monaco } from '@monaco-editor/react';
import { useSearchParams } from '@umijs/max';
import { InputRef, Tag } from 'antd';
import { Alert, Button, Col, message, notification, Row, Space } from 'antd';
import { AnimatePresence, motion } from 'framer-motion';
import { editor } from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;

const switchVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new Worker(
          new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
        );
      case 'yaml':
        return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url));
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};

const ComposeEditor = () => {
  const [searchParams] = useSearchParams();
  const preSelectedStackUuid = searchParams.get('stackUuid');
  const [codeEditorMode, setCodeEditorMode] = React.useState(false);
  const [downloadedContent, setDownloadedContent] = React.useState<
    string | undefined
  >();
  const [currentSavedStack, setCurrentSavedStack] = React.useState<
    API.ContainerCustomStack | undefined
  >();
  const [savedForm, setSavedForm] = React.useState<any>(undefined);
  const [currentStack, setCurrentStack] = React.useState<
    MenuElementType[] | undefined
  >();
  const [lockUI, setLockUI] = React.useState(false);
  const editorRef = React.useRef(null);
  const [form] = ProForm.useForm();
  const nameRef = React.useRef<InputRef | null>(null);
  const [api, contextHolder] = notification.useNotification();
  const [stackIcon, setStackIcon] = React.useState<{
    icon: string;
    iconColor: string;
    iconBackgroundColor: string;
  }>({
    icon: 'file',
    iconColor: '#ffffff',
    iconBackgroundColor: '#000000',
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-shadow
  const editorDidMount = (editor: IStandaloneCodeEditor, monaco: Monaco) => {
    // @ts-ignore
    editorRef.current = editor;
    editor.focus();
    configureMonacoYaml(monaco);
  };

  const handleOnSelectStack = async (newValue: {
    label: string;
    value: string;
  }) => {
    if (newValue?.value) {
      await getCustomStacks().then((response) => {
        const foundStack = response.data?.find(
          (e) => e.uuid === newValue.value,
        );
        if (!foundStack) {
          message.error({ content: 'Internal error, stack not found' });
          return;
        }
        setCurrentSavedStack(foundStack);
        setDownloadedContent(foundStack.yaml);
        setStackIcon({
          icon: foundStack.icon,
          iconBackgroundColor: foundStack.iconBackgroundColor,
          iconColor: foundStack.iconColor,
        });
        if (foundStack.lockJson) {
          setCodeEditorMode(true);
        } else {
          setCurrentStack(foundStack.rawStackValue as MenuElementType[]);
          form?.setFieldsValue(foundStack.json);
        }
      });
    } else {
      setCurrentSavedStack(undefined);
      setDownloadedContent(undefined);
      setCodeEditorMode(false);
      setLockUI(false);
      setCurrentStack(undefined);
      setSavedForm(undefined);
    }
  };

  useEffect(() => {
    if (
      preSelectedStackUuid &&
      currentSavedStack?.uuid !== preSelectedStackUuid
    ) {
      void handleOnSelectStack({ label: '', value: preSelectedStackUuid });
    }
  }, [preSelectedStackUuid]);

  const handleOnChangeEditorContent = async (value?: string) => {
    if (downloadedContent !== value && !currentSavedStack?.lockJson) {
      setLockUI(true);
    } else {
      setLockUI(false);
    }
  };

  const handleChangeEditionMode = async () => {
    if (!codeEditorMode) {
      setLockUI(false);
      setSavedForm(form.getFieldsValue());
      await postTransformContainerCustomStack(
        JSON.stringify(form.getFieldsValue()),
      ).then((response) => {
        setDownloadedContent(response.data.yaml);
        setCodeEditorMode(!codeEditorMode);
      });
    } else {
      setCodeEditorMode(!codeEditorMode);
    }
  };

  const deleteStack = async () => {
    await deleteContainerCustomStack(currentSavedStack?.uuid as string);
    message.warning({
      content: `Stack ${currentSavedStack?.name} deleted successfully`,
      duration: 6,
    });
    setCurrentSavedStack(undefined);
    setDownloadedContent(undefined);
    setSavedForm(undefined);
    setCurrentStack(undefined);
    setLockUI(false);
    setCodeEditorMode(false);
  };

  const undoStack = () => {
    setDownloadedContent(currentSavedStack?.yaml);
    setCurrentStack(currentSavedStack?.rawStackValue as MenuElementType[]);
    form.setFieldsValue(currentSavedStack?.json);
  };

  const saveStack = async () => {
    const saveCall = currentSavedStack
      ? patchContainerCustomStack
      : postContainerCustomStack;
    if (!codeEditorMode) {
      try {
        const values = await form.validateFields();
        await saveCall(
          currentSavedStack ? currentSavedStack.uuid : values.name,
          values,
          currentStack,
          undefined,
          lockUI,
          stackIcon?.icon,
          stackIcon?.iconColor,
          stackIcon?.iconBackgroundColor,
        ).then((response) => {
          setCurrentSavedStack(response.data);
          message.success({
            content: `Stack ${values.name} saved successfully`,
            duration: 6,
          });
        });
      } catch {
        message.error({
          content: `Stack is invalid`,
          duration: 6,
        });
      }
    } else {
      if (
        !nameRef?.current?.input?.value &&
        !nameRef?.current?.input?.defaultValue
      ) {
        message.error({ content: 'A name is required', duration: 6 });
        return;
      }
      const stackName =
        nameRef.current.input.value || nameRef.current.input.defaultValue;
      if (lockUI || currentSavedStack?.lockJson) {
        await saveCall(
          currentSavedStack ? currentSavedStack.uuid : stackName,
          undefined,
          undefined,
          // @ts-ignore
          editorRef?.current?.getValue(),
          lockUI,
        ).then((response) => {
          setCurrentSavedStack(response.data);
          message.success({
            content: `Stack ${stackName} saved successfully`,
            duration: 6,
          });
        });
      } else {
        await saveCall(
          currentSavedStack ? currentSavedStack.uuid : stackName,
          savedForm,
          currentStack,
          undefined,
          undefined,
          stackIcon?.icon,
          stackIcon?.iconColor,
          stackIcon?.iconBackgroundColor,
        ).then((response) => {
          setCurrentSavedStack(response.data);
          message.success({
            content: `Stack ${stackName} saved successfully`,
            duration: 6,
          });
        });
      }
    }
  };

  const notifyDryRun = (res?: API.ContainerCustomStackValidation) => {
    api.open({
      message: res?.validating ? 'Validation Successful' : 'Validation Failed',
      description:
        'Your stack has ' +
        (res?.validating
          ? 'been successfully validated.'
          : `failed to pass validation (${res?.message})`),
      icon: res?.validating ? (
        <CheckOutlined style={{ color: '#108ee9' }} />
      ) : (
        <FrownOutlined style={{ color: '#f5222d' }} />
      ),
      duration: 8,
    });
  };

  const handleDryRun = async () => {
    if (!codeEditorMode) {
      await postContainerCustomStackDryRun(form.getFieldsValue()).then(
        (response) => {
          notifyDryRun(response?.data);
        },
      );
    } else {
      await postContainerCustomStackDryRun(
        undefined,
        // @ts-expect-error to fix type
        editorRef?.current?.getValue(),
      ).then((response) => {
        notifyDryRun(response?.data);
      });
    }
  };

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Container Stacks'}
            backgroundColor={TitleColors.COMPOSE}
            icon={<ApartmentOutlined />}
          />
        ),
      }}
    >
      {contextHolder}
      <FloatingButtonsBar
        onClickSaveStack={saveStack}
        onClickDeleteStack={deleteStack}
        currentSavedStack={currentSavedStack}
        onClickUndoStack={undoStack}
      />
      <Row gutter={[16, 16]}>
        <Col
          span={12}
          style={{ display: 'flex', justifyContent: 'flex-start' }}
        >
          <ProFormSelect.SearchSelect
            mode={'single'}
            style={{ width: '300px' }} // Adjust the width as needed
            placeholder={'Your saved stacks'}
            onChange={handleOnSelectStack}
            fieldProps={{
              optionRender: (option) => (
                <Space>
                  <span role="img" aria-label={option.data.label as string}>
                    <Tag>{option.data.type}</Tag>
                    <StackIcon
                      stackIcon={{
                        icon: option.data.icon,
                        iconColor: option.data.iconColor,
                        iconBackgroundColor: option.data.iconBackgroundColor,
                      }}
                    />
                  </span>
                  {option.data.label}
                </Space>
              ),
            }}
            request={async () =>
              await getCustomStacks().then((response) => {
                return response.data.map((e) => {
                  return {
                    label: e.name,
                    value: e.uuid,
                    icon: e.icon,
                    iconColor: e.iconColor,
                    iconBackgroundColor: e.iconBackgroundColor,
                    type: e.type,
                  };
                });
              })
            }
          />
        </Col>
        <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space size={'small'}>
            <Button type="default" icon={<Validate />} onClick={handleDryRun}>
              Check Format
            </Button>
            <Button
              type="primary"
              icon={<SwapOutlined />}
              disabled={currentSavedStack?.lockJson || lockUI}
              onClick={handleChangeEditionMode}
            >
              Switch to {codeEditorMode ? 'UI Builder' : 'Code Editor'}
            </Button>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {lockUI && (
            <Alert
              message="Editing the stack manually will disable the ability to edit it with the UI mode"
              type="warning"
              showIcon
              style={{ marginBottom: 8 }}
            />
          )}
          <AnimatePresence mode={'wait'}>
            {codeEditorMode ? (
              <motion.div
                key="codeEditor"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={switchVariants}
                transition={{ duration: 0.5 }}
              >
                <ProFormText
                  name={'name'}
                  placeholder={'Name'}
                  rules={[{ required: true, message: 'Please enter a name' }]}
                  fieldProps={{
                    ref: nameRef,
                    defaultValue:
                      currentSavedStack?.name || savedForm?.name || '',
                    addonBefore: (
                      <StackIconSelector
                        stackIcon={stackIcon}
                        setStackIcon={setStackIcon}
                      >
                        <>
                          {' '}
                          <StackIcon stackIcon={stackIcon} />
                        </>
                      </StackIconSelector>
                    ),
                  }}
                />
                <Editor
                  theme="vs-dark"
                  height="90vh"
                  language="yaml"
                  path={'docker-compose.yml'}
                  value={downloadedContent}
                  onMount={editorDidMount}
                  onChange={handleOnChangeEditorContent}
                />
              </motion.div>
            ) : (
              <motion.div
                key="stackBuilder"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={switchVariants}
                transition={{ duration: 0.5 }}
              >
                <DockerComposeStackBuilder
                  elementTypes={MenuElements}
                  formRef={form}
                  setCurrentStack={setCurrentStack}
                  currentStack={currentStack}
                  stackIcon={stackIcon}
                  setStackIcon={setStackIcon}
                  onClickSaveStack={saveStack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ComposeEditor;
