import { uninstallPlugin } from '@/services/rest/plugin-store.service';
import { InstalledPluginMetadata } from '@/types/plugin.types';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Link } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  List,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useState } from 'react';

const { Text, Paragraph } = Typography;

interface InstalledPluginsListProps {
  plugins: InstalledPluginMetadata[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

const InstalledPluginsList: React.FC<InstalledPluginsListProps> = ({
  plugins,
  loading,
  error,
  onRefresh,
}) => {
  const [uninstalling, setUninstalling] = useState<Record<string, boolean>>({});

  const handleUninstall = (plugin: InstalledPluginMetadata) => {
    Modal.confirm({
      title: `Uninstall ${plugin.name}?`,
      content: `Are you sure you want to uninstall the plugin "${plugin.name}"? This action cannot be undone. Plugin data might be lost unless backed up. `,
      okText: 'Uninstall',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setUninstalling((prev) => ({ ...prev, [plugin.id]: true }));
        message.loading({
          content: `Uninstalling ${plugin.name}...`,
          key: plugin.id,
          duration: 0,
        });
        try {
          await uninstallPlugin(plugin.id);
          message.success({
            content: `${plugin.name} uninstalled successfully!`,
            key: plugin.id,
            duration: 3,
          });
          onRefresh();
        } catch (err: any) {
          console.error(`Failed to uninstall ${plugin.name}:`, err);
          message.error({
            content: `Failed to uninstall ${plugin.name}: ${err.message || 'Unknown error'}`,
            key: plugin.id,
            duration: 5,
          });
        } finally {
          setUninstalling((prev) => ({ ...prev, [plugin.id]: false }));
        }
      },
    });
  };

  return (
    <Card
      title="Installed Plugins"
      bordered={false}
      extra={
        <Button type="primary" onClick={onRefresh} loading={loading}>
          Refresh Plugins
        </Button>
      }
    >
      <Spin spinning={loading} tip="Loading installed plugins...">
        {error && (
          <Paragraph type="danger">
            Error loading plugins: {error?.message}
          </Paragraph>
        )}
        <List
          itemLayout="horizontal"
          dataSource={plugins}
          renderItem={(plugin) => {
            const hasPage = plugin.client?.hasDedicatedPage;
            const pageUrl = `/plugins/${plugin.id}`;
            const iconUrl = `/static-plugins/client/${plugin.id}/icon.svg`;
            const isUninstalling = uninstalling[plugin.id];

            return (
              <List.Item
                key={plugin.id}
                actions={[
                  plugin.author && (
                    <Text key="author">Author: {plugin.author}</Text>
                  ),
                  hasPage && (
                    <Link to={pageUrl} key="open-page">
                      <Button icon={<LinkOutlined />}>Open Page</Button>
                    </Link>
                  ),
                  <Button
                    key="uninstall"
                    icon={
                      isUninstalling ? (
                        <Spin size="small" />
                      ) : (
                        <DeleteOutlined />
                      )
                    }
                    danger
                    onClick={() => handleUninstall(plugin)}
                    disabled={isUninstalling}
                  >
                    {isUninstalling ? 'Uninstalling...' : 'Uninstall'}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={iconUrl} shape="square" size={'large'} />
                  }
                  title={`${plugin.name} (${plugin.id})`}
                  description={plugin.description}
                />
                {plugin.permissions && plugin.permissions.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Permissions:</Text>
                    <div style={{ marginTop: 8 }}>
                      {plugin.permissions.map((permission: string) => (
                        <Tag key={permission} color="blue">
                          {permission}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
                <Text key="version">Version: {plugin.version}</Text>
              </List.Item>
            );
          }}
          locale={{
            emptyText: loading
              ? ' '
              : 'No plugins installed or failed to load metadata.',
          }}
        />
      </Spin>
    </Card>
  );
};

export default InstalledPluginsList;
