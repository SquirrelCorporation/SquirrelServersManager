import { UserSecret } from '@/components/Icons/CustomIcons';
import {
  deleteAnsibleVault,
  postAnsibleVault,
  updateAnsibleVault,
} from '@/services/rest/ansible';
import { DeleteOutlined } from '@ant-design/icons';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Avatar, Button, message, Popconfirm } from 'antd';
import React, { FC, useState } from 'react';
import { API } from 'ssm-shared-lib';

type CustomVaultModalProps = {
  selectedRecord?: Partial<API.CustomVault>;
  modalOpened: boolean;
  setModalOpened: any;
  asyncFetch: () => Promise<void>;
  vaults: API.CustomVault[];
};

const PlaybooksLocalRepositoryModal: FC<CustomVaultModalProps> = ({
  selectedRecord,
  modalOpened,
  setModalOpened,
  asyncFetch,
  vaults,
}) => {
  const [loading, setLoading] = useState(false);

  const editionMode = selectedRecord
    ? [
        <Popconfirm
          key="delete"
          title="Are you sure to delete this Vault?"
          onConfirm={async () => {
            setLoading(true);
            if (selectedRecord && selectedRecord.vaultId) {
              await deleteAnsibleVault(selectedRecord.vaultId)
                .then(() =>
                  message.warning({
                    content: 'Vault deleted',
                    duration: 5,
                  }),
                )
                .finally(() => {
                  setModalOpened(false);
                });
              await asyncFetch();
            }
            setLoading(false);
          }}
        >
          <Button icon={<DeleteOutlined />} danger loading={loading}>
            Delete
          </Button>
        </Popconfirm>,
      ]
    : [];
  return (
    <ModalForm<API.CustomVault>
      title={
        <>
          <Avatar
            size={50}
            shape="square"
            style={{
              marginRight: 4,
              backgroundColor: 'rgba(41,70,147,0.51)',
            }}
            src={<UserSecret />}
          />
          {(selectedRecord && <>Edit vault {selectedRecord?.vaultId}</>) || (
            <>Add a new vault</>
          )}
        </>
      }
      open={modalOpened}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => setModalOpened(false),
      }}
      onFinish={async (values) => {
        if (selectedRecord) {
          await updateAnsibleVault(values);
          setModalOpened(false);
          await asyncFetch();
        } else {
          await postAnsibleVault(values);
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
      <ProForm.Group>
        <ProFormText
          width={'md'}
          name={'vaultId'}
          label={'Vault ID'}
          disabled={!!selectedRecord?.vaultId}
          initialValue={selectedRecord?.vaultId}
          rules={[
            { required: true },
            {
              validator(_, value) {
                if (
                  vaults.find((e) => e.vaultId === value) === undefined ||
                  selectedRecord?.vaultId === value
                ) {
                  return Promise.resolve();
                }
                return Promise.reject('Vault ID already exists');
              },
            },
          ]}
        />
        <ProFormText.Password
          width={'md'}
          name={'password'}
          label={'Password'}
          rules={[{ required: true }]}
        />
      </ProForm.Group>
    </ModalForm>
  );
};

export default PlaybooksLocalRepositoryModal;
