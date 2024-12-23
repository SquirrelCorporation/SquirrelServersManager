import SSHConnectionFormElements from '@/components/DeviceConfiguration/SSHConnectionFormElements';
import { getDeviceAuth, putDeviceAuth } from '@/services/rest/deviceauth';
import { ProFormInstance } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import { message, Space } from 'antd';
import React, { useRef } from 'react';
import { API } from 'ssm-shared-lib';

export type ConfigurationFormSSHProps = {
  values: Partial<API.DeviceItem>;
};

const SSHConfigurationFormTab: React.FC<ConfigurationFormSSHProps> = (
  props,
) => {
  const formRef = useRef<ProFormInstance | undefined>();
  return (
    <>
      <ProForm
        layout="horizontal"
        formRef={formRef}
        submitter={{
          searchConfig: { submitText: 'Save' },
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
            await putDeviceAuth(props.values.uuid, {
              sshPort: values.sshPort,
              authType: values.authType,
              sshUser: values.sshUser,
              sshPwd: values.sshPwd,
              sshKey: values.sshKey,
              sshConnection: values.sshConnection,
              sshKeyPass: values.sshKeyPass,
              becomeUser: values.becomeUser,
              becomeMethod: values.becomeMethod,
              becomePass: values.becomePass,
              strictHostChecking: values.strictHostChecking,
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
                sshPort: res.data.sshPort,
                authType: res.data.authType,
                sshUser: res.data.sshUser,
                sshPwd: res.data.sshPwd,
                sshKey: res.data.sshKey,
                sshConnection: res.data.sshConnection,
                sshKeyPass: res.data.sshKeyPass,
                becomeUser: res.data.becomeUser,
                becomeMethod: res.data.becomeMethod,
                becomePass: res.data.becomePass,
                strictHostChecking: res.data.strictHostChecking,
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
        <SSHConnectionFormElements
          deviceIp={props.values.ip}
          formRef={formRef}
        />
      </ProForm>
    </>
  );
};

export default SSHConfigurationFormTab;
