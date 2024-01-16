import CommonSettings from '@/pages/Admin/Settings/components/CommonSettings';
import DeviceSettings from '@/pages/Admin/Settings/components/DeviceSettings';
import Information from '@/pages/Admin/Settings/components/Information';
import { InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import React from 'react';

const GeneralSettings: React.FC = () => {
  const settingsTabItems = [
    {
      key: '1',
      label: (
        <div>
          <SettingOutlined /> General settings
        </div>
      ),
      children: <CommonSettings />,
    },
    {
      key: '2',
      label: (
        <div>
          <SettingOutlined /> Device settings
        </div>
      ),
      children: <DeviceSettings />,
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
    <PageContainer content={'This page can only be viewed by admin'}>
      <Tabs type={'card'} items={settingsTabItems} />
    </PageContainer>
  );
};

export default GeneralSettings;
