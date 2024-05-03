import ServiceQuickActionDropDown from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionDropDown';
import ServiceQuickActionReference, {
  ServiceQuickActionReferenceActions,
  ServiceQuickActionReferenceTypes,
} from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionReference';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import InfoToolTipCard from '@/pages/Services/components/InfoToolTipCard';
import StatusTag from '@/pages/Services/components/StatusTag';
import UpdateAvailableTag from '@/pages/Services/components/UpdateAvailableTag';
import {
  getContainers,
  updateContainerCustomName,
} from '@/services/rest/containers';
import { AppstoreOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProList,
} from '@ant-design/pro-components';
import { Avatar, Flex, message, Progress, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';

const Index: React.FC = () => {
  const [cardActionProps] = useState<'actions' | 'extra'>('extra');
  const [ghost] = useState<boolean>(false);
  const [containers, setContainers] = useState<API.Container[]>([]);
  const [
    isEditContainerCustomNameModalOpened,
    setIsEditContainerCustomNameModalOpened,
  ] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState();

  const asyncFetch = async () => {
    await getContainers().then((list) => {
      if (list?.data) {
        setContainers(list.data?.containers || []);
      }
    });
  };
  useEffect(() => {
    asyncFetch();
  }, []);

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

  const colorPalette = [
    '#f56a00',
    '#234398',
    '#801872',
    '#807718',
    '#476e2f',
    '#188030',
    '#801843',
    '#561880',
    '#19554e',
    '#184280',
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
          }
          await updateContainerCustomName(
            values.customName,
            selectedRecord?.id,
          );
          await asyncFetch();
          setIsEditContainerCustomNameModalOpened(false);
          message.success({ content: 'Container properties updated' });
          return true;
        }}
      >
        <ProFormText
          name={'customName'}
          label={'Name'}
          initialValue={selectedRecord?.title}
        />
      </ModalForm>
      <ProList<any>
        size={'large'}
        ghost={ghost}
        itemCardProps={{
          ghost,
        }}
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
          title: {},
          subTitle: {},
          type: {},
          avatar: {},
          content: {},
          actions: { cardActionProps },
          id: {},
        }}
        headerTitle="Containers"
        dataSource={containers.map((item) => ({
          id: item.id,
          title: item.customName || item.name,
          subTitle: (
            <>
              <StatusTag status={item.status} />
              <UpdateAvailableTag updateAvailable={item.updateAvailable} />
            </>
          ),
          actions: [
            <Tooltip
              color={'transparent'}
              title={<InfoToolTipCard item={item} />}
            >
              <InfoCircleOutlined style={{ color: 'rgb(22, 104, 220)' }} />
            </Tooltip>,
            <a
              key="quickAction"
              onClick={() => {
                console.log(item);
              }}
            >
              <ServiceQuickActionDropDown
                onDropDownClicked={handleQuickAction}
              />
            </a>,
          ],
          avatar: (
            <Avatar
              size={50}
              shape="square"
              style={{
                marginRight: 4,
                backgroundColor:
                  colorPalette[
                    (item.id?.charCodeAt(0) || 0) % colorPalette.length
                  ],
              }}
            >
              {item.customName?.slice(0, 4) || item.name?.slice(0, 4)}
            </Avatar>
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
                  On <Tag color="black">{item.device?.ip}</Tag>
                </div>
                <Flex gap="middle">
                  <Progress
                    strokeColor={{ from: '#10e967', to: '#d12b44' }}
                    size={'small'}
                    percent={80}
                  />{' '}
                  <Progress
                    strokeColor={{ from: '#10e967', to: '#d12b44' }}
                    size={'small'}
                    percent={80}
                  />
                </Flex>
              </div>
            </div>
          ),
        }))}
      />
    </PageContainer>
  );
};

export default Index;
