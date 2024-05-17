import {
  DeviconGooglecloud,
  FluentMdl2RegistryEditor,
  LogoHotIo,
  LogosAws,
  LogosQuay,
  VscodeIconsFileTypeDocker2,
} from '@/components/Icons/CustomIcons';
import {
  createCustomRegistry,
  getRegistries,
  removeRegistry,
  resetRegistry,
  updateRegistry,
} from '@/services/rest/containers';
import { UndoOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProForm,
  ProFormText,
  ProList,
} from '@ant-design/pro-components';
import {
  Alert,
  Avatar,
  Button,
  Card,
  message,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { DeleteOutline } from 'antd-mobile-icons';
import React, { useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';

const getRegistryLogo = (provider: string) => {
  switch (provider) {
    case 'gcr':
    case 'ghcr':
      return <DeviconGooglecloud />;
    case 'hotio':
      return <LogoHotIo />;
    case 'hub':
      return <VscodeIconsFileTypeDocker2 />;
    case 'ecr':
      return <LogosAws />;
    case 'quay':
      return <LogosQuay />;
    default:
      return <FluentMdl2RegistryEditor />;
  }
};

const RegistrySettings: React.FC = () => {
  const [registries, setRegistries] = useState<API.ContainerRegistry[]>([]);
  const asyncFetch = async () => {
    await getRegistries().then((list) => {
      if (list?.data) {
        setRegistries(list.data?.registries || []);
      }
    });
  };
  useEffect(() => {
    asyncFetch();
  }, []);
  const [ghost, setGhost] = useState<boolean>(false);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any>();

  const onDeleteRegistry = async (item: API.ContainerRegistry) => {
    await removeRegistry(item.name);
    asyncFetch();
  };
  const onResetRegistry = async (item: API.ContainerRegistry) => {
    await resetRegistry(item.name);
    asyncFetch();
  };

  return (
    <Card>
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
              src={getRegistryLogo(selectedRecord?.provider)}
            />
            Connexion for {selectedRecord?.provider}
          </>
        }
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
            style={{ width: '100%', marginBottom: '5px' }}
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
              style={{ width: '100%', marginBottom: '5px' }}
            >
              <Alert
                message="Custom registry provider creation"
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
                    if (
                      registries.find((e) => e.name === value) === undefined
                    ) {
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
      <ProList<any>
        size={'large'}
        ghost={ghost}
        itemCardProps={{
          ghost,
        }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: false,
        }}
        showActions="hover"
        rowSelection={false}
        grid={{ gutter: 16, column: 3 }}
        onItem={(record) => {
          return {
            onMouseEnter: () => {
              console.log(record);
            },
            onClick: () => {
              console.log(record);
              if (record.canAuth) {
                setSelectedRecord(record);
                setModalOpened(true);
              } else {
                message.info({
                  content: 'You cannot set this registry',
                  duration: 5,
                });
              }
            },
          };
        }}
        metas={{
          title: {},
          subTitle: {},
          type: {},
          avatar: {},
          content: {},
          actions: {},
          authScheme: {},
          canAuth: false,
          provider: {},
          name: {},
          authSet: false,
        }}
        headerTitle="Registries"
        dataSource={registries
          .concat({
            name: 'custom',
            provider: 'custom',
            authSet: false,
            canAuth: true,
            authScheme: [
              {
                name: 'url',
                type: 'string',
              },
              {
                name: 'Connection Type',
                type: 'choice',
                values: [
                  [
                    {
                      name: 'login',
                      type: 'string',
                    },
                    {
                      name: 'password',
                      type: 'string',
                    },
                  ],
                  [
                    {
                      name: 'auth',
                      type: 'string',
                    },
                  ],
                ],
              },
            ],
          })
          .map((item: API.ContainerRegistry) => ({
            title:
              item.name === 'custom'
                ? 'Add a new custom provider'
                : item.name?.toUpperCase(),
            name: item.name,
            authScheme: item.authScheme,
            provider: item.provider,
            subTitle: <></>,
            canAuth: item.canAuth,
            authSet: item.authSet,
            actions: [
              item.name !== 'custom' && item.authSet ? (
                item.provider === 'custom' ? (
                  <Tooltip title={'Delete this custom registry'}>
                    {' '}
                    <Popconfirm
                      title={
                        'Are you sure ? This will delete the registry and auth data'
                      }
                      onConfirm={() => onDeleteRegistry(item)}
                    >
                      <Button danger icon={<DeleteOutline />}>
                        Delete
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                ) : (
                  <Tooltip
                    title={
                      'Reset this registry back to anonymous authentication'
                    }
                  >
                    <Popconfirm
                      title={'Are you sure ? This will delete the auth data'}
                      onConfirm={() => onResetRegistry(item)}
                    >
                      {' '}
                      <Button danger icon={<UndoOutlined />}>
                        Reset
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                )
              ) : (
                <></>
              ),
            ],
            avatar: (
              <Avatar
                size={50}
                shape="square"
                style={{
                  marginRight: 4,
                  backgroundColor: 'rgba(41,70,147,0.51)',
                }}
                src={getRegistryLogo(item.provider)}
              />
            ),
            content: (
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    width: 300,
                  }}
                >
                  <div>
                    {(item.name !== 'custom' &&
                      ((item.authSet && (
                        <Tag color={'cyan'}>Authentified</Tag>
                      )) || <Tag color={'magenta'}>Anonymous</Tag>)) ||
                      ''}
                  </div>
                </div>
              </div>
            ),
          }))}
      />
    </Card>
  );
};

export default RegistrySettings;
