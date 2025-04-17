import Title, { TitleColors } from '@/components/Template/Title';
import { usePlugins } from '@/plugins/contexts/plugin-context';
import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  CloudDownloadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import React from 'react';
import InstalledPluginsList from './components/InstalledPluginsList';
import PluginStoreTab from './components/PluginStoreTab';

const PluginsPage: React.FC = () => {
  const { pluginMetadata, loading, error, refreshPlugins } = usePlugins();

  const tabItems: TabsProps['items'] = [
    {
      key: 'installed',
      label: 'Installed',
      icon: <AppstoreOutlined />,
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
      icon: <CloudDownloadOutlined />,
      label: 'Store',
      children: (
        <PluginStoreTab
          installedPlugins={pluginMetadata || []}
          refreshInstalledPlugins={refreshPlugins}
        />
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title="Plugins"
            backgroundColor={TitleColors.SETTINGS}
            icon={<AppstoreAddOutlined />}
          />
        ),
      }}
    >
      <Tabs defaultActiveKey="installed" items={tabItems} />
    </PageContainer>
  );
};

export default PluginsPage;
