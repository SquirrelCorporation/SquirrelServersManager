import { fetchAvailablePlugins, installPlugin } from '@/services/api';
import { InstalledPluginMetadata, PluginInfo } from '@/types/plugin.types'; // Use correct types
import {
  CheckCircleOutlined,
  DownloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  List,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import RepositoryManagementModal from './RepositoryManagementModal';

const { Text, Paragraph } = Typography;

interface PluginStoreTabProps {
  installedPlugins: InstalledPluginMetadata[]; // Use correct type
  refreshInstalledPlugins: () => void; // Add the refresh function prop
}

const PluginStoreTab: React.FC<PluginStoreTabProps> = ({
  installedPlugins,
  refreshInstalledPlugins,
}) => {
  const [availablePlugins, setAvailablePlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [installing, setInstalling] = useState<Record<string, boolean>>({}); // Track installing state per plugin
  const [isRepoModalVisible, setIsRepoModalVisible] = useState(false);

  const loadPlugins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const plugins = await fetchAvailablePlugins();
      setAvailablePlugins(plugins);
    } catch (err: any) {
      setError(err);
      console.error('Failed to load available plugins:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlugins();
  }, [loadPlugins]);

  // Create a Set of installed plugin IDs for quick lookups
  const installedPluginIds = useMemo(() => {
    return new Set(installedPlugins.map((p) => p.id));
  }, [installedPlugins]);

  const handleInstall = async (plugin: PluginInfo) => {
    setInstalling((prev) => ({ ...prev, [plugin.id]: true }));
    message.loading({
      content: `Installing ${plugin.name}...`,
      key: plugin.id,
    });
    try {
      await installPlugin(plugin.packageUrl, plugin.checksum);
      message.success({
        content: `${plugin.name} installed successfully!`,
        key: plugin.id,
        duration: 3,
      });
      refreshInstalledPlugins();
    } catch (err: any) {
      console.error(`Failed to install ${plugin.name}:`, err);
      message.error({
        content: `Failed to install ${plugin.name}: ${err.message}`,
        key: plugin.id,
        duration: 5,
      });
    } finally {
      setInstalling((prev) => ({ ...prev, [plugin.id]: false }));
    }
  };

  const handleRepositoriesUpdate = () => {
    loadPlugins();
  };

  if (loading) {
    return <Spin tip="Loading available plugins..." />;
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Plugins"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        <Tooltip title="Manage Custom Repositories">
          <Button
            icon={<SettingOutlined />}
            onClick={() => setIsRepoModalVisible(true)}
          />
        </Tooltip>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={availablePlugins}
        renderItem={(plugin) => {
          const isInstalled = installedPluginIds.has(plugin.id);
          const isInstalling = installing[plugin.id];

          return (
            <List.Item
              key={plugin.id}
              actions={[
                isInstalled ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Installed
                  </Tag>
                ) : (
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => handleInstall(plugin)}
                    loading={isInstalling}
                    disabled={isInstalling}
                  >
                    {isInstalling ? 'Installing...' : 'Install'}
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={plugin.iconUrl} shape="square" />} // Use iconUrl if provided
                title={`${plugin.name} (${plugin.id})`}
                description={plugin.description}
              />
              <Space
                direction="vertical"
                size="small"
                style={{ fontSize: '0.9em' }}
              >
                <Text type="secondary">Version: {plugin.version}</Text>
                {plugin.author && (
                  <Text type="secondary">Author: {plugin.author}</Text>
                )}
              </Space>
            </List.Item>
          );
        }}
        locale={{ emptyText: 'No plugins found in configured repositories.' }}
      />
      <RepositoryManagementModal
        visible={isRepoModalVisible}
        onClose={() => setIsRepoModalVisible(false)}
        onRepositoriesUpdate={handleRepositoriesUpdate}
      />
    </Space>
  );
};

export default PluginStoreTab;
