import { StreamlineLockRotationSolid } from '@/components/Icons/CustomIcons';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleFilled,
} from '@ant-design/icons';
import {
  ProForm,
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Avatar, Card, Col, Row, Tooltip } from 'antd';
import React from 'react';
import { SsmAnsible, Validation } from 'ssm-shared-lib';

export type AuthenticationCardProps = {
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
};

const connectionTypes = [
  { value: SsmAnsible.SSHType.UserPassword.valueOf(), label: 'User/Password' },
  { value: SsmAnsible.SSHType.KeyBased.valueOf(), label: 'Keys' },
  { value: SsmAnsible.SSHType.Automatic.valueOf(), label: 'Automatic' },
];

const AuthenticationCard: React.FC<AuthenticationCardProps> = ({ formRef }) => (
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
          style={{ marginLeft: 10, marginTop: 'auto', marginBottom: 'auto' }}
        >
          Authentication
        </Col>
      </Row>
    }
    style={{ marginBottom: 10 }}
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
      <ProFormDependency name={['sshConnection']}>
        {({ sshConnection }) => (
          <ProFormSelect
            label="SSH Connection Type"
            name="authType"
            rules={[
              { required: true },
              {
                validator(_, value) {
                  if (
                    (!sshConnection ||
                      sshConnection === SsmAnsible.SSHConnection.PARAMIKO) &&
                    value == SsmAnsible.SSHType.Automatic
                  ) {
                    return Promise.reject(
                      'You must use regular SSH for automatic authentication',
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            width="sm"
            options={connectionTypes}
          />
        )}
      </ProFormDependency>
      <ProFormDependency name={['authType']}>
        {({ authType }) => {
          if (authType === SsmAnsible.SSHType.UserPassword.valueOf()) {
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
                      typeof formRef.current?.getFieldValue === 'function' &&
                      formRef.current?.getFieldValue('sshPwd') !==
                        'REDACTED' ? (
                        visible ? (
                          <EyeTwoTone />
                        ) : (
                          <EyeInvisibleOutlined />
                        )
                      ) : undefined,
                    onFocus: () => {
                      if (
                        formRef.current?.getFieldValue('sshPwd') === 'REDACTED'
                      ) {
                        formRef.current?.setFieldValue('sshPwd', '');
                      }
                    },
                    onBlur: () => {
                      if (formRef.current?.getFieldValue('sshPwd') === '') {
                        formRef.current?.resetFields(['sshPwd']);
                      }
                    },
                  }}
                />
              </ProForm.Group>
            );
          }
          if (authType === SsmAnsible.SSHType.Automatic.valueOf()) {
            return (
              <ProForm.Group>
                <ProFormText
                  name="sshUser"
                  label="SSH User Name"
                  width="xs"
                  placeholder="root"
                  rules={[{ required: true }]}
                />
              </ProForm.Group>
            );
          }
          if (authType === SsmAnsible.SSHType.KeyBased.valueOf()) {
            return (
              <ProForm.Group>
                <ProFormText
                  name="sshUser"
                  label="SSH User Name"
                  width="xs"
                  placeholder="root"
                  rules={[{ required: true }]}
                />
                <ProFormDependency name={['sshConnection']}>
                  {({ sshConnection }) => (
                    <ProFormText.Password
                      name="sshKeyPass"
                      label="SSH Key Passphrase"
                      width="xs"
                      placeholder="passphrase"
                      rules={[
                        { required: false },
                        {
                          validator(_, value) {
                            if (
                              sshConnection ===
                                SsmAnsible.SSHConnection.BUILTIN &&
                              value &&
                              value !== ''
                            ) {
                              return Promise.reject(
                                'You must choose Paramiko as an SSH connection method in advanced to use a SSH key password',
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      fieldProps={{
                        iconRender: (visible) =>
                          typeof formRef.current?.getFieldValue ===
                            'function' &&
                          formRef.current?.getFieldValue('sshKeyPass') !==
                            'REDACTED' ? (
                            visible ? (
                              <EyeTwoTone />
                            ) : (
                              <EyeInvisibleOutlined />
                            )
                          ) : undefined,
                        onFocus: () => {
                          if (
                            formRef.current?.getFieldValue('sshKeyPass') ===
                            'REDACTED'
                          ) {
                            formRef.current?.setFieldValue('sshKeyPass', '');
                          }
                        },
                        onBlur: () => {
                          if (
                            formRef.current?.getFieldValue('sshKeyPass') === ''
                          ) {
                            formRef.current?.resetFields(['sshKeyPass']);
                          }
                        },
                      }}
                    />
                  )}
                </ProFormDependency>
                <ProFormTextArea
                  name="sshKey"
                  label="SSH Private Key"
                  width="md"
                  placeholder="root"
                  rules={[
                    { required: true },
                    {
                      pattern: Validation.privateKeyRegexp,
                      message:
                        'The SSH key does not seem to be in a correct format',
                    },
                  ]}
                  fieldProps={{
                    style: { fontFamily: 'monospace' },
                    onFocus: () => {
                      if (
                        formRef.current?.getFieldValue('sshKey') === 'REDACTED'
                      ) {
                        formRef.current?.setFieldValue('sshKey', '');
                      }
                    },
                    onBlur: () => {
                      if (formRef.current?.getFieldValue('sshKey') === '') {
                        formRef.current?.resetFields(['sshKey']);
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
  </Card>
);

export default AuthenticationCard;
