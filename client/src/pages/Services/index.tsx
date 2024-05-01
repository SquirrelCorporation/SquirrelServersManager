import ServiceQuickActionDropDown from '@/components/ServiceComponents/ServiceQuickAction/ServiceQuickActionDropDown';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import InfoToolTipCard from '@/pages/Services/components/InfoToolTipCard';
import StatusTag from '@/pages/Services/components/StatusTag';
import UpdateAvailableTag from '@/pages/Services/components/UpdateAvailableTag';
import { getContainers } from '@/services/rest/containers';
import { AppstoreOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { PageContainer, ProList } from '@ant-design/pro-components';
import { Avatar, Flex, Progress, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { API } from 'ssm-shared-lib';

const Index: React.FC = () => {
  const [cardActionProps] = useState<'actions' | 'extra'>('extra');
  const [ghost] = useState<boolean>(false);
  const [containers, setContainers] = useState<API.Container[]>([]);
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
              console.log(record);
            },
            onClick: () => {
              console.log(record);
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
        }}
        headerTitle="Containers"
        dataSource={containers.map((item) => ({
          title: item.name,
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
              <ServiceQuickActionDropDown onDropDownClicked={() => {}} />
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
              {item.name?.slice(0, 4)}
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
                  On <Tag color="black">127.0.0.1 </Tag>
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
