import { fetchAvailablePlugins, installPlugin } from '@/services/rest/plugin-store.service';
import { InstalledPluginMetadata, PluginStoreInfo } from '@/types/plugin.types'; // Use correct types
import {
  CheckCircleOutlined,
  DownloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { ActionType, ProList } from '@ant-design/pro-components'; // Import ProList and ActionType
import {
  Avatar,
  Button,
  Space,
  Tag,
  Tooltip,
  Typography,
  Spin,
  Row,
  Col,
} from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PluginDetailModal from './PluginDetailModal';
import RepositoryManagementModal from './RepositoryManagementModal';
import message from '@/components/Message/DynamicMessage';

const { Text, Paragraph } = Typography;

interface PluginStoreTabProps {
  installedPlugins: InstalledPluginMetadata[]; // Use correct type
  refreshInstalledPlugins: () => void;
}

const PluginStoreTab: React.FC<PluginStoreTabProps> = ({
  installedPlugins,
  refreshInstalledPlugins,
}) => {
  const [availablePlugins, setAvailablePlugins] = useState<PluginStoreInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [installing, setInstalling] = useState<Record<string, boolean>>({});
  const [isRepoModalVisible, setIsRepoModalVisible] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPluginDetail, setSelectedPluginDetail] = useState<PluginStoreInfo | null>(null);
  const actionRef = useRef<ActionType>();

  const fetchPluginsForProList = useCallback(async (params: Record<string, any> = {}) => {
    console.log('ProList Params:', params); // Log params for debugging if needed
    try {
      const { data } = await fetchAvailablePlugins();
      return {
        data: data || [],
        success: true,
      };
    } catch (error: any) {
      console.error('Failed to load available plugins:', error);
      message.error({
        content: `Failed to load available plugins: ${error.message || 'Unknown error'}`,
        duration: 5,
      });
      return {
        data: [],
        success: false,
      };
    }
  }, []);

  const installedPluginIds = useMemo(() => {
    return new Set(installedPlugins.map((p) => p.id));
  }, [installedPlugins]);

  const handleInstall = useCallback(async (plugin: PluginStoreInfo) => {
    setInstalling((prev) => ({ ...prev, [plugin.id]: true }));
    message.loading({
      content: `Installing ${plugin.name}...`,
      duration: 15,
    });
    try {
      await installPlugin(plugin.packageUrl, plugin.checksum);
      message.success({
        content: `${plugin.name} installed successfully!`,
        duration: 3,
      });
      refreshInstalledPlugins();
      actionRef.current?.reload();
      setIsDetailModalOpen(false);
    } catch (err: any) {
      console.error(`Failed to install ${plugin.name}:`, err);
      message.error({
        content: `Failed to install ${plugin.name}: ${err.message}`,
        duration: 5,
      });
    } finally {
      setInstalling((prev) => ({
        ...prev,
        [plugin.id]: false,
      }));
    }
  }, [refreshInstalledPlugins]);

  const handleRepositoriesUpdate = useCallback(() => {
    actionRef.current?.reload();
  }, []);

  const openPluginDetails = (plugin: PluginStoreInfo) => {
    setSelectedPluginDetail(plugin);
    setIsDetailModalOpen(true);
  };

  const closePluginDetails = () => {
    setIsDetailModalOpen(false);
    setSelectedPluginDetail(null);
  };

  return (
    <>
      <ProList<PluginStoreInfo>
        actionRef={actionRef}
        headerTitle="Plugin Store"
        ghost={false}
        itemCardProps={{
          ghost: false,
          bodyStyle: { paddingBottom: 20 },
        }}
        pagination={{
          defaultPageSize: 9,
          showSizeChanger: false,
        }}
        showActions="hover"
        rowKey="id"
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 3 }}
        request={fetchPluginsForProList}
        onItem={(record: any) => {
          return {
            onClick: () => {
              setSelectedPluginDetail(record);
              setIsDetailModalOpen(true);
            },
          };
        }}
        toolBarRender={() => [
          <Tooltip title="Manage Custom Repositories" key="repo-manage">
            <Button
              icon={<SettingOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setIsRepoModalVisible(true);
              }}
            />
          </Tooltip>,
        ]}
        metas={{
          title: {
            dataIndex: 'name',
            render: (_, plugin) => (<>
                <Row>
                  <Col span={24}>{plugin.name} ({plugin.id})</Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Space size="small">
                      <Text type="secondary">v{plugin.version}</Text>
                      {plugin.author && (
                        <Text type="secondary">by {plugin.author}</Text>
                      )}
                    </Space>
                  </Col>
                </Row>
                </>
            ),
          },
          avatar: {
            dataIndex: 'iconUrl',
            render: (_, plugin) => (
                <Avatar
                  src={plugin.iconUrl}
                  shape="square"
                  size={50}
                  style={{
                    marginRight: 8,
                  }}
                />
            ),
          },
          content: {
            dataIndex: 'description',
            render: (_, plugin) => (
            
                <Paragraph
                  style={{ minHeight: '66px' }}
                  ellipsis={{ rows: 3, expandable: false, symbol: 'more' }}
                >
                  {plugin.description}
                </Paragraph>
            ),
          },
          actions: {
            cardActionProps: 'actions',
            render: (_, plugin) => {
              const isInstalled = installedPluginIds.has(plugin.id);
              const isInstalling = installing[plugin.id];
              const actions = [];

              if (isInstalled) {
                actions.push(
                  <Tag icon={<CheckCircleOutlined />} color="success" key="installed-tag">
                    Installed
                  </Tag>
                );
              } else {
                actions.push(
                  <a
                    key="install-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isInstalling) handleInstall(plugin);
                    }}
                    style={{
                      cursor: isInstalling ? 'not-allowed' : 'pointer',
                      pointerEvents: isInstalling ? 'none' : 'auto',
                      color: isInstalling ? 'rgba(0, 0, 0, 0.25)' : undefined
                     }}
                  >
                    {isInstalling ? (
                      <><Spin size="small" /> Installing...</>
                    ) : (
                      <><DownloadOutlined /> Install</>
                    )}
                  </a>
                );
              }
              
              return actions;
            },
          },
        }}
      />
      <RepositoryManagementModal
        open={isRepoModalVisible}
        onClose={() => setIsRepoModalVisible(false)}
        onRepositoriesUpdate={handleRepositoriesUpdate}
      />
      <PluginDetailModal 
        plugin={selectedPluginDetail}
        open={isDetailModalOpen}
        onClose={closePluginDetails}
      />
    </>
  );
};

export default PluginStoreTab;
