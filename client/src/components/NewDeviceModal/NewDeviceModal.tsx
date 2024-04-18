import {
  GrommetIconsInstall,
  TablerPlugConnected,
} from '@/components/Icons/CustomIcons';
import { DownloadOutlined, InfoCircleFilled } from '@ant-design/icons';
import {
  ProForm,
  ProFormInstance,
  ProFormText,
  StepsForm,
} from '@ant-design/pro-components';
import { DotLottiePlayer, PlayMode } from '@dotlottie/react-player';
import {
  Button,
  Flex,
  Input,
  Modal,
  Typography,
  message,
  Row,
  Col,
  Avatar,
  Tooltip,
  Card,
} from 'antd';
import React, { useRef, useState } from 'react';
import SSHConnectionForm from '@/components/SSHConnectionForm/SSHConnectionForm';
import { putDevice } from '@/services/rest/device';

export type NewDeviceModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  onAddNewDevice: any;
};

const NewDeviceModal: React.FC<NewDeviceModalProps> = (props) => {
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [sshConnection, setSshConnection] = useState({});
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
                    becomeUser: values.becomeUser,
                    becomeMethod: values.becomeMethod,
                    becomePass: values.becomePass,
                    strictHostChecking: values.strictHostChecking,
                  },
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
              submitter={{
                render: ({ form, onSubmit, step, onPre }) => {
                  return [
                    step > 0 && (
                      <Button
                        key="pre"
                        onClick={() => {
                          if (step === 1) setSshConnection({});
                          if (step === 2) setControlNodeConnectionString({});
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
                        if (step === 1)
                          setControlNodeConnectionString(
                            form?.getFieldsValue(),
                          );
                        onSubmit?.();
                      }}
                      icon={step < 2 ? undefined : <DownloadOutlined />}
                    >
                      {step < 2 ? 'Next' : 'Confirm & Install Agent'}
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
                <SSHConnectionForm />
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
                                e as keyof typeof sshConnection
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
