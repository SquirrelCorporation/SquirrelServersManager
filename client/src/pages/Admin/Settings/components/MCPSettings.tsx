import React, { useState, useEffect } from 'react';
import {
  Switch,
  Spin,
  Alert,
  Card,
  Col,
  Typography,
  Popover,
  Row,
  Flex,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  InfoCircleFilled,
  SettingOutlined,
} from '@ant-design/icons';
import Title, { TitleColors } from '@/components/Template/Title';
import FullScreenLoader from '@/components/FullScreenLoader/FullScreenLoader';
import {
  getMcpSetting,
  updateMcpSetting,
} from '@/services/rest/mcp/mcp-settings.service';
import message from '@/components/Message/DynamicMessage';

const MCPSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isMcpEnabled, setIsMcpEnabled] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRestartLoader, setShowRestartLoader] = useState<boolean>(false);

  // Fetch current MCP setting on mount
  useEffect(() => {
    const fetchMcpSetting = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getMcpSetting();
        setIsMcpEnabled(response.data.enabled);
      } catch (err) {
        console.error('Failed to fetch MCP setting:', err);
        setError('Failed to load MCP setting. Please try refreshing the page.');
        message.error({ content: 'Failed to load MCP setting.', duration: 5 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMcpSetting();
  }, []);

  // Handle toggle change
  const handleMcpToggle = async (checked: boolean) => {
    setIsSaving(true);
    setError(null);
    try {
      await updateMcpSetting({ enabled: checked });
      setIsMcpEnabled(checked);
      message.success({
        content: `MCP ${checked ? 'enabled' : 'disabled'}. Server is restarting...`,
        duration: 5,
      });
      setShowRestartLoader(true); // Show loader while server restarts
    } catch (err) {
      console.error('Failed to update MCP setting:', err);
      setError(
        `Failed to ${checked ? 'enable' : 'disable'} MCP. Please try again.`,
      );
      message.error({ content: 'Failed to update MCP setting.', duration: 5 });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePollSuccess = () => {
    setShowRestartLoader(false);
    message.success({ content: 'Server restarted successfully!', duration: 5 });
    // Optionally re-fetch settings or perform other actions
  };

  const handlePollTimeout = () => {
    setShowRestartLoader(false);
    setError(
      'Server restart check timed out. Please check server status manually.',
    );
    message.error({ content: 'Server restart check timed out.', duration: 5 });
  };

  return (
    <Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title="MCP Settings"
            backgroundColor={TitleColors.SETTINGS}
            icon={<SettingOutlined />}
          />
        }
      >
        {isLoading ? (
          <Spin tip="Loading MCP Settings...">
            <div style={{ minHeight: '100px' }} />
          </Spin>
        ) : error ? (
          <Alert message="Error" description={error} type="error" showIcon />
        ) : (
          <Flex vertical gap={32} style={{ width: '100%' }}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Typography.Text>
                  <Popover
                    content={
                      'Enable Model Context Protocol (MCP) Server at http://localhost:8000/mcp'
                    }
                  >
                    <InfoCircleFilled />
                  </Popover>{' '}
                  Enable Model Context Protocol (MCP) Server (SSM will be
                  restarted)
                </Typography.Text>
              </Col>
              <Col xs={24} sm={8}>
                <Flex justify="flex-end">
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={isMcpEnabled}
                    onChange={handleMcpToggle}
                    loading={isSaving}
                    disabled={isSaving}
                  />
                </Flex>
              </Col>
            </Row>
          </Flex>
        )}
        <FullScreenLoader
          isVisible={showRestartLoader}
          message="Restarting server..."
          onPollSuccess={handlePollSuccess}
          onPollTimeout={handlePollTimeout}
        />
      </Card>
    </Card>
  );
};

export default MCPSettings;
