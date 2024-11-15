import { capitalizeFirstLetter } from '@/utils/strings';
import {
  ProForm,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
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
      rules={[{ required: true }]}
    />
    <ProFormText
      width={'md'}
      name={'userName'}
      label={'Git Username'}
      initialValue={selectedRecord?.userName}
      rules={[{ required: true }]}
    />
    <ProFormText
      width={'md'}
      name={'remoteUrl'}
      label={'Remote Url'}
      initialValue={selectedRecord?.remoteUrl}
      rules={[{ required: true }]}
    />
    <ProFormText
      width={'md'}
      name={'branch'}
      label={'Branch'}
      initialValue={selectedRecord?.branch}
      rules={[{ required: true }]}
    />
    <ProFormText.Password
      width={'md'}
      name={'accessToken'}
      label={'Access Token'}
      rules={[{ required: true }]}
    />
  </ProForm.Group>
);

export default GitForm;
