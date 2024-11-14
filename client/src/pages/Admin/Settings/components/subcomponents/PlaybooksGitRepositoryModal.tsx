import { SimpleIconsGit } from '@/components/Icons/CustomIcons';
import DirectoryExclusionForm from '@/pages/Admin/Settings/components/subcomponents/forms/DirectoryExclusionForm';
import GitForm from '@/pages/Admin/Settings/components/subcomponents/forms/GitForm';
import {
  commitAndSyncPlaybooksGitRepository,
  deletePlaybooksGitRepository,
  forceClonePlaybooksGitRepository,
  forcePullPlaybooksGitRepository,
  forceRegisterPlaybooksGitRepository,
  postPlaybooksGitRepository,
  putPlaybooksGitRepository,
  syncToDatabasePlaybooksGitRepository,
} from '@/services/rest/playbooks-repositories';
import { ModalForm, ProForm } from '@ant-design/pro-components';
import { Avatar, Button, Dropdown, MenuProps, message } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type PlaybooksGitRepositoryModalProps = {
  selectedRecord: Partial<API.GitPlaybooksRepository>;
  modalOpened: boolean;
  setModalOpened: any;
  asyncFetch: () => Promise<void>;
  repositories: API.GitPlaybooksRepository[];
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

const PlaybooksGitRepositoryModal: React.FC<
  PlaybooksGitRepositoryModalProps
> = (props) => {
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
        await forcePullPlaybooksGitRepository(props.selectedRecord.uuid).then(
          () => {
            message.loading({
              content: 'Force pull command launched',
              duration: 6,
            });
          },
        );
        return;
      case '2':
        await commitAndSyncPlaybooksGitRepository(
          props.selectedRecord.uuid,
        ).then(() => {
          message.loading({
            content: 'Commit and sync command launched',
            duration: 6,
          });
        });
        return;
      case '3':
        await forceClonePlaybooksGitRepository(props.selectedRecord.uuid).then(
          () => {
            message.loading({
              content: 'Force clone command launched',
              duration: 6,
            });
          },
        );
        return;
      case '4':
        await syncToDatabasePlaybooksGitRepository(
          props.selectedRecord.uuid,
        ).then(() => {
          message.loading({
            content: 'Sync to database command launched',
            duration: 6,
          });
        });
        return;
      case '5':
        await forceRegisterPlaybooksGitRepository(
          props.selectedRecord.uuid,
        ).then(() => {
          message.loading({
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
              await deletePlaybooksGitRepository(props.selectedRecord.uuid)
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
    <ModalForm<API.GitPlaybooksRepository>
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
          await postPlaybooksGitRepository(
            props.selectedRecord.uuid as string,
            values,
          );
          props.setModalOpened(false);
          await props.asyncFetch();
        } else {
          await putPlaybooksGitRepository(values);
          message.loading({
            content: 'Repository cloning & processing in process...',
            duration: 6,
          });
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
      <GitForm
        selectedRecord={props.selectedRecord}
        repositories={props.repositories}
      />
      <ProForm.Group>
        <DirectoryExclusionForm selectedRecord={props.selectedRecord} />
      </ProForm.Group>
    </ModalForm>
  );
};

export default PlaybooksGitRepositoryModal;
