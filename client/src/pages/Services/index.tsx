import ServiceQuickActionDropDown from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionDropDown';
import ServiceQuickActionReference, {
  ServiceQuickActionReferenceActions,
  ServiceQuickActionReferenceTypes,
} from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionReference';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import AppStoreModal from '@/pages/Services/components/AppStoreModal';
import ContainerStatProgress from '@/pages/Services/components/ContainerStatProgress';
import InfoToolTipCard from '@/pages/Services/components/InfoToolTipCard';
import StatusTag from '@/pages/Services/components/StatusTag';
import UpdateAvailableTag from '@/pages/Services/components/UpdateAvailableTag';
import {
  getContainers,
  postRefreshAll,
  updateContainerCustomName,
} from '@/services/rest/containers';
import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  ModalForm,
  PageContainer,
  ProFormText,
  ProList,
} from '@ant-design/pro-components';
import { Avatar, Button, Flex, message, Popover, Tag, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';

const Index: React.FC = () => {
  const [cardActionProps] = useState<'actions' | 'extra'>('extra');
  const actionRef = useRef<ActionType>();
  const [refreshAllIsLoading, setRefreshAllIsLoading] = useState(false);
  const [ghost] = useState<boolean>(false);
  const [
    isEditContainerCustomNameModalOpened,
    setIsEditContainerCustomNameModalOpened,
  ] = useState(false);
  const [appStoreModalOpened, setAppStoreModalOpened] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<
    API.Container | undefined
  >();

  const handleQuickAction = (idx: number) => {
    if (
      ServiceQuickActionReference[idx].type ===
      ServiceQuickActionReferenceTypes.ACTION
    ) {
      if (
        ServiceQuickActionReference[idx].action ===
        ServiceQuickActionReferenceActions.RENAME
      ) {
        setIsEditContainerCustomNameModalOpened(true);
      }
    }
  };

  const handleRefreshAll = () => {
    setRefreshAllIsLoading(true);
    postRefreshAll()
      .then(() => {
        actionRef?.current?.reload();
      })
      .finally(() => {
        setRefreshAllIsLoading(false);
      });
  };

  const hashCode = (str: string) => {
    let hash = 0,
      i,
      chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  const colorPalette = [
    '#f56a00',
    '#234398',
    '#801872',
    '#807718',
    '#476e2f',
    '#804018',
    '#238f26',
    '#188030',
    '#7e7123',
    '#801843',
    '#561880',
    '#19554e',
    '#184280',
    '#187780',
  ];

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Services'}
            backgroundColor={PageContainerTitleColors.PLAYBOOKS}
            icon={<AppstoreOutlined />}
          />
        ),
      }}
    >
      <AppStoreModal
        setOpen={setAppStoreModalOpened}
        open={appStoreModalOpened}
      />
      <ModalForm<{ customName: string }>
        title={`Edit container name`}
        open={isEditContainerCustomNameModalOpened}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setIsEditContainerCustomNameModalOpened(false),
        }}
        onFinish={async (values) => {
          if (!selectedRecord) {
            message.error({ content: 'Internal error, no selected record' });
            return;
          }
          if (selectedRecord && selectedRecord.id) {
            await updateContainerCustomName(
              values.customName,
              selectedRecord?.id,
            );
            actionRef?.current?.reload();
            setIsEditContainerCustomNameModalOpened(false);
            message.success({ content: 'Container properties updated' });
          }
          return true;
        }}
      >
        <ProFormText
          name={'customName'}
          label={'Name'}
          initialValue={selectedRecord?.customName || selectedRecord?.name}
        />
      </ModalForm>
      <ProList<any>
        size={'large'}
        ghost={ghost}
        itemCardProps={{
          ghost,
        }}
        toolBarRender={() => {
          return [
            <Button
              icon={<AppstoreAddOutlined />}
              key="appstore"
              type="primary"
              disabled={true}
              onClick={() => setAppStoreModalOpened(true)}
            >
              Store
            </Button>,
            <Button
              icon={<ReloadOutlined />}
              key="refresh"
              type="primary"
              loading={refreshAllIsLoading}
              onClick={handleRefreshAll}
            >
              Refresh
            </Button>,
          ];
        }}
        actionRef={actionRef}
        rowKey={'id'}
        pagination={{
          defaultPageSize: 8,
          showSizeChanger: false,
        }}
        showActions="hover"
        rowSelection={false}
        grid={{ gutter: 16, column: 3 }}
        onItem={(record: any) => {
          return {
            onMouseEnter: () => {
              setSelectedRecord(record);
            },
            onClick: () => {
              setSelectedRecord(record);
            },
          };
        }}
        metas={{
          title: {
            search: true,
            title: 'Name',
            render: (_, row) => {
              return row.customName || row.name;
            },
          },
          subTitle: {
            search: false,
            render: (_, row) => {
              return (
                <>
                  <StatusTag status={row.status} />
                  <UpdateAvailableTag updateAvailable={row.updateAvailable} />
                </>
              );
            },
          },
          updateAvailable: {
            dataIndex: 'updateAvailable',
            title: 'Update Available',
          },
          avatar: {
            search: false,
            render: (_, row) => {
              return (
                <Avatar
                  size={50}
                  shape="square"
                  style={{
                    marginRight: 4,
                    backgroundColor:
                      colorPalette[
                        (row.id ? hashCode(row.id) : 0) % colorPalette.length
                      ],
                  }}
                >
                  {row.customName?.slice(0, 4) || row.name?.slice(0, 4)}
                </Avatar>
              );
            },
          },
          content: {
            search: false,
            render: (_, row) => {
              return (
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
                    <>
                      On{' '}
                      <Popover content={row.device?.fqdn}>
                        <Tag color="black">{row.device?.ip}</Tag>
                      </Popover>
                      <Flex gap="middle">
                        <ContainerStatProgress containerId={row.id} />
                      </Flex>
                    </>
                  </div>
                </div>
              );
            },
          },
          actions: {
            cardActionProps,
            search: false,
            render: (text, row) => [
              <Tooltip
                key={`info-${row.id}`}
                color={'transparent'}
                title={<InfoToolTipCard item={row} />}
              >
                <InfoCircleOutlined style={{ color: 'rgb(22, 104, 220)' }} />
              </Tooltip>,
              <a
                key={`quickAction-${row.id}`}
                onClick={() => {
                  setSelectedRecord(row);
                }}
              >
                <ServiceQuickActionDropDown
                  onDropDownClicked={handleQuickAction}
                />
              </a>,
            ],
          },
          id: {
            dataIndex: 'id',
            search: false,
          },
        }}
        headerTitle="Containers"
        request={async (params = {}) => {
          return await getContainers().then((e) => {
            return { data: e.data?.containers || [] };
          });
        }}
      />
    </PageContainer>
  );
};

export default Index;
