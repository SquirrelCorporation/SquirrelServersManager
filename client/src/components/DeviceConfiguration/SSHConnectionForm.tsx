import {
  EosIconsAdmin,
  GrommetIconsHost,
  StreamlineLockRotationSolid,
} from '@/components/Icons/CustomIcons';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleFilled,
} from '@ant-design/icons';
import {
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Avatar, Card, Col, Flex, Row, Space, Switch, Tooltip } from 'antd';
import React from 'react';
import { AnsibleBecomeMethod } from 'ssm-shared-lib/distribution/enums/ansible';
import { privateKeyRegexp } from 'ssm-shared-lib/distribution/validation';

const connectionTypes = [
  {
    value: 'userPwd',
    label: 'User/Password',
  },
  { value: 'keyBased', label: 'Keys' },
];

export type SSHConnectionFormProps = {
  deviceIp?: string;
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
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
            options={Object.values(AnsibleBecomeMethod).map((e) => ({
              value: e,
              label: e,
            }))}
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
            fieldProps={{
              iconRender: (visible) =>
                typeof props.formRef?.current?.getFieldValue === 'function' &&
                props.formRef?.current?.getFieldValue('becomePass') !==
                  'REDACTED' ? (
                  visible ? (
                    <EyeTwoTone />
                  ) : (
                    <EyeInvisibleOutlined />
                  )
                ) : undefined,
              onFocus: () => {
                if (
                  props.formRef?.current?.getFieldValue('becomePass') ===
                  'REDACTED'
                ) {
                  props.formRef?.current?.setFieldValue('becomePass', '');
                }
              },
              onBlur: () => {
                if (
                  props.formRef?.current?.getFieldValue('becomePass') === ''
                ) {
                  props.formRef?.current?.resetFields(['becomePass']);
                }
              },
            }}
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
                      fieldProps={{
                        iconRender: (visible) =>
                          typeof props.formRef?.current?.getFieldValue ===
                            'function' &&
                          props.formRef?.current?.getFieldValue('sshPwd') !==
                            'REDACTED' ? (
                            visible ? (
                              <EyeTwoTone />
                            ) : (
                              <EyeInvisibleOutlined />
                            )
                          ) : undefined,
                        onFocus: () => {
                          if (
                            props.formRef?.current?.getFieldValue('sshPwd') ===
                            'REDACTED'
                          ) {
                            props.formRef?.current?.setFieldValue('sshPwd', '');
                          }
                        },
                        onBlur: () => {
                          if (
                            props.formRef?.current?.getFieldValue('sshPwd') ===
                            ''
                          ) {
                            props.formRef?.current?.resetFields(['sshPwd']);
                          }
                        },
                      }}
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
                      fieldProps={{
                        iconRender: (visible) =>
                          typeof props.formRef?.current?.getFieldValue ===
                            'function' &&
                          props.formRef?.current?.getFieldValue(
                            'sshKeyPass',
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
                              'sshKeyPass',
                            ) === 'REDACTED'
                          ) {
                            props.formRef?.current?.setFieldValue(
                              'sshKeyPass',
                              '',
                            );
                          }
                        },
                        onBlur: () => {
                          if (
                            props.formRef?.current?.getFieldValue(
                              'sshKeyPass',
                            ) === ''
                          ) {
                            props.formRef?.current?.resetFields(['sshKeyPass']);
                          }
                        },
                      }}
                    />
                    <ProFormTextArea
                      name="sshKey"
                      label="SSH Private Key"
                      width="md"
                      placeholder="root"
                      rules={[
                        { required: true },
                        {
                          pattern: privateKeyRegexp,
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
                            props.formRef?.current?.getFieldValue('sshKey') ===
                            'REDACTED'
                          ) {
                            props.formRef?.current?.setFieldValue('sshKey', '');
                          }
                        },
                        onBlur: () => {
                          if (
                            props.formRef?.current?.getFieldValue('sshKey') ===
                            ''
                          ) {
                            props.formRef?.current?.resetFields(['sshKey']);
                          }
                        },
                      }}
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
