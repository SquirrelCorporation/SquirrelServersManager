import { SimpleIconsGit } from '@/components/Icons/CustomIcons';
import CustomVault from '@/pages/Admin/Settings/components/subcomponents/forms/CustomVault';
import DirectoryExclusionForm from '@/pages/Admin/Settings/components/subcomponents/forms/DirectoryExclusionForm';
import {
  deletePlaybooksLocalRepository,
  postPlaybooksLocalRepositories,
  putPlaybooksLocalRepositories,
  syncToDatabasePlaybooksLocalRepository,
} from '@/services/rest/playbooks-repositories';
import {
  DeleteOutlined,
  QuestionCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Avatar, Button, Dropdown, MenuProps, message, Popconfirm } from 'antd';
import React, { FC, useState } from 'react';
import { API } from 'ssm-shared-lib';

type LocalRepositoryModalProps = {
  selectedRecord: Partial<API.LocalPlaybooksRepository>;
  modalOpened: boolean;
  setModalOpened: any;
  asyncFetch: () => Promise<void>;
  repositories: API.LocalPlaybooksRepository[];
};

const items = [
  {
    key: '4',
    label: 'Sync To Database',
  },
];

const PlaybooksLocalRepositoryModal: FC<LocalRepositoryModalProps> = (
  props,
) => {
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
        await syncToDatabasePlaybooksLocalRepository(
          props.selectedRecord.uuid,
        ).then(() => {
          message.success({
            content: 'Sync to database command launched',
            duration: 6,
          });
        });
        return;
    }
  };
  const editionMode = props.selectedRecord
    ? [
        <Button
          key={'show-logs'}
          icon={<UnorderedListOutlined />}
          onClick={() =>
            history.push({
              pathname: '/admin/logs',
              // @ts-expect-error lib missing type
              search: `?moduleId=${props.selectedRecord.uuid}`,
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
          key="delete"
          title="Are you sure to delete this repository?"
          onConfirm={async () => {
            setLoading(true);
            if (props.selectedRecord && props.selectedRecord.uuid) {
              await deletePlaybooksLocalRepository(props.selectedRecord.uuid)
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
          <Button
            icon={<DeleteOutlined />}
            danger
            disabled={props.selectedRecord?.default === true}
            loading={loading}
          >
            Delete
          </Button>
        </Popconfirm>,
      ]
    : [];
  return (
    <ModalForm<API.LocalPlaybooksRepository>
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
            await postPlaybooksLocalRepositories(
              props.selectedRecord.uuid as string,
              {
                ...props.selectedRecord,
                name: values.name,
                directoryExclusionList: values.directoryExclusionList,
                vaults: values.vaults,
              },
            );
            props.setModalOpened(false);
            await props.asyncFetch();
          } else {
            await putPlaybooksLocalRepositories(values);
            props.setModalOpened(false);
            await props.asyncFetch();
          }
        } else {
          props.setModalOpened(false);
          await props.asyncFetch();
        }
      }}
      submitter={{
        searchConfig: {
          submitText: 'Save',
        },
        render: (_, defaultDoms) => {
          return [
            ...editionMode,
            <Button icon={<QuestionCircleOutlined />} />,
            ...defaultDoms,
          ];
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
      <ProForm.Group>
        <DirectoryExclusionForm selectedRecord={props.selectedRecord} />
        {!props.selectedRecord?.default && (
          <CustomVault selectedRecord={props.selectedRecord} />
        )}
      </ProForm.Group>
    </ModalForm>
  );
};

export default PlaybooksLocalRepositoryModal;
