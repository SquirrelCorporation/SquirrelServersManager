import { UserSecret } from '@/components/Icons/CustomIcons';
import {
  EditableProTable,
  ModalForm,
  ProColumns,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import React, { useState } from 'react';
import { API } from 'ssm-shared-lib';

const CustomVaultsModal = () => {
  const [dataSource, setDataSource] = useState<any>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const columns: ProColumns<API.CustomVault[]>[] = [
    {
      title: 'Vault ID',
      tooltip: 'The vault id used in your playbooks',
      key: 'vaultId',
      valueType: 'text',
      initialValue: 'new',
    },
    {
      title: 'Password',
      key: 'password',
      dataIndex: 'password',
      valueType: 'password',
    },
    {
      title: 'Options',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.vaultId);
          }}
        >
          Save
        </a>,
        <a
          key="delete"
          onClick={() => {
            setDataSource(
              dataSource.filter(
                (item: API.CustomVault) => item.vaultId !== record.vaultId,
              ),
            );
          }}
        >
          Delete
        </a>,
      ],
    },
  ];
  return (
    <ModalForm
      title="Manage Vaults"
      trigger={
        <Button key={'vaults'} icon={<UserSecret />}>
          Manage Vaults
        </Button>
      }
    >
      <EditableProTable<API.CustomVault>
        rowKey="vaultId"
        recordCreatorProps={{
          position: 'bottom',
          record: () => ({
            vaultId: 'new',
            password: '',
          }),
        }}
        loading={false}
        columns={columns}
        request={async () => ({
          data: [],
          total: 3,
          success: true,
        })}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            console.log(rowKey, data, row);
          },
          onChange: setEditableRowKeys,
        }}
      />
    </ModalForm>
  );
};

export default CustomVaultsModal;
