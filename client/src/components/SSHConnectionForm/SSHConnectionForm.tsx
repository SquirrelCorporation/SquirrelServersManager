import {
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import React from 'react';

const connectionTypes = [
  {
    value: 'userPwd',
    label: 'User/Password',
  },
  { value: 'keyBased', label: 'Keys' },
];

export type SSHConnectionFormProps = {
  deviceUuid?: string;
};

const SSHConnectionForm = () => {
  return (
    <>
      <ProFormDigit
        name="sshPort"
        label="SSH Port"
        width="md"
        placeholder="22"
        rules={[
          { required: true },
          {
            pattern: /^[0-9]+$/,
            message: 'Please enter a number',
          },
        ]}
        fieldProps={{ precision: 0 }}
      />
      <ProFormSelect
        label="SSH Connection Type"
        name="type"
        rules={[
          {
            required: true,
          },
        ]}
        width="md"
        options={connectionTypes}
      />
      <ProFormDependency name={['type']}>
        {({ type }) => {
          if (type === 'userPwd')
            return (
              <>
                <ProFormText
                  name="sshUser"
                  label="SSH User Name"
                  width="sm"
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
              </>
            );
          if (type === 'keyBased')
            return (
              <>
                <ProFormTextArea
                  name="sshKey"
                  label="SSH Private Key"
                  width="md"
                  placeholder="root"
                  rules={[{ required: true }]}
                />
              </>
            );
        }}
      </ProFormDependency>
    </>
  );
};

export default SSHConnectionForm;
