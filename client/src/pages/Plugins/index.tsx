import Title, { TitleColors } from '@/components/Template/Title';
import { usePlugins } from '@/plugins/contexts/plugin-context';
import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import React from 'react';
import InstalledPluginsList from './components/InstalledPluginsList';
import PluginStoreTab from './components/PluginStoreTab';
import StyledTabContainer, {
  TabLabel,
  IconWrapper,
} from '@/components/Layout/StyledTabContainer';

const PluginsPage: React.FC = () => {
  const { pluginMetadata, loading, error, refreshPlugins } = usePlugins();

  const tabItems = [
    {
      key: 'installed',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #0A84FF, #007AFF)">
            {' '}
            <AppstoreOutlined />
          </IconWrapper>
          Installed
        </TabLabel>
      ),
      children: (
        <InstalledPluginsList
          plugins={pluginMetadata || []}
          loading={loading}
          error={error}
          onRefresh={refreshPlugins}
        />
      ),
    },
    {
      key: 'store',
      label: (
        <TabLabel>
          <IconWrapper $bgColor="linear-gradient(145deg, #30D158, #28A745)">
            {' '}
            <CloudDownloadOutlined />
          </IconWrapper>
          Store
        </TabLabel>
      ),
      children: (
        <PluginStoreTab
          installedPlugins={pluginMetadata || []}
          refreshInstalledPlugins={refreshPlugins}
        />
      ),
    },
  ];

  return (
    <StyledTabContainer
      header={{
        title: (
          <Title.MainTitle
            title="Plugins"
            backgroundColor={TitleColors.SETTINGS}
            icon={<AppstoreAddOutlined />}
          />
        ),
      }}
      tabItems={tabItems}
      defaultActiveKey="installed"
    />
  );
};

export default PluginsPage;
