import RegistryLogo from '@/components/RegistryComponents/RegistryLogo';
import RegistryModal from '@/pages/Admin/Settings/components/subcomponents/RegistryModal';
import {
  getRegistries,
  removeRegistry,
  resetRegistry,
} from '@/services/rest/containers/container-registries';
import {
  CheckCircleOutlined,
  MinusCircleOutlined,
  UndoOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { message } from '@shared/ui/feedback/DynamicMessage';
import { Avatar, Button, Card, Popconfirm, Tag, Tooltip } from 'antd';
import { AddCircleOutline, DeleteOutline } from 'antd-mobile-icons';
import React, { useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';
import InfoLinkWidget from '@/components/Shared/InfoLinkWidget';

const addRecord = {
  name: 'custom',
  provider: 'custom',
  authSet: false,
  canAuth: true,
  canAnonymous: false,
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
};

const RegistrySettings: React.FC = () => {
  const [registries, setRegistries] = useState<API.ContainerRegistry[]>([]);
  const asyncFetch = async () => {
    await getRegistries().then((list) => {
      if (list?.data) {
        setRegistries(
          list.data?.registries.sort(
            (a: API.ContainerRegistry, b: API.ContainerRegistry) =>
              a.authSet && !b.authSet ? -1 : 1,
          ) || [],
        );
      }
    });
  };
  useEffect(() => {
    void asyncFetch();
  }, []);

  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any>();

  const onDeleteRegistry = async (item: API.ContainerRegistry) => {
    await removeRegistry(item.name);
    void asyncFetch();
  };
  const onResetRegistry = async (item: API.ContainerRegistry) => {
    await resetRegistry(item.name);
    void asyncFetch();
  };

  return (
    <Card>
      <RegistryModal
        registries={registries}
        setModalOpened={setModalOpened}
        modalOpened={modalOpened}
        selectedRecord={selectedRecord}
        asyncFetch={asyncFetch}
      />
      <ProList<any>
        size={'large'}
        ghost={false}
        itemCardProps={{
          ghost: false,
        }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: false,
        }}
        toolBarRender={() => [
          <Button
            icon={<AddCircleOutline />}
            key="3"
            type="primary"
            onClick={() => {
              setSelectedRecord(addRecord);
              setModalOpened(true);
            }}
          >
            Add a custom registry
          </Button>,
          <InfoLinkWidget
            tooltipTitle="Help for registries."
            documentationLink="https://squirrelserversmanager.io/docs/user-guides/settings/registry"
          />,
        ]}
        showActions="hover"
        rowSelection={false}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 3 }}
        onItem={(record) => {
          return {
            onClick: () => {
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
          canAnonymous: false,
        }}
        headerTitle="Registries"
        dataSource={registries.map((item: API.ContainerRegistry) => ({
          title: item.name?.toUpperCase(),
          name: item.name,
          authScheme: item.authScheme,
          provider: item.provider,
          canAnonymous: item.canAnonymous,
          subTitle: item.fullName,
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
                  title={'Reset this registry back to anonymous authentication'}
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
                flexShrink: 0,
              }}
              src={<RegistryLogo provider={item.provider} />}
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
                      <Tag icon={<CheckCircleOutlined />} color={'cyan'}>
                        Authentified
                      </Tag>
                    )) ||
                      (item.canAnonymous && (
                        <Tag icon={<UserOutlined />} color={'magenta'}>
                          Anonymous
                        </Tag>
                      )))) || (
                    <Tag icon={<MinusCircleOutlined />} color={'geekblue'}>
                      Deactivated
                    </Tag>
                  )}
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
