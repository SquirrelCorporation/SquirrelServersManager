import { OuiMlCreateAdvancedJob } from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import {
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Card } from 'antd';
import React from 'react';
import { API, SsmProxmox } from 'ssm-shared-lib';

export type ProxmoxConnectionCardProps = {
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
};

const ProxmoxConnectionCard: React.FC<ProxmoxConnectionCardProps> = ({
  formRef,
}) => {
  return (
    <Card
      type="inner"
      title={
        <CardHeader
          title={'Proxmox Connection'}
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
        <ProFormSelect
          label="Remote Connection Method"
          name={'remoteConnectionMethod'}
          width="sm"
          rules={[{ required: true }]}
          options={[
            {
              value: SsmProxmox.RemoteConnectionMethod.SSH,
              label: 'SSH',
            },
            {
              value: SsmProxmox.RemoteConnectionMethod.HTTP,
              label: 'HTTP',
            },
          ]}
        />
        <ProFormDigit
          name={'port'}
          label="Proxmox API Port"
          width="xs"
          placeholder="8006"
          rules={[{ required: true }]}
        />
        <ProFormSelect
          label="Proxmox API Connection Method"
          name={'connectionMethod'}
          width="sm"
          rules={[{ required: true }]}
          options={[
            {
              value: SsmProxmox.ConnectionMethod.USER_PWD,
              label: 'User/Password',
            },
            {
              value: SsmProxmox.ConnectionMethod.TOKENS,
              label: 'Token ID / Token Secret',
            },
          ]}
        />
        <ProFormDependency name={['connectionMethod']}>
          {({ connectionMethod }) => {
            if (connectionMethod === SsmProxmox.ConnectionMethod.USER_PWD) {
              return (
                <>
                  <ProFormText
                    name={['userPwd', 'username']}
                    label="Proxmox User Name"
                    width="sm"
                    placeholder="root"
                    rules={[{ required: true }]}
                  />
                  <ProFormText.Password
                    name={['userPwd', 'password']}
                    label="Proxmox Password"
                    width="sm"
                    placeholder="password"
                    rules={[{ required: true }]}
                    fieldProps={{
                      iconRender: (visible) =>
                        typeof formRef?.current?.getFieldValue === 'function' &&
                        formRef?.current?.getFieldValue([
                          'userPwd',
                          'password',
                        ]) !== 'REDACTED'
                          ? visible
                            ? '🔓'
                            : '🔒'
                          : undefined,
                      onFocus: () => {
                        if (
                          formRef?.current?.getFieldValue([
                            'userPwd',
                            'password',
                          ]) === 'REDACTED'
                        ) {
                          formRef?.current?.setFieldValue(
                            ['userPwd', 'password'],
                            '',
                          );
                        }
                      },
                      onBlur: () => {
                        if (
                          formRef?.current?.getFieldValue([
                            'userPwd',
                            'password',
                          ]) === ''
                        ) {
                          formRef?.current?.resetFields([
                            ['userPwd', 'password'],
                          ]);
                        }
                      },
                    }}
                  />
                </>
              );
            }
            if (connectionMethod === SsmProxmox.ConnectionMethod.TOKENS) {
              return (
                <>
                  <ProFormText
                    name={['tokens', 'tokenId']}
                    label="Token ID"
                    width="lg"
                    placeholder="id"
                    rules={[{ required: true }]}
                  />
                  <ProFormText.Password
                    name={['tokens', 'tokenSecret']}
                    label="Token Secret"
                    width="lg"
                    placeholder="secret"
                    rules={[{ required: true }]}
                    fieldProps={{
                      iconRender: (visible) =>
                        typeof formRef?.current?.getFieldValue === 'function' &&
                        formRef?.current?.getFieldValue([
                          'tokens',
                          'tokenSecret',
                        ]) !== 'REDACTED'
                          ? visible
                            ? '🔓'
                            : '🔒'
                          : undefined,
                      onFocus: () => {
                        if (
                          formRef?.current?.getFieldValue([
                            'tokens',
                            'tokenSecret',
                          ]) === 'REDACTED'
                        ) {
                          formRef?.current?.setFieldValue(
                            ['tokens', 'tokenSecret'],
                            '',
                          );
                        }
                      },
                      onBlur: () => {
                        if (
                          formRef?.current?.getFieldValue([
                            'tokens',
                            'tokenSecret',
                          ]) === ''
                        ) {
                          formRef?.current?.resetFields([
                            ['tokens', 'tokenSecret'],
                          ]);
                        }
                      },
                    }}
                  />
                </>
              );
            }
          }}
        </ProFormDependency>
        <ProFormCheckbox
          tooltip={
            'Check this box if you want to ignore SSL errors, e.g. self signed certificates.'
          }
          name={'ignoreSslErrors'}
          label="Authorize Self Signed Certificates"
          width="xs"
        />
      </ProForm.Group>
    </Card>
  );
};

export default ProxmoxConnectionCard;
