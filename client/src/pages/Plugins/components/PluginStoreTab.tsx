import {
  fetchAvailablePlugins,
  installPlugin,
} from '@/services/rest/plugin-store.service';
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
  Popconfirm,
} from 'antd';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PluginDetailModal from './PluginDetailModal';
import RepositoryManagementModal from './RepositoryManagementModal';
import message from '@/components/Message/DynamicMessage'; // Restore custom message import
import FullScreenLoader from '@/components/FullScreenLoader/FullScreenLoader'; // Updated import path

const { Text, Paragraph } = Typography;

// Define shimmer keyframes and styles
const highlightShimmerKeyframes = `
  @keyframes highlightShimmer {
    0% { background-position: 200% 0; } /* Start highlight off-screen left */
    100% { background-position: -200% 0; } /* End highlight off-screen right */
  }
`;

// Style for the highlight shimmer effect
const highlightShimmerStyle = {
  // Define base visibility and highlight with the gradient
  background: `linear-gradient(to right, 
    rgba(255,255,255,0.6) 20%, 
    rgba(255,255,255,1) 40%, 
    rgba(255,255,255,1) 60%, 
    rgba(255,255,255,0.6) 80%
  )`,
  backgroundSize: '200% auto',
  color: 'transparent',
  animation: 'highlightShimmer 2s linear infinite',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
};

const tagStyle: React.CSSProperties = {
  color: '#FFFFFF',
  fontWeight: 500,
};

interface PluginStoreTabProps {
  installedPlugins: InstalledPluginMetadata[]; // Use correct type
  refreshInstalledPlugins: () => void;
}

const PluginStoreTab: React.FC<PluginStoreTabProps> = ({
  installedPlugins,
  refreshInstalledPlugins,
}) => {
  const [availablePlugins, setAvailablePlugins] = useState<PluginStoreInfo[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [installing, setInstalling] = useState<Record<string, boolean>>({});
  const [isRepoModalVisible, setIsRepoModalVisible] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPluginDetail, setSelectedPluginDetail] =
    useState<PluginStoreInfo | null>(null);
  const actionRef = useRef<ActionType>();
  const [isRestarting, setIsRestarting] = useState(false);

  const fetchPluginsForProList = useCallback(
    async (params: Record<string, any> = {}) => {
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
    },
    [],
  );

  const installedPluginIds = useMemo(() => {
    return new Set(installedPlugins.map((p) => p.id));
  }, [installedPlugins]);

  // Define handlers for poll success/timeout
  const handlePollSuccess = useCallback(() => {
    console.log('Server restart polling successful.');
    setIsRestarting(false); // Hide loader
    setInstalling({}); // Reset all installing states
    refreshInstalledPlugins();
    actionRef.current?.reload();
    message.success({
      content: 'Plugin installed and server restarted successfully!',
    }); // Show success message here
  }, [refreshInstalledPlugins]);

  const handlePollTimeout = useCallback(() => {
    console.error('Server restart polling timed out.');
    setIsRestarting(false); // Hide loader
    setInstalling({}); // Reset all installing states
    // Optionally show an error message to the user
    message.error({
      content:
        'Server restart check timed out. Please check server status manually.',
    });
  }, []);

  const handleInstall = useCallback(
    async (plugin: PluginStoreInfo) => {
      setInstalling((prev) => ({ ...prev, [plugin.id]: true }));
      const key = message.loading({
        content: `Installing ${plugin.name}...`,
        duration: 0, // Keep loading until success/error/poll starts
      });
      setIsDetailModalOpen(false);

      try {
        await installPlugin(plugin.packageUrl, plugin.checksum);
        message.destroy(key); // Destroy initial loading message

        // Set Restarting State - Loader will handle polling start
        setIsRestarting(true);
      } catch (err: any) {
        message.destroy(key); // Ensure loading message is destroyed on error
        console.error(`Failed to install ${plugin.name}:`, err);
        setIsRestarting(false); // Ensure loader is hidden on install error
        setInstalling((prev) => ({ ...prev, [plugin.id]: false })); // Reset just this plugin's installing state
        message.error({
          content: `Failed to install ${plugin.name}: ${err.message}`,
        });
      }
    },
    [], // Removed refreshInstalledPlugins as it's now handled by handlePollSuccess
  );

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
      {/* Inject keyframes into the document head */}
      <style>{highlightShimmerKeyframes}</style>

      <FullScreenLoader
        isVisible={isRestarting}
        message="Restarting server..."
        onPollSuccess={handlePollSuccess}
        onPollTimeout={handlePollTimeout}
      />

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
            render: (_, plugin) => (
              <>
                <Row>
                  <Col span={24}>
                    {plugin.name} ({plugin.id})
                  </Col>
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
                  <a>
                    <Tag
                      color="#38A169"
                      key="installed-tag"
                      style={tagStyle}
                      icon={<CheckCircleOutlined />}
                    >
                      Installed
                    </Tag>
                  </a>,
                );
              } else {
                actions.push(
                  <Popconfirm
                    key="install-confirm"
                    title={`Install ${plugin.name}?`}
                    onConfirm={(e) => {
                      e?.stopPropagation(); // Prevent list item click
                      handleInstall(plugin);
                    }}
                    onCancel={(e) => {
                      e?.stopPropagation(); // Prevent list item click
                    }}
                    okText="Install"
                    cancelText="Cancel"
                    disabled={isInstalling}
                  >
                    <a
                      key="install-action"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent list item click but allow popconfirm trigger
                      }}
                      style={{
                        cursor: isInstalling ? 'not-allowed' : 'pointer',
                        // pointerEvents: isInstalling ? 'none' : 'auto', // Popconfirm handles disabling
                        color: isInstalling ? 'rgba(0, 0, 0, 0.25)' : undefined,
                      }}
                    >
                      {isInstalling ? (
                        <>
                          <Spin size="small" /> Installing...
                        </>
                      ) : (
                        <>
                          <DownloadOutlined /> Install
                        </>
                      )}
                    </a>
                  </Popconfirm>,
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
