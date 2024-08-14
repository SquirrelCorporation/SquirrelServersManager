import {
  ContainerImage,
  ContainerVolumeSolid,
  ElNetwork,
  PromptTemplate,
  Templatetoolkit,
} from '@/components/Icons/CustomIcons';
import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import Containers from '@/pages/Services/components/Containers';
import Images from '@/pages/Services/components/Images';
import Networks from '@/pages/Services/components/Networks';
import Templates from '@/pages/Services/components/Templates';
import Volumes from '@/pages/Services/components/Volumes';
import { AppstoreOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Menu, MenuProps } from 'antd';
import React, { useState } from 'react';
import { TerminalContextProvider } from 'react-terminal';

type MenuItem = Required<MenuProps>['items'][number];

const Index: React.FC = () => {
  const [current, setCurrent] = useState('containers');
  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };
  const items: MenuItem[] = [
    {
      label: 'Containers',
      key: 'containers',
      icon: <AppstoreOutlined />,
    },
    {
      label: 'Templates',
      key: 'templates',
      icon: <Templatetoolkit />,
      onTitleClick: () => {
        setCurrent('templates');
      },
      children: [
        {
          icon: <Templatetoolkit />,
          label: 'Store',
          key: 'templates',
        },
        {
          icon: <PromptTemplate />,
          label: 'Custom templates',
          key: 'custom-templates',
          disabled: true,
        },
      ],
    },
    {
      label: 'Images',
      key: 'images',
      icon: <ContainerImage />,
    },
    {
      label: 'Volumes',
      key: 'volumes',
      icon: <ContainerVolumeSolid />,
    },
    {
      label: 'Networks',
      key: 'networks',
      icon: <ElNetwork />,
    },
  ];
  return (
    <TerminalContextProvider>
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
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={items}
        />
        {current === 'containers' && <Containers />}
        {current === 'templates' && <Templates />}
        {current === 'networks' && <Networks />}
        {current === 'volumes' && <Volumes />}
        {current === 'images' && <Images />}
      </PageContainer>
    </TerminalContextProvider>
  );
};

export default Index;
