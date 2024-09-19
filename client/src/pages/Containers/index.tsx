import {
  ContainerImage,
  ContainerVolumeSolid,
  ElNetwork,
  Templatetoolkit,
} from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import Containers from '@/pages/Containers/components/Containers';
import Images from '@/pages/Containers/components/Images';
import Networks from '@/pages/Containers/components/Networks';
import Stacks from '@/pages/Containers/components/Stacks';
import Templates from '@/pages/Containers/components/Templates';
import Volumes from '@/pages/Containers/components/Volumes';
import { AppstoreOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation } from '@umijs/max';
import { TabsProps } from 'antd';
import React, { useEffect } from 'react';

const Index: React.FC = () => {
  const location = useLocation();

  const items: TabsProps['items'] = [
    {
      label: 'Containers',
      key: 'containers',
      icon: <AppstoreOutlined />,
      children: <Containers />,
    },
    {
      label: 'Store',
      key: 'store',
      icon: <Templatetoolkit />,
      children: <Templates />,
    },
    {
      label: 'Stacks',
      key: 'stacks',
      icon: <Templatetoolkit />,
      children: <Stacks />,
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

  // Function to handle tab change
  const handleTabChange = (key: string) => {
    history.replace(`#${key}`);
  };

  // Sync active tab with the hash in the URL
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!items.some((item) => item.key === hash)) return;
    // Sync the initially selected tab with the hash in the URL
    handleTabChange(hash);
  }, [location.hash]);

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Containers'}
            backgroundColor={TitleColors.PLAYBOOKS}
            icon={<AppstoreOutlined />}
          />
        ),
      }}
      tabList={items}
      onTabChange={handleTabChange}
      tabActiveKey={location.hash.replace('#', '') || items[0].key}
    />
  );
};

export default Index;
