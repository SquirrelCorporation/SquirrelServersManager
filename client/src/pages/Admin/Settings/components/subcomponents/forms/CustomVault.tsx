import { getAnsibleVaults } from '@/services/rest/ansible';
import { ProFormSelect } from '@ant-design/pro-form';
import React from 'react';
import { API } from 'ssm-shared-lib';

type CustomVaultProps = {
  selectedRecord?:
    | Partial<API.GitPlaybooksRepository | API.LocalPlaybooksRepository>
    | undefined;
};

const CustomVault: React.FC<CustomVaultProps> = ({ selectedRecord }) => {
  return (
    <ProFormSelect
      width={'md'}
      tooltip={
        'Vaults to be used by the playbooks. The vaults are defined in the Vaults section of this page.'
      }
      label={'Custom Vaults'}
      name={'vaults'}
      initialValue={selectedRecord?.vaults}
      request={async () =>
        (await getAnsibleVaults())?.data?.map((e: API.AnsibleVault) => ({
          label: e.vaultId,
          value: e._id,
        }))
      }
      fieldProps={{
        mode: 'tags',
      }}
      placeholder={'Your custom vaults'}
    />
  );
};

export default CustomVault;
