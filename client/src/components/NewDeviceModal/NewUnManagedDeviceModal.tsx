import React from 'react';
import { Col, message, Modal, Result, Row, Typography } from 'antd';
import { DotLottiePlayer, PlayMode } from '@dotlottie/react-player';
import { ProCard, ProFormText } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import SSHConnectionForm from '@/components/SSHConnectionForm/SSHConnectionForm';
import { putDevice } from '@/services/rest/device';

export type NewUnManagedDeviceModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
};
const { Text } = Typography;

const NewUnManagedDeviceModal: React.FC<NewUnManagedDeviceModalProps> = (
  props,
) => {
  const [deviceUuid, setDeviceUuid] = React.useState<string | undefined>();
  const handleCancel = () => {
    setDeviceUuid(undefined);
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
            &nbsp; Register an unmanaged device (without agent)
          </>
        }
        open={props.isModalOpen}
        onCancel={handleCancel}
        onOk={handleCancel}
        width={900}
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        footer={(_, { OkBtn, CancelBtn }) => (
          <>{(deviceUuid && <OkBtn />) || <CancelBtn />}</>
        )}
      >
        <Row style={{ alignItems: 'center' }} justify="center">
          <Col span={12}>
            <DotLottiePlayer
              src="/Animation-1709649662243.json"
              autoplay
              loop
              intermission={5000}
              playMode={PlayMode.Bounce}
              style={{ height: '90%', width: '90%', alignSelf: 'center' }}
            />
          </Col>
          <Col span={12}>
            <ProCard>
              {(!deviceUuid && (
                <ProForm
                  onFinish={async (values) => {
                    if (values) {
                      await putDevice(values.deviceIp, {
                        sshPort: values.sshPort,
                        type: values.type,
                        sshUser: values.sshUser,
                        sshPwd: values.sshPwd,
                        sshKey: values.sshKey,
                      }).then((res) => {
                        setDeviceUuid(res.data.device.uuid);
                      });
                    } else {
                      message.error({
                        content: `Internal - Calling creation modal without values form undefined`,
                        duration: 6,
                      });
                    }
                  }}
                >
                  <ProFormText
                    name="deviceIp"
                    label="Device IP"
                    width="md"
                    placeholder="192.168.0.1"
                    rules={[{ required: true }]}
                  />
                  <SSHConnectionForm />
                </ProForm>
              )) || (
                <Result
                  status="success"
                  title="Successfully Registered Unmanaged Device"
                  subTitle={
                    <>
                      <Text>Registered device with uuid</Text>
                      <br />
                      <Text code>{deviceUuid}</Text>
                    </>
                  }
                />
              )}
            </ProCard>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default NewUnManagedDeviceModal;
