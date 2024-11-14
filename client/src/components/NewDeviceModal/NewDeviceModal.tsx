import AgentInstallMethod from '@/components/DeviceConfiguration/AgentInstallMethod';
import { DownloadOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import React, { useRef, useState } from 'react';
import {
  Button,
  Col,
  Modal,
  Row,
  message,
  Alert,
  Typography,
  Tag,
  Grid,
} from 'antd';
import {
  ProFormDependency,
  ProFormInstance,
  StepsForm,
} from '@ant-design/pro-components';
import { motion } from 'framer-motion';
import {
  GrommetIconsInstall,
  TablerPlugConnected,
  StreamlineComputerConnection,
} from '@/components/Icons/CustomIcons';
import {
  putDevice,
  postCheckAnsibleConnection,
  postCheckDockerConnection,
} from '@/services/rest/device';
import SSHConnectionFormElements from '@/components/DeviceConfiguration/SSHConnectionFormElements';
import CheckDeviceConnection from '@/components/DeviceConfiguration/CheckDeviceConnection';
import { SsmAnsible, SsmAgent, API } from 'ssm-shared-lib';
import StepFormCard from './StepFormCard';
import SummaryCard from './SummaryCard';
import AnimationPlayer from './AnimationPlayer';

export type NewDeviceModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  onAddNewDevice: (
    target: API.DeviceItem,
    installMethod: SsmAgent.InstallMethods,
  ) => void;
};
const { useBreakpoint } = Grid;

