import Title from '@/components/Template/Title';
import { usePlugins } from '@/plugins/contexts/plugin-context';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, List, Modal, Space, Tag, Typography } from 'antd';
import React, { useState } from 'react';

const { Text, Paragraph } = Typography;

const PluginsPage: React.FC = () => {
  const { pluginMetadata, pluginRegistry, loading, error, refreshPlugins } =
    usePlugins();
  const [pluginModalVisible, setPluginModalVisible] = useState(false);
  const [currentPlugin, setCurrentPlugin] = useState<string | null>(null);

  const handleRefresh = () => {
    refreshPlugins();
  };

  const openPluginModal = (pluginName: string) => {
    setCurrentPlugin(pluginName);
    setPluginModalVisible(true);
  };

  const closePluginModal = () => {
    setPluginModalVisible(false);
    setCurrentPlugin(null);
  };

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title="Plugins"
            subtitle="Manage and view installed plugins"
            backgroundColor="blue"
            icon={<AppstoreOutlined />}
          />
        ),
      }}
    >
      <Card
        title="Installed Plugins"
        extra={
          <Button type="primary" onClick={handleRefresh}>
            Refresh Plugins
          </Button>
        }
        loading={loading}
      >
        {error && (
          <Paragraph type="danger">
            Error loading plugins: {error.message}
          </Paragraph>
        )}

        <List
          itemLayout="vertical"
          dataSource={pluginMetadata}
          renderItem={(plugin) => (
            <List.Item
              key={plugin.name}
              actions={[
                <Space key="status">
                  <Text>Status:</Text>
                  {plugin.enabled ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Enabled
                    </Tag>
                  ) : (
                    <Tag color="error" icon={<CloseCircleOutlined />}>
                      Disabled
                    </Tag>
                  )}
                </Space>,
                <Text key="version">Version: {plugin.version}</Text>,
                plugin.author && (
                  <Text key="author">Author: {plugin.author}</Text>
                ),
                plugin.enabled ||
                  (true && (
                    <Button
                      key="open"
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => openPluginModal(plugin.name)}
                    >
                      Open Plugin
                    </Button>
                  )),
              ]}
            >
              <List.Item.Meta
                title={plugin.name}
                description={plugin.description}
              />

              {plugin.permissions && (
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
            </List.Item>
          )}
          locale={{ emptyText: 'No plugins installed' }}
        />
      </Card>

      <Modal
        title={`Plugin: ${currentPlugin}`}
        open={pluginModalVisible}
        onCancel={closePluginModal}
        width="80%"
        style={{ top: 20 }}
        footer={null}
        bodyStyle={{ padding: 0, height: '80vh' }}
      >
        {currentPlugin && (
          <iframe
            src={`/api/static-plugins/${currentPlugin.toLowerCase()}`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`Plugin: ${currentPlugin}`}
          />
        )}
      </Modal>
    </PageContainer>
  );
};

export default PluginsPage;
