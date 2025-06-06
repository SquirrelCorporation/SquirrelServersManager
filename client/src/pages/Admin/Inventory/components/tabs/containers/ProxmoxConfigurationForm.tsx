import ProxmoxConfigurationFormElements from '@/components/DeviceConfiguration/ProxmoxConfigurationFormElements';
import {
  getDeviceAuth,
  postCheckDeviceProxmoxAuth,
  updateDeviceProxmoxAuth,
} from '@/services/rest/devices/device-credentials';
import { ProFormInstance } from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import message from '@/components/Message/DynamicMessage';
import { Button, Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

export type ProxmoxConfigurationFormProps = {
  device: Partial<API.DeviceItem>;
};

const ProxmoxConfigurationForm: React.FC<ProxmoxConfigurationFormProps> = ({
  device,
}) => {
  const formRef = React.useRef<ProFormInstance | undefined>();

  const handleOnClickTestConnection = async () => {
    message.loading({ key: 'loading', content: 'Testing connection...' });
    await postCheckDeviceProxmoxAuth(
      device?.uuid as string,
      formRef.current?.getFieldsValue(),
    )
      .then((res) => {
        message.destroy('loading');
        if (res?.data?.connectionStatus === 'successful') {
          message.success({
            content: `Connection successful, ${res.data?.nodes?.length} nodes found`,
            duration: 6,
          });
        } else {
          message.error({
            content: `Connection failed (${res?.data?.errorMessage})`,
            duration: 6,
          });
        }
      })
      .catch(() => {
        message.destroy('loading');
      });
  };
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
                  <Button onClick={handleOnClickTestConnection}>
                    Test Connection
                  </Button>
                  {doms}
                </Space>
              </div>
            );
          },
        }}
        onFinish={async (values) => {
          if (device?.uuid && values) {
            await updateDeviceProxmoxAuth(
              device.uuid,
              values as API.ProxmoxAuth,
            )
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
          if (device?.uuid) {
            return await getDeviceAuth(device.uuid).then((res) => {
              return res.data?.proxmoxAuth || {};
            });
          } else {
            message.error({
              content: `Internal - Calling Configuration modal without uuid`,
              duration: 6,
            });
          }
        }}
      >
        <ProxmoxConfigurationFormElements device={device} formRef={formRef} />
      </ProForm>
    </>
  );
};

export default ProxmoxConfigurationForm;
