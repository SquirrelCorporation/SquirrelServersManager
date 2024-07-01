import { SimpleIconsGit } from '@/components/Icons/CustomIcons';
import {
  deleteLocalRepository,
  postLocalRepositories,
  putLocalRepositories,
  syncToDatabaseLocalRepository,
} from '@/services/rest/playbooks-repositories';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Avatar, Button, Dropdown, MenuProps, message } from 'antd';
import React, { FC, useState } from 'react';
import { API } from 'ssm-shared-lib';

type LocalRepositoryModalProps = {
  selectedRecord: Partial<API.LocalRepository>;
  modalOpened: boolean;
  setModalOpened: any;
  asyncFetch: () => Promise<void>;
  repositories: API.LocalRepository[];
};

const items = [
  {
    key: '4',
    label: 'Sync To Database',
  },
];

const LocalRepositoryModal: FC<LocalRepositoryModalProps> = (props) => {
  const [loading, setLoading] = useState(false);
  const onMenuClick: MenuProps['onClick'] = async (e) => {
    if (!props.selectedRecord.uuid) {
      message.error({
        content: 'Internal error - no uuid',
        duration: 6,
      });
      return;
    }
    switch (e.key) {
      case '4':
        await syncToDatabaseLocalRepository(props.selectedRecord.uuid).then(
          () => {
            message.success({
              content: 'Sync to database command launched',
              duration: 6,
            });
          },
        );
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
          disabled={props.selectedRecord?.default === true}
          loading={loading}
          onClick={async () => {
            setLoading(true);
            if (props.selectedRecord && props.selectedRecord.uuid) {
              await deleteLocalRepository(props.selectedRecord.uuid)
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
            setLoading(false);
          }}
        >
          Delete
        </Button>,
      ]
    : [];
  return (
    <ModalForm<API.LocalRepository>
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
        if (!props.selectedRecord?.default) {
          if (props.selectedRecord) {
            await postLocalRepositories({
              ...props.selectedRecord,
              name: values.name,
            });
            props.setModalOpened(false);
            await props.asyncFetch();
          } else {
            await putLocalRepositories(values);
            props.setModalOpened(false);
            await props.asyncFetch();
          }
        } else {
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
          disabled={props.selectedRecord?.default === true}
          initialValue={props.selectedRecord?.name}
          rules={[
            { required: true },
            {
              validator(_, value) {
                if (
                  props.repositories.find((e) => e.name === value) ===
                    undefined ||
                  props.selectedRecord?.name === value
                ) {
                  return Promise.resolve();
                }
                return Promise.reject('Name already exists');
              },
            },
          ]}
        />
      </ProForm.Group>
    </ModalForm>
  );
};

export default LocalRepositoryModal;
