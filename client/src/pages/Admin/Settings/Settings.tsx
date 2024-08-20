import Title, { TitleColors } from '@/components/Template/Title';
import AdvancedSettings from '@/pages/Admin/Settings/components/AdvancedSettings';
import AuthenticationSettings from '@/pages/Admin/Settings/components/AuthenticationSettings';
import GeneralSettings from '@/pages/Admin/Settings/components/GeneralSettings';
import Information from '@/pages/Admin/Settings/components/Information';
import PlaybookSettings from '@/pages/Admin/Settings/components/PlaybooksSettings';
import RegistrySettings from '@/pages/Admin/Settings/components/RegistrySettings';
import { InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import React, { useEffect } from 'react';
import { TabsProps } from 'antd';
import { history, useLocation } from '@umijs/max';

const Settings: React.FC = () => {
  const location = useLocation();

  const settingsTabItems: TabsProps['items'] = [
    {
      key: 'general-settings',
      label: (
        <div>
          <SettingOutlined /> General settings
        </div>
      ),
      children: <GeneralSettings />,
    },
    {
      key: 'authentication',
      label: (
        <div>
          <SettingOutlined /> Authentication
        </div>
      ),
      children: <AuthenticationSettings />,
    },
    {
      key: 'playbooks',
      label: (
        <div>
          <SettingOutlined /> Playbooks
        </div>
      ),
      children: <PlaybookSettings />,
    },
    {
      key: 'container-registries',
      label: (
        <div>
          <SettingOutlined /> Container Registries
        </div>
      ),
      children: <RegistrySettings />,
    },
    {
      key: 'advanced',
      label: (
        <div>
          <SettingOutlined /> Advanced
        </div>
      ),
      children: <AdvancedSettings />,
    },
    {
      key: 'system-information',
      label: (
        <div>
          <InfoCircleOutlined /> System Information
        </div>
      ),
      children: <Information />,
    },
  ];

  // Function to handle tab change
  const handleTabChange = (key: string) => {
    history.replace(`#${key}`);
  };

  // Sync active tab with the hash in the URL
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!settingsTabItems.some((item) => item.key === hash)) return;
    // Sync the initially selected tab with the hash in the URL
    handleTabChange(hash);
  }, [location.hash]);

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title={'Settings'}
            backgroundColor={TitleColors.SETTINGS}
            icon={<SettingOutlined />}
          />
        ),
      }}
      tabList={settingsTabItems}
      onTabChange={handleTabChange}
      tabActiveKey={location.hash.replace('#', '') || settingsTabItems[0].key}
    />
  );
};

export default Settings;
