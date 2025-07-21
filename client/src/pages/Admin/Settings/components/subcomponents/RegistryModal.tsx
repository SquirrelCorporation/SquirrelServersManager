import RegistryLogo from '@/components/RegistryComponents/RegistryLogo';
import {
  createCustomRegistry,
  updateRegistry,
} from '@/services/rest/containers/container-registries';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { Alert, Avatar, Space } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type RegistryModalProps = {
  selectedRecord: API.ContainerRegistry;
  modalOpened: boolean;
  setModalOpened: any;
  asyncFetch: () => Promise<void>;
  registries: API.ContainerRegistry[];
};

const RegistryModal: React.FC<RegistryModalProps> = ({
  setModalOpened,
  modalOpened,
  selectedRecord,
  registries,
  asyncFetch,
}) => {
  return (
    <ModalForm<any>
      title={
        <>
          <Avatar
            size={50}
            shape="square"
            style={{
              marginRight: 4,
              backgroundColor: 'rgba(41,70,147,0.51)',
            }}
            src={<RegistryLogo provider={selectedRecord?.provider} />}
          />
          Connexion for {selectedRecord?.provider}
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
        if (selectedRecord?.name !== 'custom') {
          await updateRegistry(selectedRecord.name, values);
          setModalOpened(false);
          await asyncFetch();
        } else {
          await createCustomRegistry(
            values.newName,
            values,
            selectedRecord.authScheme,
          );
          setModalOpened(false);
          await asyncFetch();
        }
      }}
    >
      {selectedRecord?.authSet && (
        <Space
          direction="vertical"
          style={{ width: '100%', marginBottom: '15px', marginTop: '15px' }}
        >
          <Alert
            message="The authentication is already set for this provider"
            description="Any modification here will erase all the existing keys"
            type="warning"
            showIcon
          />
        </Space>
      )}
      {selectedRecord?.name === 'custom' && (
        <>
          <Space
            direction="vertical"
            style={{ width: '100%', marginBottom: '15px', marginTop: '15px' }}
          >
            <Alert
              message="You will create a new custom registry provider"
              type="info"
              showIcon
            />
          </Space>
        </>
      )}
      <ProForm.Group>
        {selectedRecord?.name === 'custom' && (
          <ProFormText
            width={'md'}
            name={'newName'}
            label={'Name'}
            rules={[
              { required: true },
              {
                validator(_, value) {
                  if (registries.find((e) => e.name === value) === undefined) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Name already exists');
                },
              },
            ]}
          />
        )}
        {selectedRecord?.authScheme.map((e: any) => {
          if (e?.type === 'choice') {
            let i = 1;
            return e.values.map((f: any) => {
              return (
                <ProForm.Group
                  key={i}
                  title={`Method ${i++} (mutually exclusive)`}
                >
                  {f.map((g: any) => {
                    return (
                      <ProFormText
                        key={g.name}
                        width={'md'}
                        name={g.name}
                        label={g.name}
                      />
                    );
                  })}
                </ProForm.Group>
              );
            });
          } else {
            return (
              <ProFormText
                key={e.name}
                width={'md'}
                name={e.name}
                label={e.name}
              />
            );
          }
        })}
      </ProForm.Group>
    </ModalForm>
  );
};

export default RegistryModal;
