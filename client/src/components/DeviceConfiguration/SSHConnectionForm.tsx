import {
  EosIconsAdmin,
  GrommetIconsHost,
  StreamlineLockRotationSolid,
} from '@/components/Icons/CustomIcons';
import { InfoCircleFilled } from '@ant-design/icons';
import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Avatar, Card, Col, Flex, Row, Space, Switch, Tooltip } from 'antd';
import React from 'react';

const connectionTypes = [
  {
    value: 'userPwd',
    label: 'User/Password',
  },
  { value: 'keyBased', label: 'Keys' },
];

export type SSHConnectionFormProps = {
  deviceIp?: string;
};

const SSHConnectionForm: React.FC<SSHConnectionFormProps> = (props) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  return (
    <>
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: '#4e246a' }}
                shape="square"
                icon={<GrommetIconsHost />}
              />
            </Col>
            <Col
              style={{
                marginLeft: 10,
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              Host
            </Col>
          </Row>
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
                'Enter the IP and SSH port. Please note that Ipv6 is not supported yet.'
              }
            >
              <InfoCircleFilled />
            </Tooltip>
          </>
        }
      >
        <ProForm.Group>
          <ProFormText
            name="deviceIp"
            label="Device IP"
            width="sm"
            placeholder="192.168.0.1"
            disabled={props.deviceIp !== undefined}
            initialValue={props.deviceIp}
            rules={[
              { required: true },
              {
                pattern: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/,
                message: 'Please enter a valid IP (we do not support v6 yet)',
              },
            ]}
          />
          <ProFormDigit
            name="sshPort"
            label="SSH Port"
            width="xs"
            initialValue={22}
            rules={[
              { required: true },
              {
                pattern: /^[0-9]+$/,
                message: 'Please enter a number',
              },
            ]}
            fieldProps={{ precision: 0 }}
          />
          {showAdvanced && (
            <ProFormSwitch
              name={'strictHostChecking'}
              label={'Strict Host Checking'}
              initialValue={true}
            />
          )}
        </ProForm.Group>
      </Card>
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: '#37246a' }}
                shape="square"
                icon={<EosIconsAdmin />}
              />
            </Col>
            <Col
              style={{
                marginLeft: 10,
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              Super User
            </Col>
          </Row>
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
                'To enable "Ansible Become" feature for sudo operations, fill the sudo method and sudo user & password. Passwords are saved using Vault.'
              }
            >
              <InfoCircleFilled />
            </Tooltip>
          </>
        }
      >
        <ProForm.Group>
          <ProFormSelect
            label="Sudo Method"
            name="becomeMethod"
            rules={[
              {
                required: true,
              },
            ]}
            width="xs"
            options={[
              {
                value: 'sudo',
                label: 'sudo',
              },
              {
                value: 'su',
                label: 'su',
              },
              {
                value: 'pbrun',
                label: 'pbrun',
              },
              {
                value: 'pfexec',
                label: 'pfexec',
              },
              {
                value: 'doas',
                label: 'doas',
              },
              {
                value: 'dzdo',
                label: 'dzdo',
              },
              {
                value: 'ksu',
                label: 'ksu',
              },
              {
                value: 'runas',
                label: 'runas',
              },
              {
                value: 'machinectl',
                label: 'machinectl',
              },
            ]}
          />
          <ProFormText
            name="becomeUser"
            label="Sudo User"
            width="xs"
            placeholder="root"
          />
          <ProFormText.Password
            name="becomePass"
            label="Sudo Password"
            width="sm"
            placeholder="password"
          />
        </ProForm.Group>
      </Card>
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: '#6a0a18' }}
                shape="square"
                icon={<StreamlineLockRotationSolid />}
              />
            </Col>
            <Col
              style={{
                marginLeft: 10,
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              Authentication
            </Col>
          </Row>
        }
        style={{ marginBottom: 10 }}
        styles={{
          header: { height: 45, minHeight: 45, paddingLeft: 15 },
          body: { paddingBottom: 0 },
        }}
        extra={
          <Tooltip
            title={
              'Fill the ssh connection information, User/Password or SSH key to allow SSM to connect to your device. Passwords are saved using Vault.'
            }
          >
            <InfoCircleFilled />
          </Tooltip>
        }
      >
        <ProForm.Group>
          <ProFormSelect
            label="SSH Connection Type"
            name="authType"
            rules={[
              {
                required: true,
              },
            ]}
            width="sm"
            options={connectionTypes}
          />
          <ProFormDependency name={['authType']}>
            {({ authType }) => {
              if (authType === 'userPwd')
                return (
                  <ProForm.Group>
                    <ProFormText
                      name="sshUser"
                      label="SSH User Name"
                      width="xs"
                      placeholder="root"
                      rules={[{ required: true }]}
                    />
                    <ProFormText.Password
                      name="sshPwd"
                      label="SSH Password"
                      width="sm"
                      placeholder="password"
                      rules={[{ required: true }]}
                    />
                  </ProForm.Group>
                );
              if (authType === 'keyBased')
                return (
                  <ProForm.Group>
                    <ProFormText
                      name="sshUser"
                      label="SSH User Name"
                      width="xs"
                      placeholder="root"
                      rules={[{ required: true }]}
                    />
                    <ProFormText.Password
                      name="sshKeyPass"
                      label="SSH Key Passphrase"
                      width="xs"
                      placeholder="passphrase"
                      rules={[{ required: false }]}
                    />
                    <ProFormTextArea
                      name="sshKey"
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
      </Card>
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

export default SSHConnectionForm;
