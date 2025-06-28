import { SimpleIconsGit } from '@shared/ui/icons/categories/services';
import CustomVault from '@/pages/Admin/Settings/components/subcomponents/forms/CustomVault';
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
} from '@/services/rest/playbooks/repositories';
import { DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { ModalForm, ProForm } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import message from '@shared/ui/feedback/DynamicMessage';
import { Avatar, Button, Dropdown, MenuProps, Popconfirm } from 'antd';
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
> = ({
  selectedRecord,
  modalOpened,
  setModalOpened,
  asyncFetch,
  repositories,
}) => {
  const onMenuClick: MenuProps['onClick'] = async (e) => {
    if (!selectedRecord.uuid) {
      message.error({
        content: 'Internal error - no uuid',
        duration: 6,
      });
      return;
    }
    switch (e.key) {
      case '1':
        await forcePullPlaybooksGitRepository(selectedRecord.uuid).then(() => {
          message.loading({
            content: 'Force pull command launched',
            duration: 6,
          });
        });
        return;
      case '2':
        await commitAndSyncPlaybooksGitRepository(selectedRecord.uuid).then(
          () => {
            message.loading({
              content: 'Commit and sync command launched',
              duration: 6,
            });
          },
        );
        return;
      case '3':
        await forceClonePlaybooksGitRepository(selectedRecord.uuid).then(() => {
          message.loading({
            content: 'Force clone command launched',
            duration: 6,
          });
        });
        return;
      case '4':
        await syncToDatabasePlaybooksGitRepository(selectedRecord.uuid).then(
          () => {
            message.loading({
              content: 'Sync to database command launched',
              duration: 6,
            });
          },
        );
        return;
      case '5':
        await forceRegisterPlaybooksGitRepository(selectedRecord.uuid).then(
          () => {
            message.loading({
              content: 'Force register command launched',
              duration: 6,
            });
          },
        );
        return;
    }
  };

  const editionMode = selectedRecord
    ? [
        <Button
          key={'show-logs'}
          icon={<UnorderedListOutlined />}
          onClick={() =>
            history.push({
              pathname: '/admin/logs',
              // @ts-expect-error lib missing type
              search: `?moduleId=${selectedRecord.uuid}`,
            })
          }
        >
          Logs
        </Button>,
        <Dropdown.Button
          key="dropdown"
          type={'dashed'}
          menu={{ items, onClick: onMenuClick }}
        >
          Actions
        </Dropdown.Button>,
        <Popconfirm
          title="Are you sure to delete this repository?"
          key="delete"
          onConfirm={async () => {
            if (selectedRecord && selectedRecord.uuid) {
              await deletePlaybooksGitRepository(selectedRecord.uuid)
                .then(() =>
                  message.warning({
                    content: 'Repository deleted',
                    duration: 5,
                  }),
                )
                .finally(() => {
                  setModalOpened(false);
                });
              await asyncFetch();
            }
          }}
        >
          <Button key="delete" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>,
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
          {(selectedRecord && <>Edit repository {selectedRecord?.name}</>) || (
            <>Add & sync a new repository</>
          )}
        </>
      }
      open={modalOpened}
      clearOnDestroy
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setModalOpened(false),
      }}
      onFinish={async (values) => {
        if (selectedRecord) {
          await postPlaybooksGitRepository(
            selectedRecord.uuid as string,
            values,
          );
          setModalOpened(false);
          await asyncFetch();
        } else {
          await putPlaybooksGitRepository(values);
          message.loading({
            content: 'Repository cloning & processing in process...',
            duration: 6,
          });
          setModalOpened(false);
          await asyncFetch();
        }
      }}
      submitter={{
        searchConfig: {
          submitText: 'Save',
        },
        render: (_, defaultDoms) => {
          return [...editionMode, ...defaultDoms];
        },
      }}
    >
      <GitForm selectedRecord={selectedRecord} repositories={repositories} />
      <ProForm.Group>
        <DirectoryExclusionForm selectedRecord={selectedRecord} />
        <CustomVault selectedRecord={selectedRecord} />
      </ProForm.Group>
    </ModalForm>
  );
};

export default PlaybooksGitRepositoryModal;
