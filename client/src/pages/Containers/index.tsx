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
import { ApartmentOutlined, AppstoreOutlined } from '@ant-design/icons';
import React from 'react';
import StyledTabContainer, {
  TabLabel,
  IconWrapper,
} from '@/components/Layout/StyledTabContainer';

const Index: React.FC = () => {
  const items = [
    {
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #32D74B, #27AE60)">
            <AppstoreOutlined />
          </IconWrapper>
          Containers
        </TabLabel>
      ),
      key: 'containers',
      children: <Containers />,
    },
    {
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #5856D6, #3634A3)">
            <Templatetoolkit />
          </IconWrapper>
          Store
        </TabLabel>
      ),
      key: 'store',
      children: <Templates />,
    },
    {
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #FF9500, #E67C22)">
            <ApartmentOutlined />
          </IconWrapper>
          Stacks
        </TabLabel>
      ),
      key: 'stacks',
      children: <Stacks />,
    },
    {
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #64D2FF, #5AC8FA)">
            <ContainerImage />
          </IconWrapper>
          Images
        </TabLabel>
      ),
      key: 'images',
      children: <Images />,
    },
    {
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #BF5AF2, #9D4ECA)">
            <ContainerVolumeSolid />
          </IconWrapper>
          Volumes
        </TabLabel>
      ),
      key: 'volumes',
      children: <Volumes />,
    },
    {
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #FF375F, #E31B4E)">
            <ElNetwork />
          </IconWrapper>
          Networks
        </TabLabel>
      ),
      key: 'networks',
      children: <Networks />,
    },
  ];

  return (
    <StyledTabContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Containers'}
            backgroundColor={TitleColors.PLAYBOOKS}
            icon={<AppstoreOutlined />}
          />
        ),
      }}
      tabItems={items}
    />
  );
};

export default Index;
