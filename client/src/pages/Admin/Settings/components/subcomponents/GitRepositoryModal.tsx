import { SimpleIconsGit } from '@/components/Icons/CustomIcons';
import {
  commitAndSyncGitRepository,
  deleteGitRepository,
  forceCloneGitRepository,
  forcePullGitRepository,
  forceRegisterGitRepository,
  postGitRepository,
  putGitRepository,
  syncToDatabaseGitRepository,
} from '@/services/rest/playbooks-repositories';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Avatar, Button, message, Dropdown, MenuProps } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type GitRepositoryModalProps = {
  selectedRecord: Partial<API.GitRepository>;
  modalOpened: boolean;
  setModalOpened: any;
  asyncFetch: () => Promise<void>;
  repositories: API.GitRepository[];
};

const items = [
  {
    key: '1',
    label: 'Force Pull',
  },
  {
    key: '2',
    label: 'Commit And Sync',
  },
  {
    key: '3',
    label: 'Force Clone',
  },
  {
    key: '4',
    label: 'Sync To Database',
  },
  {
    key: '5',
    label: 'Force Register',
  },
];

const GitRepositoryModal: React.FC<GitRepositoryModalProps> = (props) => {
  const onMenuClick: MenuProps['onClick'] = async (e) => {
    if (!props.selectedRecord.uuid) {
      message.error({
        content: 'Internal error - no uuid',
        duration: 6,
      });
      return;
    }
    switch (e.key) {
      case '1':
        await forcePullGitRepository(props.selectedRecord.uuid).then(() => {
          message.success({
            content: 'Force pull command launched',
            duration: 6,
          });
        });
        return;
      case '2':
        await commitAndSyncGitRepository(props.selectedRecord.uuid).then(() => {
          message.success({
            content: 'Commit and sync command launched',
            duration: 6,
          });
        });
        return;
      case '3':
        await forceCloneGitRepository(props.selectedRecord.uuid).then(() => {
          message.success({
            content: 'Force clone command launched',
            duration: 6,
          });
        });
        return;
      case '4':
        await syncToDatabaseGitRepository(props.selectedRecord.uuid).then(
          () => {
            message.success({
              content: 'Sync to database command launched',
              duration: 6,
            });
          },
        );
        return;
      case '5':
        await forceRegisterGitRepository(props.selectedRecord.uuid).then(() => {
          message.success({
            content: 'Force register command launched',
            duration: 6,
          });
        });
        return;
    }
  };

  const editionMode = props.selectedRecord
    ? [
        <Dropdown.Button
          key="dropdown"
          type={'dashed'}
          menu={{ items, onClick: onMenuClick }}
        >
          Actions
        </Dropdown.Button>,
        <Button
          key="delete"
          danger
          onClick={async () => {
            if (props.selectedRecord && props.selectedRecord.uuid) {
              await deleteGitRepository(props.selectedRecord.uuid)
                .then(() =>
                  message.warning({
                    content: 'Repository deleted',
                    duration: 5,
                  }),
                )
                .finally(() => {
                  props.setModalOpened(false);
                });
              await props.asyncFetch();
            }
          }}
        >
          Delete
        </Button>,
      ]
    : [];

  return (
    <ModalForm<API.GitRepository>
      title={
        <>
          <Avatar
            size={50}
            shape="square"
            style={{
              marginRight: 4,
              backgroundColor: 'rgba(41,70,147,0.51)',
            }}
            src={<SimpleIconsGit />}
          />
          {(props.selectedRecord && (
            <>Edit repository {props.selectedRecord?.name}</>
          )) || <>Add & sync a new repository</>}
        </>
      }
      open={props.modalOpened}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => props.setModalOpened(false),
      }}
      onFinish={async (values) => {
        if (props.selectedRecord) {
          await postGitRepository(values);
          props.setModalOpened(false);
          await props.asyncFetch();
        } else {
          await putGitRepository(values);
          props.setModalOpened(false);
          await props.asyncFetch();
        }
      }}
      submitter={{
        render: (_, defaultDoms) => {
          return [...editionMode, ...defaultDoms];
        },
      }}
    >
      <ProForm.Group>
        <ProFormText
          width={'md'}
          name={'name'}
          label={'Name'}
          initialValue={props.selectedRecord?.name}
          rules={[
            { required: true },
            {
              validator(_, value) {
                if (
                  props.repositories.find((e) => e.name === value) === undefined
                ) {
                  return Promise.resolve();
                }
                return Promise.reject('Name already exists');
              },
            },
          ]}
        />
        <ProFormText
          width={'md'}
          name={'email'}
          label={'Git Email'}
          initialValue={props.selectedRecord?.email}
          rules={[{ required: true }]}
        />
        <ProFormText
          width={'md'}
          name={'userName'}
          label={'Git Username'}
          initialValue={props.selectedRecord?.userName}
          rules={[{ required: true }]}
        />
        <ProFormText
          width={'md'}
          name={'remoteUrl'}
          label={'Remote Url'}
          initialValue={props.selectedRecord?.remoteUrl}
          rules={[{ required: true }]}
        />
        <ProFormText
          width={'md'}
          name={'branch'}
          label={'Branch'}
          initialValue={props.selectedRecord?.branch}
          rules={[{ required: true }]}
        />
        <ProFormText.Password
          width={'md'}
          name={'accessToken'}
          label={'Access Token'}
          rules={[{ required: true }]}
        />
      </ProForm.Group>
    </ModalForm>
  );
};

export default GitRepositoryModal;
