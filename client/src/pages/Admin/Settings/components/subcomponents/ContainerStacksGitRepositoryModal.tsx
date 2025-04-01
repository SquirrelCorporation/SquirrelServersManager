import { SimpleIconsGit } from '@/components/Icons/CustomIcons';
import FileMatchesForm from '@/pages/Admin/Settings/components/subcomponents/forms/FileMatchesForm';
import GitForm from '@/pages/Admin/Settings/components/subcomponents/forms/GitForm';
import {
  commitAndSyncContainerStacksGitRepository,
  deleteContainerStacksGitRepository,
  forceCloneContainerStacksGitRepository,
  forcePullContainerStacksGitRepository,
  forceRegisterContainerStacksGitRepository,
  postContainerStacksGitRepository,
  putContainerStacksGitRepository,
  syncToDatabaseContainerStacksGitRepository,
} from '@/services/rest/container-stacks/container-stacks.repositories';
import { DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { ModalForm, ProForm } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Avatar, Button, Dropdown, MenuProps, message, Popconfirm } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type ContainerStacksGitRepositoryModalProps = {
  selectedRecord: Partial<API.GitContainerStacksRepository>;
  modalOpened: boolean;
  setModalOpened: React.Dispatch<React.SetStateAction<boolean>>;
  asyncFetch: () => Promise<void>;
  repositories: API.GitContainerStacksRepository[];
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

const ContainerStacksGitRepositoryModal: React.FC<
  ContainerStacksGitRepositoryModalProps
> = ({
  selectedRecord,
  modalOpened,
  setModalOpened,
  repositories,
  asyncFetch,
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
        await forcePullContainerStacksGitRepository(selectedRecord.uuid).then(
          () => {
            message.loading({
              content: 'Force pull command launched',
              duration: 6,
            });
          },
        );
        return;
      case '2':
        await commitAndSyncContainerStacksGitRepository(
          selectedRecord.uuid,
        ).then(() => {
          message.loading({
            content: 'Commit and sync command launched',
            duration: 6,
          });
        });
        return;
      case '3':
        await forceCloneContainerStacksGitRepository(selectedRecord.uuid).then(
          () => {
            message.loading({
              content: 'Force clone command launched',
              duration: 6,
            });
          },
        );
        return;
      case '4':
        await syncToDatabaseContainerStacksGitRepository(
          selectedRecord.uuid,
        ).then(() => {
          message.loading({
            content: 'Sync to database command launched',
            duration: 6,
          });
        });
        return;
      case '5':
        await forceRegisterContainerStacksGitRepository(
          selectedRecord.uuid,
        ).then(() => {
          message.loading({
            content: 'Force register command launched',
            duration: 6,
          });
        });
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
              await deleteContainerStacksGitRepository(selectedRecord.uuid)
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
          <Button danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>,
      ]
    : [];

  return (
    <ModalForm<API.GitContainerStacksRepository>
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
      clearOnDestroy
      open={modalOpened}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setModalOpened(false),
      }}
      onFinish={async (values) => {
        if (selectedRecord) {
          await postContainerStacksGitRepository(
            selectedRecord.uuid as string,
            values,
          );
          setModalOpened(false);
          await asyncFetch();
        } else {
          await putContainerStacksGitRepository(values);
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
        <FileMatchesForm selectedRecord={selectedRecord} />
      </ProForm.Group>
    </ModalForm>
  );
};

export default ContainerStacksGitRepositoryModal;
