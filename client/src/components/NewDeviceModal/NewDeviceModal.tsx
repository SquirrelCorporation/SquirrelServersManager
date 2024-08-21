import CheckDeviceConnection from '@/components/DeviceConfiguration/CheckDeviceConnection';
import SSHConnectionForm from '@/components/DeviceConfiguration/SSHConnectionForm';
import {
  GrommetIconsInstall,
  StreamlineComputerConnection,
  TablerPlugConnected,
} from '@/components/Icons/CustomIcons';
import {
  postCheckAnsibleConnection,
  postCheckDockerConnection,
  putDevice,
} from '@/services/rest/device';
import { DownloadOutlined, InfoCircleFilled } from '@ant-design/icons';
import {
  ProForm,
  ProFormInstance,
  ProFormText,
  StepsForm,
} from '@ant-design/pro-components';
import { DotLottiePlayer, PlayMode } from '@dotlottie/react-player';
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Input,
  message,
  Modal,
  Row,
  Tooltip,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export type NewDeviceModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  onAddNewDevice: any;
};

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

  const checkHostAPI = async (url: string) => {
    await fetch(`${url}/api/ping`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    })
      .then(() => {
        message.success({ content: `Found API at ${url}`, duration: 8 });
      })
      .catch(function (err) {
        message.error({
          content: `Cannot detect API (${err.message}) at ${url}/api/ping, we recommend to edit the previous control node URL`,
          duration: 8,
        });
      });
  };

  const handleCancel = () => {
    props.setIsModalOpen(false);
  };

  // Define animation variants for steps
  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <>
      <Modal
        title={
          <>
            <GrommetIconsInstall />
            &nbsp; Install agent on device
          </>
        }
        open={props.isModalOpen}
        onCancel={handleCancel}
        width={900}
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
          </>
        )}
      >
        <Row style={{ alignItems: 'center' }} justify="center">
          <Col span={8}>
            <DotLottiePlayer
              src="/Animation-1709649662243.json"
              autoplay
              loop
              intermission={5000}
              playMode={PlayMode.Bounce}
              style={{ height: '90%', width: '90%', alignSelf: 'center' }}
            />
          </Col>
          <Col span={16}>
            <StepsForm
              formRef={formRef}
              onFinish={async (values) => {
                setLoading(true);
                await putDevice(
                  values.deviceIp,
                  {
                    authType: values.authType,
                    sshPort: values.sshPort,
                    sshUser: values.sshUser,
                    sshPwd: values.sshPwd,
                    sshKey: values.sshKey,
                    sshConnection: values.sshConnection,
                    becomeUser: values.becomeUser,
                    becomeMethod: values.becomeMethod,
                    becomePass: values.becomePass,
                    strictHostChecking: values.strictHostChecking,
                  },
                  false,
                  values.controlNodeURL,
                )
                  .then((res) => {
                    formRef.current?.resetFields();
                    setLoading(false);
                    props.setIsModalOpen(false);
                    props.onAddNewDevice(res.data?.device);
                  })
                  .catch(() => {
                    setLoading(false);
                  });
              }}
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
                render: ({ form, onSubmit, step, onPre }) => {
                  return [
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
                        if (step === 0)
                          setSshConnection(form?.getFieldsValue());
                        if (step === 1) {
                          setControlNodeConnectionString(
                            form?.getFieldsValue(),
                          );
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
                              sshConnection: sshConnection.sshConnection,
                              becomeUser: sshConnection.becomeUser,
                              becomeMethod: sshConnection.becomeMethod,
                              becomePass: sshConnection.becomePass,
                              strictHostChecking:
                                sshConnection.strictHostChecking,
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
                              strictHostChecking:
                                sshConnection.strictHostChecking,
                            },
                            form?.getFieldsValue().controlNodeURL,
                          ).then((e) => {
                            setDockerConnectionStatus(e.data.connectionStatus);
                            setDockerConnectionErrorMessage(
                              e.data.errorMessage,
                            );
                          });
                        }
                        onSubmit?.();
                      }}
                      icon={step < 3 ? undefined : <DownloadOutlined />}
                    >
                      {step < 3 ? 'Next' : 'Confirm & Install Agent'}
                    </Button>,
                  ];
                },
              }}
              formProps={{
                validateMessages: {
                  required: 'This field is required',
                },
              }}
            >
              <StepsForm.StepForm
                name="base"
                title="SSH"
                style={{ alignItems: 'start' }}
              >
                <SSHConnectionForm formRef={formRef} />
              </StepsForm.StepForm>
              <StepsForm.StepForm
                name="checkbox"
                title="Node"
                style={{ minHeight: '350px' }}
                onFinish={async (formData) => {
                  setLoading(true);
                  await checkHostAPI(formData.controlNodeURL);
                  setLoading(false);
                  return true;
                }}
              >
                <Card
                  type="inner"
                  title={
                    <Row>
                      <Col>
                        <Avatar
                          style={{ backgroundColor: '#8e5416' }}
                          shape="square"
                          icon={<TablerPlugConnected />}
                        />
                      </Col>
                      <Col
                        style={{
                          marginLeft: 10,
                          marginTop: 'auto',
                          marginBottom: 'auto',
                        }}
                      >
                        SSM URL
                      </Col>
                    </Row>
                  }
                  style={{ marginBottom: 10 }}
                  styles={{
                    header: { height: 45, minHeight: 45, paddingLeft: 15 },
                    body: { paddingBottom: 0 },
                  }}
                  extra={
                    <Tooltip
                      title={
                        'The URL of this server, to enable the agent to connect to your device. This will set the API_URL_MASTER variable in the .env file of the agent.'
                      }
                    >
                      <InfoCircleFilled />
                    </Tooltip>
                  }
                >
                  <ProForm.Group>
                    <ProFormText
                      name="controlNodeURL"
                      label="Control Node URL"
                      width="md"
                      placeholder="http://192.168.0.1"
                      rules={[{ required: true }]}
                      initialValue={`http://${document.location.hostname}:8000`}
                    />
                  </ProForm.Group>
                </Card>
              </StepsForm.StepForm>
              <StepsForm.StepForm
                name="test"
                title="Test"
                style={{ alignItems: 'start' }}
              >
                <Card
                  type="inner"
                  title={
                    <Row>
                      <Col>
                        <Avatar
                          style={{ backgroundColor: '#16728e' }}
                          shape="square"
                          icon={<StreamlineComputerConnection />}
                        />
                      </Col>
                      <Col
                        style={{
                          marginLeft: 10,
                          marginTop: 'auto',
                          marginBottom: 'auto',
                        }}
                      >
                        Test connections
                      </Col>
                    </Row>
                  }
                  style={{ marginBottom: 10 }}
                  styles={{
                    header: { height: 45, minHeight: 45, paddingLeft: 15 },
                    body: { paddingBottom: 0 },
                  }}
                >
                  <CheckDeviceConnection
                    execId={execId}
                    dockerConnRes={dockerConnectionStatus}
                    dockerConnErrorMessage={dockerConnectionErrorMessage}
                  />
                </Card>
              </StepsForm.StepForm>
              <StepsForm.StepForm name="confirm" title="Confirm">
                <Card
                  type="inner"
                  title={
                    <Row>
                      <Col>
                        <Avatar
                          style={{ backgroundColor: '#168e2e' }}
                          shape="square"
                          icon={<GrommetIconsInstall />}
                        />
                      </Col>
                      <Col
                        style={{
                          marginLeft: 10,
                          marginTop: 'auto',
                          marginBottom: 'auto',
                        }}
                      >
                        Summary
                      </Col>
                    </Row>
                  }
                  style={{ marginBottom: 10 }}
                  styles={{
                    header: { height: 45, minHeight: 45, paddingLeft: 15 },
                    body: { paddingBottom: 20 },
                  }}
                >
                  <Flex vertical gap={16}>
                    {Object.keys(sshConnection).map((e) => (
                      <Row key={e}>
                        <Col
                          style={{
                            marginTop: 'auto',
                            marginBottom: 'auto',
                            width: '150px',
                          }}
                        >
                          <Typography>{e} :</Typography>{' '}
                        </Col>
                        <Col flex="auto">
                          <Input
                            value={
                              e.toLowerCase().indexOf('password') !== -1
                                ? '••••••'
                                : sshConnection[e as keyof typeof sshConnection]
                            }
                            disabled
                          />
                        </Col>
                      </Row>
                    ))}
                    {Object.keys(controlNodeConnectionString).map((e) => (
                      <Row key={e} style={{ marginTop: 10 }}>
                        <Col
                          style={{
                            marginTop: 'auto',
                            marginBottom: 'auto',
                            width: '150px',
                          }}
                        >
                          <Typography>{e} :</Typography>{' '}
                        </Col>
                        <Col flex="auto">
                          <Input
                            value={
                              controlNodeConnectionString[
                                e as keyof typeof controlNodeConnectionString
                              ]
                            }
                            disabled
                          />
                        </Col>
                      </Row>
                    ))}
                  </Flex>
                </Card>
              </StepsForm.StepForm>
            </StepsForm>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default NewDeviceModal;
