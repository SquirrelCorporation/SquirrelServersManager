import { ContainerImage, ContainerVolumeSolid } from '@shared/ui/icons/categories/containers';
import { ElNetwork } from '@shared/ui/icons/categories/system';
import { Templatetoolkit } from '@shared/ui/icons/categories/automation';
import { PageTitle, TitleColors } from '@shared/ui/templates/PageTitle';
import Containers from '@/pages/Containers/components/Containers';
import ImagesWrapper from '@/pages/Containers/components/ImagesWrapper';
import Networks from '@/pages/Containers/components/Networks';
import Stacks from '@/pages/Containers/components/Stacks';
import Templates from '@/pages/Containers/components/Templates';
import VolumesWrapper from '@/pages/Containers/components/VolumesWrapper';
import { ApartmentOutlined, AppstoreOutlined } from '@ant-design/icons';
import React from 'react';
import { StyledTabContainer, TabLabel, IconWrapper } from '@shared/ui/layouts/StyledTabContainer';

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
      children: <ImagesWrapper />,
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
      children: <VolumesWrapper />,
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
          <PageTitle
            title={'Containers'}
            backgroundColor={TitleColors.PLAYBOOKS}
            icon={<AppstoreOutlined />}
            isMain={true}
          />
        ),
      }}
      tabItems={items}
    />
  );
};

export default Index;
