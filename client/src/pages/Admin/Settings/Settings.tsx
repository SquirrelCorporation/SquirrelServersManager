import UserSettings from '@/pages/Admin/Settings/components/UserSettings';
import GeneralSettings from '@/pages/Admin/Settings/components/GeneralSettings';
import Information from '@/pages/Admin/Settings/components/Information';
import {
  InfoCircleOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Avatar, Col, Row, Tabs, Typography } from 'antd';
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
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: '#266ea8' }}
                shape="square"
                icon={<SettingOutlined />}
              />
            </Col>
            <Col
              style={{ marginLeft: 5, marginTop: 'auto', marginBottom: 'auto' }}
            >
              <Typography.Title
                style={{
                  marginLeft: 5,
                  marginTop: 'auto',
                  marginBottom: 'auto',
                }}
                level={4}
              >
                {' '}
                Settings
              </Typography.Title>
            </Col>
          </Row>
        ),
      }}
      tabList={settingsTabItems}
    />
  );
};

export default Settings;
