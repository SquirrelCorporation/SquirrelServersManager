import Title, { PageContainerTitleColors } from '@/components/Template/Title';
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
          <SettingOutlined /> Clean up
        </div>
      ),
    },
    {
      key: '4',
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
            title={'Logs'}
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
