import AgentInstallMethod from '@/components/DeviceConfiguration/AgentInstallMethod';
import CheckDeviceConnection from '@/components/DeviceConfiguration/CheckDeviceConnection';
import SSHConnectionFormElements from '@/components/DeviceConfiguration/SSHConnectionFormElements';
import {
  GrommetIconsInstall,
  StreamlineComputerConnection,
} from '@/components/Icons/CustomIcons';
import { createDevice } from '@/services/rest/devices/devices';
import { DownloadOutlined } from '@ant-design/icons';
import {
  ProFormDependency,
  ProFormInstance,
  ProFormText,
  StepsForm,
} from '@ant-design/pro-components';
import { Alert, Button, Col, Grid, Modal, Row, Tag, Typography } from 'antd';
import { motion } from 'framer-motion';
import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import { API, SsmAgent, SsmAnsible } from 'ssm-shared-lib';
import AnimationPlayer from './AnimationPlayer';
import StepFormCard from './StepFormCard';
import SummaryCard from './SummaryCard';
import { postPreCheckDockerConnection } from '@/services/rest/containers/containers-diagnostic';
import { postPreCheckRemoteSystemInformationConnection } from '@/services/rest/remote-system-information/diagnostic';
import { postPreCheckAnsibleConnection } from '@/services/rest/playbooks/diagnostic';

export type NewDeviceModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onAddNewDevice: (
    target: API.DeviceItem,
    installMethod: SsmAgent.InstallMethods,
  ) => void;
};

const { useBreakpoint } = Grid;

const MODAL_MIN_HEIGHT = 600;

const MODAL_WIDTH = 1000;

