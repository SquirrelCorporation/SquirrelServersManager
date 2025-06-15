import { capitalizeFirstLetter } from '@/utils/strings';
import {
  ProForm,
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import message from '@/components/Message/DynamicMessage';
import React from 'react';
import { API, SsmGit } from 'ssm-shared-lib';

export type GitFormProps = {
  selectedRecord: Partial<
    API.GitPlaybooksRepository | API.GitContainerStacksRepository
  >;
  repositories:
    | API.GitPlaybooksRepository[]
    | API.GitContainerStacksRepository[];
};

const GitForm: React.FC<GitFormProps> = ({ selectedRecord, repositories }) => (
  <ProForm.Group>
    <ProFormText
      width={'md'}
      name={'name'}
      label={'Name'}
      initialValue={selectedRecord?.name}
      rules={[
        { required: true },
        {
          validator(_, value) {
            if (
              repositories.find((e) => e.name === value) === undefined ||
              selectedRecord?.name === value
            ) {
              return Promise.resolve();
            }
            return Promise.reject('Name already exists');
          },
        },
      ]}
    />
    <ProFormSelect
      width={'md'}
      name={'gitService'}
      label={'Git Service'}
      options={Object.values(SsmGit.Services).map((e) => ({
        label: capitalizeFirstLetter(e),
        value: e,
      }))}
      rules={[{ required: true }]}
      initialValue={selectedRecord?.gitService || SsmGit.Services.Github}
    />
    <ProFormText
      width={'md'}
      name={'email'}
      label={'Git Email'}
      initialValue={selectedRecord?.email}
      rules={[{ required: true }, { type: 'email' }]}
    />
    <ProFormText
      width={'md'}
      name={'userName'}
      label={'Git Username'}
      initialValue={selectedRecord?.userName}
      tooltip={'The username to use when connecting to the remote repository.'}
      rules={[{ required: true }]}
    />
    <ProFormText
      width={'md'}
      name={'remoteUrl'}
      label={'Remote Url'}
      initialValue={selectedRecord?.remoteUrl}
      tooltip={
        'The remote URL to clone from. E.g: https://github.com/user/repo.git'
      }
      rules={[
        { required: true },
        { type: 'url' },
        { pattern: /https:\/\//, message: 'Please include https://' },
      ]}
      fieldProps={{
        onBlur: (e) => {
          const value = e.target.value;
          const regex = /https?:\/\/[^@\n]+:[^@\n]+@/; // Matches user:password@ in URLs
          if (regex.test(value)) {
            void message.warning({
              content:
                'Remote URL contains a username or access token. Consider removing it for security.',
            });
          }
        },
      }}
    />
    <ProFormText
      width={'md'}
      name={'branch'}
      label={'Branch'}
      initialValue={selectedRecord?.branch}
      tooltip={'The branch to pull from. E.g: main, develop, master, etc.'}
      rules={[{ required: true }]}
    />
    <ProFormText.Password
      width={'md'}
      name={'accessToken'}
      label={'Access Token'}
      rules={[{ required: true }]}
    />
    <ProFormCheckbox
      width={'md'}
      name={'ignoreSSLErrors'}
      label={'Ignore SSL Errors'}
      tooltip={
        'Ignore SSL errors when connecting to the remote repository, for example, self-signed certificates.'
      }
      initialValue={selectedRecord?.ignoreSSLErrors}
    />
  </ProForm.Group>
);

export default GitForm;
