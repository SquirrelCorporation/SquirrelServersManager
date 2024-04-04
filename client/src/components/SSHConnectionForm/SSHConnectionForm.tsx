import {
  ProForm,
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
      <ProForm.Group>
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
      </ProForm.Group>
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
          label="Super User"
          width="sm"
          placeholder="root"
        />
        <ProFormText.Password
          name="becomePass"
          label="Become Pass"
          width="sm"
          placeholder="password"
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormSelect
          label="SSH Connection Type"
          name="authType"
          rules={[
            {
              required: true,
            },
          ]}
          width="md"
          options={connectionTypes}
        />
        <ProFormDependency name={['authType']}>
          {({ authType }) => {
            if (authType === 'userPwd')
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
            if (authType === 'keyBased')
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
      </ProForm.Group>
    </>
  );
};

export default SSHConnectionForm;
