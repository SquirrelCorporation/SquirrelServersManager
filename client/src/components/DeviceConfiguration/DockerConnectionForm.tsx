import {
  EosIconsCronjob,
  OuiMlCreateAdvancedJob,
  SafetyCertificateFill,
  UilDocker,
} from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import { updateDeviceDockerWatcher } from '@/services/rest/device';
import { deleteDockerCert } from '@/services/rest/deviceauth';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  FieldTimeOutlined,
  InfoCircleFilled,
} from '@ant-design/icons';
import {
  ProForm,
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { Card, Flex, message, Space, Switch, Tooltip } from 'antd';
import { RcFile } from 'antd/lib/upload/interface';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Cron from 'react-js-cron';
import 'react-js-cron/dist/styles.css';
import { API, Validation } from 'ssm-shared-lib';

const connectionTypes = [
  {
    value: 'userPwd',
    label: 'User/Password',
  },
  { value: 'keyBased', label: 'Keys' },
];

export type ConfigurationFormDockerProps = {
  device: Partial<API.DeviceItem>;
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
};

export const DockerConnectionForm = (props: ConfigurationFormDockerProps) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [dockerWatcher, setDockerWatcher] = React.useState(
    props.device.dockerWatcher === undefined
      ? true
      : props.device.dockerWatcher,
  );
  const [dockerWatcherCron, setDockerWatcherCron] = useState(
    props.device.dockerWatcherCron,
  );
  const [dockerStatsCron, setDockerStatsCron] = useState(
    props.device.dockerStatsCron,
  );
  const [dockerStatsWatcher, setDockerStatsWatcher] = React.useState(
    props.device.dockerStatsWatcher,
  );
  const [dockerEventsWatcher, setDockerEventsWatcher] = React.useState(
    props.device.dockerEventsWatcher === undefined
      ? true
      : props.device.dockerEventsWatcher,
  );
  const handleOnChangeDockerWatcher = async () => {
    if (props.device.uuid) {
      await updateDeviceDockerWatcher(props.device.uuid, {
        dockerWatcher: !dockerWatcher,
        dockerStatsWatcher: dockerStatsWatcher,
        dockerEventsWatcher: dockerEventsWatcher,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        message.success({ content: 'Setting updated' });
      });
    } else {
      message.error({ content: 'Internal error - no device id' });
    }
  };

  const handleOnChangeStatsWatcher = async () => {
    if (props.device.uuid) {
      await updateDeviceDockerWatcher(props.device.uuid, {
        dockerWatcher: dockerWatcher,
        dockerStatsWatcher: !dockerStatsWatcher,
        dockerEventsWatcher: dockerEventsWatcher,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        message.success({ content: 'Setting updated' });
      });
    } else {
      message.error({ content: 'Internal error - no device id' });
    }
  };

  const handleOnChangeEventsWatcher = async () => {
    if (props.device.uuid) {
      await updateDeviceDockerWatcher(props.device.uuid, {
        dockerWatcher: dockerWatcher,
        dockerStatsWatcher: dockerStatsWatcher,
        dockerEventsWatcher: !dockerEventsWatcher,
      }).then((response) => {
        setDockerWatcher(response.data.dockerWatcher);
        setDockerEventsWatcher(response.data.dockerEventsWatcher);
        setDockerStatsWatcher(response.data.dockerStatsWatcher);
        message.success({ content: 'Setting updated' });
      });
    } else {
      message.error({ content: 'Internal error - no device id' });
    }
  };

  const handleOnChangeDockerWatcherCron = async () => {
    if (props.device.uuid) {
      await updateDeviceDockerWatcher(props.device.uuid, {
        dockerWatcher,
        dockerStatsWatcher,
        dockerEventsWatcher,
        dockerWatcherCron,
        dockerStatsCron,
      }).then(() => {
        message.success({ content: 'Setting updated' });
      });
    } else {
      message.error({ content: 'Internal error - no device id' });
    }
  };
  useEffect(() => {
    if (
      props.device.dockerWatcherCron !== dockerWatcherCron ||
      props.device.dockerStatsCron != dockerStatsCron
    ) {
      handleOnChangeDockerWatcherCron();
    }
  }, [dockerWatcherCron, dockerStatsCron]);

  const handleUpload = (type: string) => (options: any) => {
    const { onSuccess, onError, file } = options;
    const formData = new FormData();

    if (!file) {
      onError?.(new Error('No file provided.'));
      return;
    }

    formData.append('uploaded_file', file as RcFile); // Ensure it matches 'uploaded_file'

    axios
      .post(`/api/devices/${props.device.uuid}/auth/upload/${type}`, formData, {
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
    await deleteDockerCert(props.device.uuid as string, type).then(() => {
      message.warning({ content: `${type} deleted.` });
    });
  };

  const handleDeleteCert =
    (type: 'ca' | 'cert' | 'key') => async (): Promise<boolean | void> => {
      await deleteCertFromServer(type);
    };

  return (
    <>
      <Card
        type="inner"
        title={
          <CardHeader
            title={'Watch'}
            color={'#4d329f'}
            icon={<EosIconsCronjob />}
          />
        }
        style={{ marginBottom: 10 }}
        styles={{
          header: { height: 45, minHeight: 45, paddingLeft: 15 },
          body: { paddingBottom: 0 },
        }}
        extra={
          <>
            <Tooltip
              title={
                <>
                  Activate or deactivate cronjobs on this device: <br />
                  &quot;Watch Container&quot; will check updates of your
                  container,
                  <br />
                  &quot;Watch Container Stats&quot; will pull container
                  statistics, <br />
                  &quot;Watch Container Events&quot; will listen to any change
                  of status
                </>
              }
            >
              <InfoCircleFilled />
            </Tooltip>
          </>
        }
      >
        <ProForm.Group>
          <ProFormSwitch
            checkedChildren={'Watch Containers'}
            unCheckedChildren={'Containers not watched'}
            fieldProps={{
              value: dockerWatcher,
              onChange: handleOnChangeDockerWatcher,
            }}
          />
          <ProFormSwitch
            checkedChildren={'Watch Containers Stats'}
            unCheckedChildren={'Containers stats not watched'}
            fieldProps={{
              value: dockerStatsWatcher,
              onChange: handleOnChangeStatsWatcher,
            }}
          />
          <ProFormSwitch
            checkedChildren={'Watch Container Events'}
            unCheckedChildren={'Containers events not watched'}
            fieldProps={{
              value: dockerEventsWatcher,
              onChange: handleOnChangeEventsWatcher,
            }}
          />
        </ProForm.Group>
      </Card>
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
          <>
            <Tooltip
              title={
                'Ip of the host cannot be modified. Disable/Enable containers watch, or specify in advanced options a different SSH connection method'
              }
            >
              <InfoCircleFilled />
            </Tooltip>
          </>
        }
      >
        <ProForm.Group>
          <ProFormText
            name="dockerIp"
            label="Device IP"
            width="sm"
            placeholder="192.168.0.1"
            disabled
            initialValue={props.device.ip}
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
        {showAdvanced && (
          <>
            <ProForm.Group
              labelLayout={'inline'}
              title={'TLS (HTTPS) Docker Socket Authentication:'}
              collapsible
              defaultCollapsed={false}
              titleStyle={{ marginBottom: 5, padding: 0 }}
            >
              <ProFormUploadButton
                title={'Upload CA'}
                name="ca"
                initialValue={[
                  {
                    uid: '-2',
                    name: 'zzz.png',
                    status: 'error',
                  },
                ]}
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
                name="cert"
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
                name="key"
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
              title={'Custom Docker Authentication:'}
              titleStyle={{ marginBottom: 5, padding: 0 }}
              collapsible
              defaultCollapsed={true}
            >
              <ProFormSwitch
                name={'customDockerSSH'}
                label={
                  <Tooltip
                    title={
                      'Use a different method to connect through SSH for Docker'
                    }
                  >
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
                        options={connectionTypes}
                      />
                    );
                  }
                }}
              </ProFormDependency>
            </ProForm.Group>
          </>
        )}
        {showAdvanced && (
          <ProForm.Group>
            <ProFormDependency
              name={['dockerCustomAuthType', 'customDockerSSH']}
            >
              {({ dockerCustomAuthType, customDockerSSH }) => {
                if (customDockerSSH && dockerCustomAuthType === 'userPwd')
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
                            typeof props.formRef?.current?.getFieldValue ===
                              'function' &&
                            props.formRef?.current?.getFieldValue(
                              'dockerCustomSshPwd',
                            ) !== 'REDACTED' ? (
                              visible ? (
                                <EyeTwoTone />
                              ) : (
                                <EyeInvisibleOutlined />
                              )
                            ) : undefined,
                          onFocus: () => {
                            if (
                              props.formRef?.current?.getFieldValue(
                                'dockerCustomSshPwd',
                              ) === 'REDACTED'
                            ) {
                              props.formRef?.current?.setFieldValue(
                                'dockerCustomSshPwd',
                                '',
                              );
                            }
                          },
                          onBlur: () => {
                            if (
                              props.formRef?.current?.getFieldValue(
                                'dockerCustomSshPwd',
                              ) === ''
                            ) {
                              props.formRef?.current?.resetFields([
                                'dockerCustomSshPwd',
                              ]);
                            }
                          },
                        }}
                      />
                    </ProForm.Group>
                  );
                if (customDockerSSH && dockerCustomAuthType === 'keyBased')
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
                            typeof props.formRef?.current?.getFieldValue ===
                              'function' &&
                            props.formRef?.current?.getFieldValue(
                              'dockerCustomSshKeyPass',
                            ) !== 'REDACTED' ? (
                              visible ? (
                                <EyeTwoTone />
                              ) : (
                                <EyeInvisibleOutlined />
                              )
                            ) : undefined,
                          onFocus: () => {
                            if (
                              props.formRef?.current?.getFieldValue(
                                'dockerCustomSshKeyPass',
                              ) === 'REDACTED'
                            ) {
                              props.formRef?.current?.setFieldValue(
                                'dockerCustomSshKeyPass',
                                '',
                              );
                            }
                          },
                          onBlur: () => {
                            if (
                              props.formRef?.current?.getFieldValue(
                                'dockerCustomSshKeyPass',
                              ) === ''
                            ) {
                              props.formRef?.current?.resetFields([
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
                            pattern: Validation.privateKeyRegexp,
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
                              props.formRef?.current?.getFieldValue(
                                'dockerCustomSshKey',
                              ) === 'REDACTED'
                            ) {
                              props.formRef?.current?.setFieldValue(
                                'dockerCustomSshKey',
                                '',
                              );
                            }
                          },
                          onBlur: () => {
                            if (
                              props.formRef?.current?.getFieldValue(
                                'dockerCustomSshKey',
                              ) === ''
                            ) {
                              props.formRef?.current?.resetFields([
                                'dockerCustomSshKey',
                              ]);
                            }
                          },
                        }}
                      />
                    </ProForm.Group>
                  );
              }}
            </ProFormDependency>
          </ProForm.Group>
        )}
      </Card>
      <Card
        type="inner"
        title={
          <CardHeader
            title={'Watcher Crons'}
            color={'#3c8036'}
            icon={<FieldTimeOutlined />}
          />
        }
        style={{ marginBottom: 10 }}
        styles={{
          header: { height: 45, minHeight: 45, paddingLeft: 15 },
          body: { paddingBottom: 0 },
        }}
      >
        Watch Containers:{' '}
        <Space
          direction={'horizontal'}
          style={{ width: '100%', marginTop: '5px', marginLeft: '10px' }}
        >
          <Cron
            value={dockerWatcherCron || ''}
            setValue={setDockerWatcherCron}
            clearButton={false}
          />
        </Space>
        Watch Containers Stats:
        <Space
          direction={'horizontal'}
          style={{ width: '100%', marginTop: '5px', marginLeft: '10px' }}
        >
          <Cron
            value={dockerStatsCron || ''}
            setValue={setDockerStatsCron}
            clearButton={false}
          />
        </Space>
      </Card>
      {showAdvanced && (
        <Card
          type="inner"
          title={
            <CardHeader
              title={'Docker Advanced Connection'}
              color={'#1e4f5a'}
              icon={<OuiMlCreateAdvancedJob />}
            />
          }
          style={{ marginBottom: 10 }}
          styles={{
            header: { height: 45, minHeight: 45, paddingLeft: 15 },
            body: { paddingBottom: 0 },
          }}
        >
          <ProForm.Group>
            <ProFormDependency name={['customDockerForcev4']}>
              {({ customDockerForcev4 }) => (
                <ProFormSwitch
                  name={'customDockerForcev6'}
                  label={
                    <Tooltip
                      title={'Only connect via resolved IPv4 address for host.'}
                    >
                      Force IPV6
                    </Tooltip>
                  }
                  disabled={customDockerForcev4}
                />
              )}
            </ProFormDependency>
            <ProFormDependency name={['customDockerForcev6']}>
              {({ customDockerForcev6 }) => (
                <ProFormSwitch
                  name={'customDockerForcev4'}
                  label={
                    <Tooltip
                      title={'Only connect via resolved IPv6 address for host.'}
                    >
                      Force IPV4
                    </Tooltip>
                  }
                  disabled={customDockerForcev6}
                />
              )}
            </ProFormDependency>
            <ProFormSwitch
              name={'customDockerAgentForward'}
              label={
                <Tooltip
                  title={
                    'Use OpenSSH agent forwarding (auth-agent@openssh. com) for the life of the connection.'
                  }
                >
                  Agent Forward
                </Tooltip>
              }
            />
            <ProFormSwitch
              name={'customDockerTryKeyboard'}
              label={
                <Tooltip
                  title={
                    'Try keyboard-interactive user authentication if primary user authentication method fails.'
                  }
                >
                  Try keyboard
                </Tooltip>
              }
            />
          </ProForm.Group>
        </Card>
      )}
      <Flex
        style={{
          marginBottom: 10,
        }}
      >
        <Space
          direction="horizontal"
          size="middle"
          style={{ marginLeft: 'auto' }}
        >
          Show advanced
          <Switch
            size="small"
            value={showAdvanced}
            onChange={() => setShowAdvanced(!showAdvanced)}
          />
        </Space>
      </Flex>
    </>
  );
};
