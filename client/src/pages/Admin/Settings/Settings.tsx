import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import AdvancedSettings from '@/pages/Admin/Settings/components/AdvancedSettings';
import PlaybookSettings from '@/pages/Admin/Settings/components/PlaybooksSettings';
import RegistrySettings from '@/pages/Admin/Settings/components/RegistrySettings';
import AuthenticationSettings from '@/pages/Admin/Settings/components/AuthenticationSettings';
import GeneralSettings from '@/pages/Admin/Settings/components/GeneralSettings';
import Information from '@/pages/Admin/Settings/components/Information';
import { InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import React from 'react';

const Settings: React.FC = () => {
  const settingsTabItems = [
    {
      key: '1',
      label: (
        <div>
          <SettingOutlined /> General settings
        </div>
      ),
      children: <GeneralSettings />,
    },
    {
      key: '2',
      label: (
        <div>
          <SettingOutlined /> Authentication
        </div>
      ),
      children: <AuthenticationSettings />,
    },
    {
      key: '3',
      label: (
        <div>
          <SettingOutlined /> Playbooks
        </div>
      ),
      children: <PlaybookSettings />,
    },
    {
      key: '4',
      label: (
        <div>
          <SettingOutlined /> Container Registries
        </div>
      ),
      children: <RegistrySettings />,
    },
    {
      key: '5',
      label: (
        <div>
          <SettingOutlined /> Advanced
        </div>
      ),
      children: <AdvancedSettings />,
    },
    {
      key: '6',
      label: (
        <div>
          <InfoCircleOutlined /> System Information
        </div>
      ),
      children: <Information />,
    },
  ];
  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Settings'}
            backgroundColor={PageContainerTitleColors.SETTINGS}
            icon={<SettingOutlined />}
          />
        ),
      }}
      tabList={settingsTabItems}
    />
  );
};

export default Settings;
