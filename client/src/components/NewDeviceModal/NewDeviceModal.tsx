import { DownloadOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
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
} from 'antd';
import React, { useState } from 'react';
import SSHConnectionForm from '@/components/SSHConnectionForm/SSHConnectionForm';

export type NewDeviceModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
};
/*
<DotLottiePlayer
              src="/Animation-1707227652919.json"
              autoplay
              style={{ height: '100%', width: '100%' }}
            />
            <DotLottiePlayer
              src="/Animation-1705922266332.lottie"
              autoplay
              loop
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 100,
              }}
            />
 */

export const EpConnection = (iconProps: any) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    {...iconProps}
  >
    <path
      fill="currentColor"
      d="M640 384v64H448a128 128 0 0 0-128 128v128a128 128 0 0 0 128 128h320a128 128 0 0 0 128-128V576a128 128 0 0 0-64-110.848V394.88c74.56 26.368 128 97.472 128 181.056v128a192 192 0 0 1-192 192H448a192 192 0 0 1-192-192V576a192 192 0 0 1 192-192z"
    />
    <path
      fill="currentColor"
      d="M384 640v-64h192a128 128 0 0 0 128-128V320a128 128 0 0 0-128-128H256a128 128 0 0 0-128 128v128a128 128 0 0 0 64 110.848v70.272A192.064 192.064 0 0 1 64 448V320a192 192 0 0 1 192-192h320a192 192 0 0 1 192 192v128a192 192 0 0 1-192 192z"
    />
  </svg>
);

export const CilControl = (iconProps: any) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    {...iconProps}
  >
    <path
      fill="currentColor"
      d="M336 256a80 80 0 1 0-80 80a80.091 80.091 0 0 0 80-80m-128 0a48 48 0 1 1 48 48a48.055 48.055 0 0 1-48-48m-48 141.988L245.307 496h21.386L352 397.988V368H160ZM307.825 400L256 459.544L204.175 400ZM245.307 16L160 114.012V144h192v-29.988L266.693 16Zm-41.132 96L256 52.456L307.825 112ZM16 245.307v21.386L114.013 352H144V160h-29.987Zm96 62.519L52.455 256L112 204.174ZM397.987 160H368v192h29.987L496 266.693v-21.386ZM400 307.826V204.174L459.545 256Z"
    />
  </svg>
);

const NewDeviceModal: React.FC<NewDeviceModalProps> = (props) => {
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
  const GrommetIconsInstall = (iconProps: any) => (
    <svg
      width="0.8em"
      height="0.8em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...iconProps}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M19 13.5v4L12 22l-7-4.5v-4m7 8.5v-8.5m6.5-5l-6.5-4L15.5 2L22 6zm-13 0l6.5-4L8.5 2L2 6zm13 .5L12 13l3.5 2.5l6.5-4zm-13 0l6.5 4l-3.5 2.5l-6.5-4z"
      />
    </svg>
  );
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
          <Col span={12}>
            <DotLottiePlayer
              src="/Animation-1707227617481.json"
              autoplay
              loop
              intermission={5000}
              playMode={PlayMode.Bounce}
              style={{ height: '90%', width: '90%', alignSelf: 'center' }}
            />
          </Col>
          <Col span={12}>
            <ProCard>
              <StepsForm
                onFinish={async () => {
                  setLoading(true);
                  message.success('Success');
                  setLoading(false);
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
                <StepsForm.StepForm name="base" title="SSH">
                  <ProFormText
                    name="deviceIp"
                    label="Device IP"
                    width="md"
                    placeholder="192.168.0.1"
                    rules={[{ required: true }]}
                  />
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
                </StepsForm.StepForm>
                <StepsForm.StepForm name="confirm" title="Confirm">
                  <ProForm.Item
                    label={
                      <>
                        <EpConnection style={{ marginRight: '5px' }} />{' '}
                        Connection configuration
                      </>
                    }
                  >
                    <Flex vertical gap={16}>
                      {Object.keys(sshConnection).map((e) => (
                        <div key={e}>
                          <Typography>{e} :</Typography>{' '}
                          <Input
                            style={{ width: '80%' }}
                            value={
                              e.toLowerCase().indexOf('password') !== -1
                                ? '••••••'
                                : sshConnection[e as keyof typeof sshConnection]
                            }
                            disabled
                          />
                        </div>
                      ))}
                    </Flex>
                  </ProForm.Item>
                  <ProForm.Item
                    label={
                      <>
                        <CilControl style={{ marginRight: '5px' }} />
                        Control Node configuration (.env)
                      </>
                    }
                  >
                    <Flex vertical gap={16}>
                      {Object.keys(controlNodeConnectionString).map((e) => (
                        <div key={e}>
                          <Typography>{e} :</Typography>{' '}
                          <Input
                            style={{ width: '80%' }}
                            value={
                              controlNodeConnectionString[
                                e as keyof typeof sshConnection
                              ]
                            }
                            disabled
                          />
                        </div>
                      ))}
                    </Flex>
                  </ProForm.Item>
                </StepsForm.StepForm>
              </StepsForm>
            </ProCard>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default NewDeviceModal;
