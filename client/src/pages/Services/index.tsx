import {
  ContainerImage,
  ContainerVolumeSolid,
  ElNetwork,
  Templatetoolkit,
} from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import Containers from '@/pages/Services/components/Containers';
import Images from '@/pages/Services/components/Images';
import Networks from '@/pages/Services/components/Networks';
import Templates from '@/pages/Services/components/Templates';
import Volumes from '@/pages/Services/components/Volumes';
import { AppstoreOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { TabsProps } from 'antd';
import React from 'react';

const Index: React.FC = () => {
  const items: TabsProps['items'] = [
    {
      label: 'Containers',
      key: 'containers',
      icon: <AppstoreOutlined />,
      children: <Containers />,
    },
    {
      label: 'Store',
      key: 'templates-main',
      icon: <Templatetoolkit />,
      children: <Templates />,
    },
    {
      label: 'Images',
      key: 'images',
      icon: <ContainerImage />,
      children: <Images />,
    },
    {
      label: 'Volumes',
      key: 'volumes',
      icon: <ContainerVolumeSolid />,
      children: <Volumes />,
    },
    {
      label: 'Networks',
      key: 'networks',
      icon: <ElNetwork />,
      children: <Networks />,
    },
  ];
  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Services'}
            backgroundColor={TitleColors.PLAYBOOKS}
            icon={<AppstoreOutlined />}
          />
        ),
      }}
      tabList={items}
    />
  );
};

export default Index;
