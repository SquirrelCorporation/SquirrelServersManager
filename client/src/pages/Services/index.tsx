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
import { Tabs, TabsProps } from 'antd';
import React, { useEffect } from 'react';
import { history, useLocation } from '@umijs/max';

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
            title={'Services'}
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