const NewDeviceModal: React.FC<NewDeviceModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  onAddNewDevice,
}) => {
  const formRef = useRef<ProFormInstance>();
  const sshFormRef = useRef<ProFormInstance>();
  const installMethodFormRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [sshConnection, setSshConnection] = useState<Partial<API.DeviceAuth>>(
    {},
  );
  const [execId, setExecId] = useState<string | undefined>();
  const [dockerConnectionStatus, setDockerConnectionStatus] = useState<
    string | undefined
  >();
  const [dockerConnectionErrorMessage, setDockerConnectionErrorMessage] =
    useState<string | undefined>();
  const [rsiConnectionStatus, setRsiConnectionStatus] = useState<
    string | undefined
  >();
  const [rsiConnectionErrorMessage, setRsiConnectionErrorMessage] = useState<
    string | undefined
  >();
  const [agentInstallMethod, setAgentInstallMethod] = useState<
    string | undefined
  >();
  const screens = useBreakpoint();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await createDevice(
        values.deviceIp,
        {
          authType: values.authType,
          sshPort: values.sshPort,
          sshUser: values.sshUser,
          sshPwd: values.sshPwd,
          sshKey: values.sshKey,
          sshConnection:
            values.sshConnection ?? SsmAnsible.SSHConnection.PARAMIKO,
          becomeUser: values.becomeUser,
          becomeMethod: values.becomeMethod,
          becomePass: values.becomePass,
          strictHostChecking: values.strictHostChecking ?? true,
        },
        false,
        values.controlNodeURL,
        values.installMethod,
      );
      formRef.current?.resetFields();
      setIsModalOpen(false);
      onAddNewDevice(res.data?.device, values.installMethod);
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (step: number) => {
    const sshFormValues = sshFormRef?.current?.getFieldsValue(true);
    const installMethodFormValues =
      installMethodFormRef?.current?.getFieldsValue(true);
    if (step === 0) {
      setSshConnection(sshFormValues);
    }
    if (step === 1) {
      setAgentInstallMethod(installMethodFormValues?.installMethod);
      setDockerConnectionStatus(undefined);
      setDockerConnectionErrorMessage(undefined);
      setRsiConnectionStatus(undefined);
      setRsiConnectionErrorMessage(undefined);
      setExecId(undefined);
      postPreCheckAnsibleConnection(
        sshFormValues.deviceIp,
        {
          authType: sshFormValues.authType,
          sshPort: sshFormValues.sshPort,
          sshUser: sshFormValues.sshUser,
          sshPwd: sshFormValues.sshPwd,
          sshKey: sshFormValues.sshKey,
          sshConnection:
            sshFormValues.sshConnection ?? SsmAnsible.SSHConnection.PARAMIKO,
          becomeUser: sshFormValues.becomeUser,
          becomeMethod: sshFormValues.becomeMethod,
          becomePass: sshFormValues.becomePass,
          strictHostChecking: sshFormValues.strictHostChecking ?? true,
        },
        installMethodFormValues?.controlNodeURL,
      ).then((e) => {
        setExecId(e.data.taskId);
      });
      postPreCheckDockerConnection(
        sshFormValues.deviceIp,
        {
          authType: sshFormValues.authType,
          sshPort: sshFormValues.sshPort,
          sshUser: sshFormValues.sshUser,
          sshPwd: sshFormValues.sshPwd,
          sshKey: sshFormValues.sshKey,
          becomeUser: sshFormValues.becomeUser,
          becomeMethod: sshFormValues.becomeMethod,
          becomePass: sshFormValues.becomePass,
          strictHostChecking: sshFormValues.strictHostChecking ?? true,
        },
        installMethodFormValues?.controlNodeURL,
      ).then((e: any) => {
        setDockerConnectionStatus(e.data.connectionStatus);
        setDockerConnectionErrorMessage(e.data.errorMessage);
      });
      if (
        installMethodFormValues?.installMethod === SsmAgent.InstallMethods.LESS
      ) {
        postPreCheckRemoteSystemInformationConnection(
          sshFormValues.deviceIp,
          {
            authType: sshFormValues.authType,
            sshPort: sshFormValues.sshPort,
            sshUser: sshFormValues.sshUser,
            sshPwd: sshFormValues.sshPwd,
            sshKey: sshFormValues.sshKey,
            becomeUser: sshFormValues.becomeUser,
            becomeMethod: sshFormValues.becomeMethod,
            becomePass: sshFormValues.becomePass,
            strictHostChecking: sshFormValues.strictHostChecking ?? true,
          },
          installMethodFormValues?.controlNodeURL,
        ).then((e) => {
          setRsiConnectionStatus(e.data.connectionStatus);
          setRsiConnectionErrorMessage(e.data.errorMessage);
        });
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <Modal
      title={
        <>
          <GrommetIconsInstall />
          &nbsp; Add a new device
        </>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      width={MODAL_WIDTH}
      footer={(_, { CancelBtn }) => <CancelBtn />}
    >
      <Row
        style={{
          alignItems: 'center',
        }}
        justify="center"
      >
        {!screens.xs && (
          <Col span={8}>
            <AnimationPlayer />
          </Col>
        )}
        <Col span={!screens.xs ? 16 : 24}>
          <StepsForm
            formRef={formRef}
            onFinish={handleFinish}
            stepFormRender={(dom) => (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={stepVariants}
                transition={{ duration: 0.5 }}
              >
                {dom}
              </motion.div>
            )}
            submitter={{
              render: ({ onSubmit, step, onPre }) => [
                step > 0 && (
                  <Button
                    key="pre"
                    onClick={() => {
                      if (step === 1) setSshConnection({});
                      if (step === 3) {
                        setDockerConnectionStatus(undefined);
                        setDockerConnectionErrorMessage(undefined);
                        setRsiConnectionStatus(undefined);
                        setRsiConnectionErrorMessage(undefined);
                        setExecId(undefined);
                      }
                      onPre?.();
                    }}
                  >
                    Back
                  </Button>
                ),
                <Button
                  key="next"
                  loading={loading}
                  type="primary"
                  onClick={() => {
                    handleStepChange(step);
                    onSubmit?.();
                  }}
                  icon={step < 3 ? undefined : <DownloadOutlined />}
                >
                  {step < 3
                    ? 'Next'
                    : `Confirm ${formRef.current?.getFieldValue('installMethod') !== SsmAgent.InstallMethods.LESS ? 'and Install Agent' : ''}`}
                </Button>,
              ],
            }}
            formProps={{
              validateMessages: { required: 'This field is required' },
            }}
          >
            <StepsForm.StepForm
              formRef={sshFormRef}
              name="base"
              title="SSH"
              style={{
                alignItems: 'start',
                maxWidth: screens.xs ? '80%' : '100%',
                minHeight: MODAL_MIN_HEIGHT,
              }}
            >
              <SSHConnectionFormElements formRef={formRef} />
            </StepsForm.StepForm>
            <StepsForm.StepForm
              formRef={installMethodFormRef}
              name="installMethod"
              title="Install Method"
              style={{
                alignItems: 'start',
                maxWidth: screens.xs ? '80%' : '100%',
                minHeight: MODAL_MIN_HEIGHT,
              }}
            >
              <StepFormCard
                title="Install Method"
                icon={<GrommetIconsInstall />}
                content={<AgentInstallMethod />}
              />
              <ProFormDependency name={['installMethod']}>
                {({ installMethod }) => {
                  switch (installMethod) {
                    case SsmAgent.InstallMethods.NODE:
                    case SsmAgent.InstallMethods.NODE_ENHANCED_PLAYBOOK:
                      return (
                        <>
                          <ProFormText
                            name={'controlNodeURL'}
                            label={'Control Node URL'}
                            tooltip={'The URL of the this server.'}
                            initialValue={`http://${document.location.hostname}:8000`}
                          />
                          <Alert
                            style={{
                              marginBottom: 10,
                            }}
                            type={'info'}
                            showIcon
                            message={
                              <>
                                <Typography.Text>
                                  SSM will install, if needed:{' '}
                                  <Tag>Node (NVM)</Tag>
                                  <Tag>NPM</Tag>
                                  <Tag>PM2</Tag>
                                </Typography.Text>
                              </>
                            }
                          />
                        </>
                      );
                    case SsmAgent.InstallMethods.DOCKER:
                      return (
                        <>
                          <ProFormText
                            name={'controlNodeURL'}
                            label={'Control Node URL'}
                            tooltip={'The URL of the this server.'}
                            initialValue={`http://${document.location.hostname}:8000`}
                          />
                          <Alert
                            style={{
                              marginBottom: 10,
                            }}
                            type={'info'}
                            showIcon
                            message={
                              <Typography.Text>
                                SSM will install, if needed: <Tag>Docker</Tag>
                                <Tag>Docker Compose</Tag>
                              </Typography.Text>
                            }
                          />
                        </>
                      );
                    default:
                      return null;
                  }
                }}
              </ProFormDependency>
            </StepsForm.StepForm>
            <StepsForm.StepForm
              name="test"
              title="Test"
              style={{
                alignItems: 'start',
                maxWidth: screens.xs ? '80%' : '100%',
                minHeight: MODAL_MIN_HEIGHT,
              }}
            >
              <StepFormCard
                title="Test connections"
                icon={<StreamlineComputerConnection />}
                content={
                  <CheckDeviceConnection
                    installMethod={
                      agentInstallMethod as SsmAgent.InstallMethods
                    }
                    execId={execId}
                    dockerConnRes={dockerConnectionStatus}
                    dockerConnErrorMessage={dockerConnectionErrorMessage}
                    rsiConnRes={rsiConnectionStatus}
                    rsiConnErrorMessage={rsiConnectionErrorMessage}
                  />
                }
              />
            </StepsForm.StepForm>
            <StepsForm.StepForm
              name="confirm"
              title="Confirm"
              style={{
                maxWidth: screens.xs ? '80%' : '100%',
                minHeight: MODAL_MIN_HEIGHT,
              }}
            >
              <SummaryCard sshConnection={sshConnection} />
            </StepsForm.StepForm>
          </StepsForm>
        </Col>
      </Row>
    </Modal>
  );
};

export default NewDeviceModal;
