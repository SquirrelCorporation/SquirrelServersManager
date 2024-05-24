import { DockerConnectionForm } from '@/components/DeviceConfiguration/DockerConnectionForm';
import { getDeviceAuth, putDeviceDockerAuth } from '@/services/rest/deviceauth';
import { ProForm } from '@ant-design/pro-form/lib';
import { message, Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

export type DockerConfigurationFormProps = {
  values: Partial<API.DeviceItem>;
};

const DockerConfigurationForm: React.FC<DockerConfigurationFormProps> = (
  props,
) => {
  return (
    <>
      <ProForm
        layout="horizontal"
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
          if (props?.values?.uuid && values) {
            await putDeviceDockerAuth(props.values.uuid, {
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
          if (props?.values?.uuid) {
            return await getDeviceAuth(props.values.uuid).then((res) => {
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
        <DockerConnectionForm
          deviceIp={props.values.ip}
          dockerWatcher={props.values.dockerWatcher}
          dockerWatcherCron={props.values.dockerWatcherCron}
          deviceUuid={props.values.uuid}
        />
      </ProForm>
    </>
  );
};

export default DockerConfigurationForm;
