import Title, { PageContainerTitleColors } from '@/components/Template/Title';
import AdvancedSettings from '@/pages/Admin/Settings/components/AdvancedSettings';
import RegistrySettings from '@/pages/Admin/Settings/components/RegistrySettings';
import UserSettings from '@/pages/Admin/Settings/components/UserSettings';
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
          <SettingOutlined /> User settings
        </div>
      ),
      children: <UserSettings />,
    },
    {
      key: '3',
      label: (
        <div>
          <SettingOutlined /> Registries
        </div>
      ),
      children: <RegistrySettings />,
    },
    {
      key: '4',
      label: (
        <div>
          <SettingOutlined /> Advanced
        </div>
      ),
      children: <AdvancedSettings />,
    },
    {
      key: '5',
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
