import { DockerConnectionForm } from '@/components/DeviceConfiguration/DockerConnectionForm';
import { getDeviceAuth, putDeviceDockerAuth } from '@/services/rest/deviceauth';
import { ProFormInstance } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { message, Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

export type DockerConfigurationFormProps = {
  device: Partial<API.DeviceItem>;
};

const DockerConfigurationForm: React.FC<DockerConfigurationFormProps> = (
  props,
) => {
  const formRef = React.useRef<ProFormInstance | undefined>();
  return (
    <>
      <ProForm
        layout="horizontal"
        formRef={formRef}
        submitter={{
          // eslint-disable-next-line @typescript-eslint/no-shadow
          render: (props, doms) => {
            return (
              <div style={{ textAlign: 'right' }}>
                <Space direction="horizontal" size="middle">
                  {doms}
                </Space>
              </div>
            );
          },
        }}
        onFinish={async (values) => {
          if (props?.device?.uuid && values) {
            await putDeviceDockerAuth(props.device.uuid, {
              customDockerSSH: values.customDockerSSH,
              dockerCustomAuthType: values.dockerCustomAuthType,
              dockerCustomSshUser: values.dockerCustomSshUser,
              dockerCustomSshPwd: values.dockerCustomSshPwd,
              dockerCustomSshKeyPass: values.dockerCustomSshKeyPass,
              dockerCustomSshKey: values.dockerCustomSshKey,
              customDockerForcev4: values.customDockerForcev4,
              customDockerForcev6: values.customDockerForcev6,
              customDockerAgentForward: values.customDockerAgentForward,
              customDockerTryKeyboard: values.customDockerTryKeyboard,
              customDockerSocket: values.customDockerSocket,
            } as API.DeviceAuthParams)
              .then(() => {
                message.success({
                  content: 'Configuration updated',
                  duration: 6,
                });
              })
              .catch((error) => {
                message.error({
                  content: `Configuration update failed (${error.message})`,
                  duration: 6,
                });
              });
          } else {
            message.error({
              content: `Internal - Calling Configuration modal without uuid or values form undefined`,
              duration: 6,
            });
          }
        }}
        request={async () => {
          if (props?.device?.uuid) {
            return await getDeviceAuth(props.device.uuid).then((res) => {
              return {
                customDockerSSH: res.data.customDockerSSH,
                dockerCustomAuthType: res.data.dockerCustomAuthType,
                dockerCustomSshUser: res.data.dockerCustomSshUser,
                dockerCustomSshPwd: res.data.dockerCustomSshPwd,
                dockerCustomSshKeyPass: res.data.dockerCustomSshKeyPass,
                dockerCustomSshKey: res.data.dockerCustomSshKey,
                customDockerForcev4: res.data.customDockerForcev4,
                customDockerForcev6: res.data.customDockerForcev6,
                customDockerAgentForward: res.data.customDockerAgentForward,
                customDockerTryKeyboard: res.data.customDockerTryKeyboard,
                customDockerSocket: res.data.customDockerSocket,
                dockerCa: res.data.dockerCa,
                dockerCert: res.data.dockerCert,
                dockerKey: res.data.dockerKey,
              };
            });
          } else {
            message.error({
              content: `Internal - Calling Configuration modal without uuid`,
              duration: 6,
            });
          }
        }}
      >
        <DockerConnectionForm device={props.device} formRef={formRef} />
      </ProForm>
    </>
  );
};

export default DockerConfigurationForm;
