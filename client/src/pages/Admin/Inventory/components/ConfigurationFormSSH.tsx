import React from 'react';
import { message } from 'antd';
import { ProForm } from '@ant-design/pro-form/lib';
import SSHConnectionForm from '@/components/SSHConnectionForm/SSHConnectionForm';
import { getDeviceAuth, putDeviceAuth } from '@/services/rest/deviceauth';

export type ConfigurationFormSSHProps = {
  values: Partial<API.DeviceItem>;
};

const ConfigurationFormSSH: React.FC<ConfigurationFormSSHProps> = (props) => {
  return (
    <>
      <ProForm
        layout="vertical"
        grid={false}
        rowProps={{
          gutter: [16, 0],
        }}
        submitter={{
          // eslint-disable-next-line @typescript-eslint/no-shadow
          render: (props, doms) => {
            return doms;
          },
        }}
        onFinish={async (values) => {
          await putDeviceAuth(props.values.uuid, {
            sshPort: values.sshPort,
            type: values.type,
            sshUser: values.sshUser,
            sshPwd: values.sshPwd,
            sshKey: values.sshKey,
          })
            .then(() => {
              message.success({ content: 'Configuration updated', duration: 6 });
            })
            .catch((error) => {
              message.error({
                content: `Configuration update failed (${error.message})`,
                duration: 6,
              });
            });
        }}
        request={async () => {
          return await getDeviceAuth(props.values.uuid).then((res) => {
            return {
              sshPort: res.data.sshPort,
              type: res.data.type,
              sshUser: res.data.sshUser,
              sshPwd: res.data.sshPwd,
              sshKey: res.data.sshKey,
            };
          });
        }}
      >
        <SSHConnectionForm />
      </ProForm>
    </>
  );
};

export default ConfigurationFormSSH;
