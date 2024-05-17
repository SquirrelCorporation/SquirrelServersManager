import React from 'react';
import { Space, message } from 'antd';
import { ProForm } from '@ant-design/pro-form/lib';
import SSHConnectionForm from '@/components/DeviceConfiguration/SSHConnectionForm';
import { getDeviceAuth, putDeviceAuth } from '@/services/rest/deviceauth';
import { API } from 'ssm-shared-lib';

export type ConfigurationFormSSHProps = {
  values: Partial<API.DeviceItem>;
};

const SSHConfigurationForm: React.FC<ConfigurationFormSSHProps> = (props) => {
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
            await putDeviceAuth(props.values.uuid, {
              sshPort: values.sshPort,
              authType: values.authType,
              sshUser: values.sshUser,
              sshPwd: values.sshPwd,
              sshKey: values.sshKey,
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
        <SSHConnectionForm deviceIp={props.values.ip} />
      </ProForm>
    </>
  );
};

export default SSHConfigurationForm;
