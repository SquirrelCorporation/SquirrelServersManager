import {
  SafetyCertificateFill,
  UilDocker,
} from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import { deleteDockerCert } from '@/services/rest/devices/device-credentials';
import { InfoCircleFilled } from '@ant-design/icons';
import {
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { ProForm } from '@ant-design/pro-form/lib';
import message from '@/components/Message/DynamicMessage';
import { Card, Tooltip } from 'antd';
import { RcFile } from 'antd/lib/upload/interface';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { API } from 'ssm-shared-lib';
import InfoLinkWidget from '@/components/Shared/InfoLinkWidget';

interface DockerEngineHostCardProps {
  device: Partial<API.DeviceItem>;
  showAdvanced: boolean;
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
}

const DockerEngineHostCard = ({
  device,
  showAdvanced,
  formRef,
}: DockerEngineHostCardProps) => {
  const handleUpload = (type: string) => (options: any) => {
    const { onSuccess, onError, file } = options;
    const formData = new FormData();

    if (!file) {
      onError?.(new Error('No file provided.'));
      return;
    }

    formData.append('uploaded_file', file as RcFile);

    axios
      .post(`/api/devices/${device.uuid}/auth/upload/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        onSuccess?.(response.data);
      })
      .catch((error) => {
        void message.error({ content: error.message });
        onError?.(error as any);
      });
  };

  const deleteCertFromServer = async (type: 'ca' | 'cert' | 'key') => {
    await deleteDockerCert(device.uuid as string, type).then(() => {
      message.warning({ content: `${type} deleted.` });
    });
  };

  const handleDeleteCert =
    (type: 'ca' | 'cert' | 'key') => async (): Promise<boolean | void> => {
      await deleteCertFromServer(type);
    };

  return (
    <Card
      type="inner"
      title={
        <CardHeader
          title={'Docker Engine Host'}
          color={'#328e9f'}
          icon={<UilDocker />}
        />
      }
      style={{ marginBottom: 10 }}
      styles={{
        header: { height: 45, minHeight: 45, paddingLeft: 15 },
        body: { paddingBottom: 0 },
      }}
      extra={
        <InfoLinkWidget
          tooltipTitle="IP of the host cannot be modified."
          documentationLink="https://squirrelserversmanager.io/docs/user-guides/devices/configuration/docker#docker-engine-host-configuration"
        />
      }
    >
      <ProForm.Group>
        <ProFormText
          name="dockerIp"
          label="Device IP"
          width="sm"
          placeholder="192.168.0.1"
          disabled
          initialValue={device.ip}
          rules={[{ required: true }]}
        />
        <ProFormText
          name="customDockerSocket"
          label="Docker Sock"
          width="sm"
          placeholder="/var/run/docker.sock"
          disabled={!showAdvanced}
          rules={[{ required: false }]}
        />
      </ProForm.Group>
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: showAdvanced ? 1 : 0,
              height: showAdvanced ? 'auto' : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <ProForm.Group
              labelLayout="inline"
              title="TLS (HTTPS) Docker Socket Authentication:"
              collapsible
              defaultCollapsed={false}
              titleStyle={{ marginBottom: 5, padding: 0 }}
            >
              <ProFormUploadButton
                title="Upload CA"
                name="_dockerCa"
                initialValue={
                  formRef?.current?.getFieldValue('dockerCa')
                    ? [
                        {
                          uid: formRef?.current?.getFieldValue('dockerCa'),
                          name: formRef?.current?.getFieldValue('dockerCa'),
                          status: 'success',
                        },
                      ]
                    : []
                }
                max={1}
                fieldProps={{
                  onRemove: handleDeleteCert('ca'),
                  customRequest: handleUpload('ca'),
                  iconRender: () => <SafetyCertificateFill />,
                  accept: '.crt,.pem,.key',
                }}
              />
              <ProFormUploadButton
                title="Upload Cert"
                name="_dockerCert"
                initialValue={
                  formRef?.current?.getFieldValue('dockerCert')
                    ? [
                        {
                          uid: formRef?.current?.getFieldValue('dockerCert'),
                          name: formRef?.current?.getFieldValue('dockerCert'),
                          status: 'success',
                        },
                      ]
                    : []
                }
                max={1}
                fieldProps={{
                  name: 'uploaded_file',
                  onRemove: handleDeleteCert('cert'),
                  iconRender: () => <SafetyCertificateFill />,
                  customRequest: handleUpload('cert'),
                  accept: '.crt,.pem,.key',
                }}
              />
              <ProFormUploadButton
                title="Upload Key"
                name="_dockerKey"
                initialValue={
                  formRef?.current?.getFieldValue('dockerKey')
                    ? [
                        {
                          uid: formRef?.current?.getFieldValue('dockerKey'),
                          name: formRef?.current?.getFieldValue('dockerKey'),
                          status: 'success',
                        },
                      ]
                    : []
                }
                max={1}
                fieldProps={{
                  name: 'uploaded_file',
                  onRemove: handleDeleteCert('key'),
                  customRequest: handleUpload('key'),
                  iconRender: () => <SafetyCertificateFill />,
                  accept: '.crt,.pem,.key',
                }}
              />
            </ProForm.Group>
            <ProForm.Group
              title="Custom Docker Authentication:"
              titleStyle={{ marginBottom: 5, padding: 0 }}
              collapsible
              defaultCollapsed={true}
            >
              <ProFormSwitch
                name="customDockerSSH"
                label={
                  <Tooltip title="Use a different method to connect through SSH for Docker">
                    Use custom Docker SSH Auth
                  </Tooltip>
                }
              />
              <ProFormDependency name={['customDockerSSH']}>
                {({ customDockerSSH }) => {
                  if (customDockerSSH === true) {
                    return (
                      <ProFormSelect
                        label="SSH Connection Type"
                        name="dockerCustomAuthType"
                        width="sm"
                        rules={[{ required: true }]}
                        options={[
                          {
                            value: 'userPwd',
                            label: 'User/Password',
                          },
                          {
                            value: 'keyBased',
                            label: 'Keys',
                          },
                        ]}
                      />
                    );
                  }
                }}
              </ProFormDependency>
            </ProForm.Group>
          </motion.div>
        )}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: showAdvanced ? 1 : 0,
              height: showAdvanced ? 'auto' : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <ProForm.Group>
              <ProFormDependency
                name={['dockerCustomAuthType', 'customDockerSSH']}
              >
                {({ dockerCustomAuthType, customDockerSSH }) => {
                  if (customDockerSSH && dockerCustomAuthType === 'userPwd') {
                    return (
                      <ProForm.Group>
                        <ProFormText
                          name="dockerCustomSshUser"
                          label="SSH User Name"
                          width="xs"
                          placeholder="root"
                          rules={[{ required: true }]}
                        />
                        <ProFormText.Password
                          name="dockerCustomSshPwd"
                          label="SSH Password"
                          width="sm"
                          placeholder="password"
                          rules={[{ required: true }]}
                          fieldProps={{
                            iconRender: (visible) =>
                              typeof formRef?.current?.getFieldValue ===
                                'function' &&
                              formRef?.current?.getFieldValue(
                                'dockerCustomSshPwd',
                              ) !== 'REDACTED'
                                ? visible
                                  ? '🔓'
                                  : '🔒'
                                : undefined,
                            onFocus: () => {
                              if (
                                formRef?.current?.getFieldValue(
                                  'dockerCustomSshPwd',
                                ) === 'REDACTED'
                              ) {
                                formRef?.current?.setFieldValue(
                                  'dockerCustomSshPwd',
                                  '',
                                );
                              }
                            },
                            onBlur: () => {
                              if (
                                formRef?.current?.getFieldValue(
                                  'dockerCustomSshPwd',
                                ) === ''
                              ) {
                                formRef?.current?.resetFields([
                                  'dockerCustomSshPwd',
                                ]);
                              }
                            },
                          }}
                        />
                      </ProForm.Group>
                    );
                  }
                  if (customDockerSSH && dockerCustomAuthType === 'keyBased') {
                    return (
                      <ProForm.Group>
                        <ProFormText
                          name="dockerCustomSshUser"
                          label="SSH User Name"
                          width="xs"
                          placeholder="root"
                          rules={[{ required: true }]}
                        />
                        <ProFormText.Password
                          name="dockerCustomSshKeyPass"
                          label="SSH Key Passphrase"
                          width="xs"
                          placeholder="passphrase"
                          rules={[{ required: false }]}
                          fieldProps={{
                            iconRender: (visible) =>
                              typeof formRef?.current?.getFieldValue ===
                                'function' &&
                              formRef?.current?.getFieldValue(
                                'dockerCustomSshKeyPass',
                              ) !== 'REDACTED'
                                ? visible
                                  ? '🔓'
                                  : '🔒'
                                : undefined,
                            onFocus: () => {
                              if (
                                formRef?.current?.getFieldValue(
                                  'dockerCustomSshKeyPass',
                                ) === 'REDACTED'
                              ) {
                                formRef?.current?.setFieldValue(
                                  'dockerCustomSshKeyPass',
                                  '',
                                );
                              }
                            },
                            onBlur: () => {
                              if (
                                formRef?.current?.getFieldValue(
                                  'dockerCustomSshKeyPass',
                                ) === ''
                              ) {
                                formRef?.current?.resetFields([
                                  'dockerCustomSshKeyPass',
                                ]);
                              }
                            },
                          }}
                        />
                        <ProFormTextArea
                          name="dockerCustomSshKey"
                          label="SSH Private Key"
                          width="md"
                          placeholder="root"
                          rules={[
                            { required: true },
                            { required: true },
                            {
                              pattern:
                                /^-----BEGIN (.+?)-----\n([A-Za-z0-9+/=\n]+)\n-----END (.+?)-----$/,
                              message:
                                'The ssh key doesnt seems in a correct format',
                            },
                          ]}
                          fieldProps={{
                            style: {
                              fontFamily: 'monospace',
                            },
                            onFocus: () => {
                              if (
                                formRef?.current?.getFieldValue(
                                  'dockerCustomSshKey',
                                ) === 'REDACTED'
                              ) {
                                formRef?.current?.setFieldValue(
                                  'dockerCustomSshKey',
                                  '',
                                );
                              }
                            },
                            onBlur: () => {
                              if (
                                formRef?.current?.getFieldValue(
                                  'dockerCustomSshKey',
                                ) === ''
                              ) {
                                formRef?.current?.resetFields([
                                  'dockerCustomSshKey',
                                ]);
                              }
                            },
                          }}
                        />
                      </ProForm.Group>
                    );
                  }
                }}
              </ProFormDependency>
            </ProForm.Group>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default DockerEngineHostCard;
