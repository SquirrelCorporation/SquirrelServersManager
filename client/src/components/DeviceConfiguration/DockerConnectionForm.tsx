import {
  OuiMlCreateAdvancedJob,
  UilDocker,
} from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import { updateDeviceDockerWatcher } from '@/services/rest/device';
import { FieldTimeOutlined, InfoCircleFilled } from '@ant-design/icons';
import {
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Card, Flex, message, Space, Switch, Tooltip, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import Cron from 'react-js-cron';
import 'react-js-cron/dist/styles.css';

const connectionTypes = [
  {
    value: 'userPwd',
    label: 'User/Password',
  },
  { value: 'keyBased', label: 'Keys' },
];

export type ConfigurationFormDockerProps = {
  deviceUuid: string;
  deviceIp?: string;
  dockerWatcher?: boolean;
  dockerWatcherCron?: string;
};

export const DockerConnectionForm = (props: ConfigurationFormDockerProps) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [dockerWatcher, setDockerWatcher] = React.useState(
    props.dockerWatcher || true,
  );
  const [dockerWatcherCron, setDockerWatcherCron] = useState(
    props.dockerWatcherCron,
  );

  const handleOnChangeDockerWatcher = async () => {
    await updateDeviceDockerWatcher(props.deviceUuid, dockerWatcher).then(
      (data) => {
        setDockerWatcher(data.dockerWatcher);
        message.success({ content: 'Setting updated' });
      },
    );
  };
  const handleOnChangeDockerWatcherCron = async () => {
    await updateDeviceDockerWatcher(
      props.deviceUuid,
      dockerWatcher,
      dockerWatcherCron,
    ).then(() => {
      message.success({ content: 'Setting updated' });
    });
  };
  useEffect(() => {
    if (props.dockerWatcherCron !== dockerWatcherCron) {
      handleOnChangeDockerWatcherCron();
    }
  }, [dockerWatcherCron]);
  return (
    <>
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
            initialValue={props.deviceIp}
            rules={[{ required: true }]}
          />
          <ProFormSwitch
            checkedChildren={'Watch Docker containers'}
            unCheckedChildren={'Docker containers not watched'}
            fieldProps={{
              value: dockerWatcher,
              onChange: handleOnChangeDockerWatcher,
            }}
          />
          {showAdvanced && (
            <>
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
            </>
          )}
        </ProForm.Group>
        {showAdvanced && (
          <ProForm.Group>
            <ProFormDependency name={['dockerCustomAuthType']}>
              {({ dockerCustomAuthType }) => {
                if (dockerCustomAuthType === 'userPwd')
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
                      />
                    </ProForm.Group>
                  );
                if (dockerCustomAuthType === 'keyBased')
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
                      />
                      <ProFormTextArea
                        name="dockerCustomSshKey"
                        label="SSH Private Key"
                        width="md"
                        placeholder="root"
                        rules={[{ required: true }]}
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
            title={'Docker Watcher Cron'}
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
        <Space direction={'horizontal'} style={{ width: '100%' }}>
          <Cron
            value={dockerWatcherCron || ''}
            setValue={setDockerWatcherCron}
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