const NewDeviceModal: React.FC<NewDeviceModalProps> = (props) => {
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [sshConnection, setSshConnection] = useState<any>({});
  const [execId, setExecId] = useState();
  const [dockerConnectionStatus, setDockerConnectionStatus] = useState();
  const [dockerConnectionErrorMessage, setDockerConnectionErrorMessage] =
    useState();
  const [controlNodeConnectionString, setControlNodeConnectionString] =
    useState({});
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const screens = useBreakpoint();

  const checkHostAPI = async (url: string) => {
    try {
      await fetch(`${url}/api/ping`, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });
      message.success({ content: `Found API at ${url}`, duration: 8 });
    } catch (err: any) {
      message.error({
        content: `Cannot detect API (${err?.message}) at ${url}/api/ping, we recommend to edit the previous control node URL`,
        duration: 8,
      });
    }
  };

  const handleCancel = () => {
    props.setIsModalOpen(false);
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await putDevice(
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
      props.setIsModalOpen(false);
      props.onAddNewDevice(res.data?.device, values.installMethod);
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (step: number, form: any) => {
    if (step === 0) setSshConnection(form?.getFieldsValue(true));
    if (step === 1) {
      setControlNodeConnectionString(form?.getFieldsValue());
      setDockerConnectionStatus(undefined);
      setDockerConnectionErrorMessage(undefined);
      setExecId(undefined);
      postCheckAnsibleConnection(
        sshConnection.deviceIp,
        {
          authType: sshConnection.authType,
          sshPort: sshConnection.sshPort,
          sshUser: sshConnection.sshUser,
          sshPwd: sshConnection.sshPwd,
          sshKey: sshConnection.sshKey,
          sshConnection:
            sshConnection.sshConnection ?? SsmAnsible.SSHConnection.PARAMIKO,
          becomeUser: sshConnection.becomeUser,
          becomeMethod: sshConnection.becomeMethod,
          becomePass: sshConnection.becomePass,
          strictHostChecking: sshConnection.strictHostChecking ?? true,
        },
        form?.getFieldsValue().controlNodeURL,
      ).then((e) => {
        setExecId(e.data.taskId);
      });
      postCheckDockerConnection(
        sshConnection.deviceIp,
        {
          authType: sshConnection.authType,
          sshPort: sshConnection.sshPort,
          sshUser: sshConnection.sshUser,
          sshPwd: sshConnection.sshPwd,
          sshKey: sshConnection.sshKey,
          becomeUser: sshConnection.becomeUser,
          becomeMethod: sshConnection.becomeMethod,
          becomePass: sshConnection.becomePass,
          strictHostChecking: sshConnection.strictHostChecking ?? true,
        },
        form?.getFieldsValue().controlNodeURL,
      ).then((e) => {
        setDockerConnectionStatus(e.data.connectionStatus);
        setDockerConnectionErrorMessage(e.data.errorMessage);
      });
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
          &nbsp; Install agent on device
        </>
      }
      open={props.isModalOpen}
      onCancel={handleCancel}
      width={1000}
      footer={(_, { CancelBtn }) => <CancelBtn />}
    >
      <Row style={{ alignItems: 'center' }} justify="center">
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
              render: ({ form, onSubmit, step, onPre }) => [
                step > 0 && (
                  <Button
                    key="pre"
                    onClick={() => {
                      if (step === 1) setSshConnection({});
                      if (step === 2) {
                        setControlNodeConnectionString({});
                        setDockerConnectionStatus(undefined);
                        setDockerConnectionErrorMessage(undefined);
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
                    handleStepChange(step, form);
                    onSubmit?.();
                  }}
                  icon={step < 4 ? undefined : <DownloadOutlined />}
                >
                  {step < 4 ? 'Next' : 'Confirm & Install Agent'}
                </Button>,
              ],
            }}
            formProps={{
              validateMessages: { required: 'This field is required' },
            }}
          >
            <StepsForm.StepForm
              name="base"
              title="SSH"
              style={{
                alignItems: 'start',
                maxWidth: screens.xs ? '80%' : '100%',
              }}
            >
              <SSHConnectionFormElements formRef={formRef} />
            </StepsForm.StepForm>
            <StepsForm.StepForm
              name="checkbox"
              title="Node"
              style={{
                minHeight: '350px',
                maxWidth: screens.xs ? '80%' : '100%',
              }}
              onFinish={async (formData) => {
                setLoading(true);
                await checkHostAPI(formData.controlNodeURL);
                setLoading(false);
                return true;
              }}
            >
              <StepFormCard
                title="SSM URL"
                icon={<TablerPlugConnected />}
                tooltip="The URL of this server, to enable the agent to connect to your device. This will set the API_URL_MASTER variable in the .env file of the agent."
                formItems={[
                  {
                    name: 'controlNodeURL',
                    label: 'Control Node URL',
                    placeholder: 'http://192.168.0.1',
                    rules: [{ required: true }],
                    initialValue: currentUser?.settings?.masterNodeUrl
                      ? currentUser?.settings.masterNodeUrl
                      : `http://${document.location.hostname}:8000`,
                  },
                ]}
              />
              <Alert
                message={
                  'Ensure that the server running Squirrel Servers Manager has port *8000* opened and accessible from the device you wish to add.'
                }
                showIcon
              />
            </StepsForm.StepForm>
            <StepsForm.StepForm
              name="test"
              title="Test"
              style={{
                alignItems: 'start',
                maxWidth: screens.xs ? '80%' : '100%',
              }}
            >
              <StepFormCard
                title="Test connections"
                icon={<StreamlineComputerConnection />}
                content={
                  <CheckDeviceConnection
                    execId={execId}
                    dockerConnRes={dockerConnectionStatus}
                    dockerConnErrorMessage={dockerConnectionErrorMessage}
                  />
                }
              />
            </StepsForm.StepForm>
            <StepsForm.StepForm
              name="installMethod"
              title="Install Method"
              style={{
                alignItems: 'start',
                maxWidth: screens.xs ? '80%' : '100%',
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
                      );
                    case SsmAgent.InstallMethods.DOCKER:
                      return (
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
                      );
                    default:
                      return null;
                  }
                }}
              </ProFormDependency>
            </StepsForm.StepForm>
            <StepsForm.StepForm
              name="confirm"
              title="Confirm"
              style={{ maxWidth: screens.xs ? '80%' : '100%' }}
            >
              <SummaryCard
                sshConnection={sshConnection}
                controlNodeConnectionString={controlNodeConnectionString}
              />
            </StepsForm.StepForm>
          </StepsForm>
        </Col>
      </Row>
    </Modal>
  );
};

export default NewDeviceModal;
