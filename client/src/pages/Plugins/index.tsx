import Title, { TitleColors } from '@/components/Template/Title';
import { usePlugins } from '@/plugins/contexts/plugin-context';
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudDownloadOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Avatar, Button, Card, List, Space, Tabs, Tag, Typography } from 'antd';
import React from 'react';
import PluginStoreTab from './components/PluginStoreTab';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const PluginsPage: React.FC = () => {
  const { pluginMetadata, loading, error, refreshPlugins } = usePlugins();

  const handleRefresh = () => {
    refreshPlugins();
  };

  return (
    <PageContainer
      header={{
        title: (
          <Title.MainTitle
            title="Plugins"
            backgroundColor={TitleColors.SETTINGS}
            icon={<AppstoreOutlined />}
          />
        ),
      }}
    >
      <Tabs defaultActiveKey="installed">
        <TabPane tab="Installed" key="installed">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card
              title="Installed Plugins (Metadata from Server)"
              extra={
                <Button
                  type="primary"
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Refresh Plugins
                </Button>
              }
              loading={loading}
            >
              {error && (
                <Paragraph type="danger">
                  Error loading plugins: {error?.message}
                </Paragraph>
              )}

              <List
                itemLayout="vertical"
                dataSource={pluginMetadata}
                renderItem={(plugin) => {
                  const hasPage = plugin.client?.hasDedicatedPage;
                  const pageUrl = `/plugins/${plugin.id}`;
                  const iconUrl = `/static-plugins/client/${plugin.id}/icon.svg`;

                  return (
                    <List.Item
                      key={plugin.id}
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
                        hasPage && (
                          <Link to={pageUrl} key="open-page">
                            <Button icon={<LinkOutlined />}>Open Page</Button>
                          </Link>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar src={iconUrl} shape="square" size={'large'} />
                        }
                        title={`${plugin.name} (${plugin.id})`}
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
                  );
                }}
                locale={{
                  emptyText: 'No plugins installed or failed to load metadata.',
                }}
              />
            </Card>
          </Space>
        </TabPane>
        <TabPane
          tab={
            <span>
              <CloudDownloadOutlined />
              Store
            </span>
          }
          key="store"
        >
          <PluginStoreTab
            installedPlugins={pluginMetadata || []}
            refreshInstalledPlugins={refreshPlugins}
          />
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};

export default PluginsPage;
