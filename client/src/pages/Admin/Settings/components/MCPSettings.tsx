import React, { useState, useEffect, useCallback } from 'react';
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
  Select,
  Button,
  Divider,
  Space,
  Tag,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  InfoCircleFilled,
  SettingOutlined,
  WarningFilled,
  SaveOutlined,
} from '@ant-design/icons';
import Title, { TitleColors } from '@/components/Template/Title';
import FullScreenLoader from '@/components/FullScreenLoader/FullScreenLoader';
import {
  getMcpSetting,
  updateMcpSetting,
  getAllowedPlaybooks,
  updateAllowedPlaybooks,
} from '@/services/rest/mcp/mcp-settings.service';
import { getPlaybooks } from '@/services/rest/playbooks/playbooks';
import { API } from 'ssm-shared-lib';
import message from '@/components/Message/DynamicMessage';
import { AiBusinessImpactAssessment } from '@/components/Icons/CustomIcons';
import ReactDOM from 'react-dom';

interface PlaybookOption {
  label: string;
  value: string;
}

const tagStyle: React.CSSProperties = {
  color: '#FFFFFF',
  fontWeight: 500,
};

const MCPSettings: React.FC = () => {
  const [isGeneralLoading, setIsGeneralLoading] = useState<boolean>(true);
  const [isPlaybookLoading, setIsPlaybookLoading] = useState<boolean>(true);
  const [isGeneralSaving, setIsGeneralSaving] = useState<boolean>(false);
  const [isPlaybookSaving, setIsPlaybookSaving] = useState<boolean>(false);
  const [isMcpEnabled, setIsMcpEnabled] = useState<boolean>(false);
  const [availablePlaybooks, setAvailablePlaybooks] = useState<
    PlaybookOption[]
  >([]);
  const [allowedPlaybooks, setAllowedPlaybooks] = useState<string[]>([]);
  const [allowAllPlaybooks, setAllowAllPlaybooks] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [playbookError, setPlaybookError] = useState<string | null>(null);
  const [showRestartLoader, setShowRestartLoader] = useState<boolean>(false);

  const isLoading = isGeneralLoading || isPlaybookLoading;

  const fetchData = useCallback(async () => {
    setIsGeneralLoading(true);
    setIsPlaybookLoading(true);
    setGeneralError(null);
    setPlaybookError(null);

    try {
      const [statusRes, allowedRes, playbooksRes] = await Promise.all([
        getMcpSetting(),
        getAllowedPlaybooks(),
        getPlaybooks({}),
      ]);

      setIsMcpEnabled(statusRes.enabled);

      if (allowedRes.allowed === 'all') {
        setAllowAllPlaybooks(true);
        setAllowedPlaybooks([]);
      } else {
        setAllowAllPlaybooks(false);
        setAllowedPlaybooks(allowedRes.allowed);
      }

      setAvailablePlaybooks(
        playbooksRes.data.map((pb: API.PlaybookFile) => ({
          label: pb.name,
          value: pb.uuid,
        })),
      );
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to load MCP settings.';
      console.error('Failed to fetch MCP settings:', err);
      setGeneralError(errorMsg);
      setPlaybookError(errorMsg);
      message.error({ content: 'Failed to load MCP settings.', duration: 5 });
    } finally {
      setIsGeneralLoading(false);
      setIsPlaybookLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMcpToggle = async (checked: boolean) => {
    setIsGeneralSaving(true);
    setGeneralError(null);
    try {
      await updateMcpSetting({ enabled: checked });
      setIsMcpEnabled(checked);
      message.loading({
        content: checked
          ? 'Enabling MCP... Server will restart.'
          : 'Disabling MCP... Server will restart.',
        duration: 2,
      });
      setShowRestartLoader(true);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        `Failed to ${checked ? 'enable' : 'disable'} MCP.`;
      console.error('Failed to update MCP setting:', err);
      setGeneralError(errorMsg);
      message.error({ content: errorMsg, duration: 5 });
      setShowRestartLoader(false);
    } finally {
      setIsGeneralSaving(false);
    }
  };

  const handleSaveAllowedPlaybooks = async () => {
    setIsPlaybookSaving(true);
    setPlaybookError(null);
    try {
      const payload: { allowed: string[] | 'all' } = {
        allowed: allowAllPlaybooks ? 'all' : allowedPlaybooks,
      };
      await updateAllowedPlaybooks(payload);
      message.success({
        content: 'Allowed playbooks updated successfully.',
        duration: 3,
      });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || 'Failed to update allowed playbooks.';
      console.error('Failed to update allowed playbooks:', err);
      setPlaybookError(errorMsg);
      message.error({ content: errorMsg, duration: 5 });
    } finally {
      setIsPlaybookSaving(false);
    }
  };

  const handleAllowAllToggle = (checked: boolean) => {
    setAllowAllPlaybooks(checked);
    if (!checked) {
    }
  };

  const handlePollSuccess = () => {
    setShowRestartLoader(false);
    message.success({
      content: 'Server restarted successfully after MCP setting change!',
    });
    fetchData();
  };

  const handlePollTimeout = () => {
    setShowRestartLoader(false);
    message.error({
      content: 'Server restart timed out. Please check server status manually.',
    });
    fetchData();
  };

  return (
    <Spin spinning={isLoading} tip="Loading MCP Settings...">
      <Card>
        <Card
          type="inner"
          title={
            <Title.SubTitle
              title="MCP Server Settings"
              backgroundColor={TitleColors.SETTINGS}
              icon={<AiBusinessImpactAssessment />}
            />
          }
          extra={
            isMcpEnabled ? (
              <Tag color="#008000" style={tagStyle}>
                MCP Enabled
              </Tag>
            ) : (
              <Tag color="#FF0000" style={tagStyle}>
                MCP Disabled
              </Tag>
            )
          }
        >
          {generalError && !isLoading && (
            <Alert
              message="Error"
              description={generalError}
              type="error"
              showIcon
              closable
              onClose={() => setGeneralError(null)}
              style={{ marginBottom: 16 }}
            />
          )}
          <Flex vertical gap={16} style={{ width: '100%' }}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <Col xs={24} sm={16} md={18}>
                <Typography.Text>
                  <Popover
                    content={
                      'Enable/Disable the Model Context Protocol (MCP) server endpoint. Requires server restart.'
                    }
                    title="MCP Server Status"
                  >
                    <InfoCircleFilled style={{ marginRight: 8 }} />
                  </Popover>
                  Enable MCP Server (Requires Restart)
                </Typography.Text>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Flex justify="flex-end">
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={isMcpEnabled}
                    onChange={handleMcpToggle}
                    loading={isGeneralSaving}
                    disabled={isGeneralSaving || isLoading}
                  />
                </Flex>
              </Col>
            </Row>
          </Flex>
        </Card>

        <Divider />

        <Card
          type="inner"
          title={
            <Title.SubTitle
              title="Allowed Playbooks Execution for MCP"
              backgroundColor={TitleColors.SETTINGS}
              icon={<SettingOutlined />}
            />
          }
          style={{ marginTop: 20 }}
          headStyle={{ opacity: isMcpEnabled ? 1 : 0.5 }}
          bodyStyle={{
            opacity: isMcpEnabled ? 1 : 0.5,
            pointerEvents: isMcpEnabled ? 'auto' : 'none',
          }}
        >
          {!isMcpEnabled && (
            <Alert
              message="MCP Server Disabled"
              description="Enable the MCP server above to configure allowed playbooks."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          {playbookError && !isLoading && (
            <Alert
              message="Error"
              description={playbookError}
              type="error"
              showIcon
              closable
              onClose={() => setPlaybookError(null)}
              style={{ marginBottom: 16 }}
            />
          )}
          <Flex vertical gap={16} style={{ width: '100%' }}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <Col xs={24} sm={16} md={18}>
                <Typography.Text>
                  <Popover
                    content={
                      'Allow MCP clients (like AI assistants) to execute ANY available playbook. Use with caution!'
                    }
                    title={
                      <>
                        <WarningFilled
                          style={{ color: 'orange', marginRight: 8 }}
                        />{' '}
                        Allow All Playbooks
                      </>
                    }
                  >
                    <InfoCircleFilled style={{ marginRight: 8 }} />
                  </Popover>
                  Allow Execution of ALL Playbooks (Dangerous)
                </Typography.Text>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Flex justify="flex-end">
                  <Switch
                    checkedChildren="ALL"
                    unCheckedChildren="Specific"
                    checked={allowAllPlaybooks}
                    onChange={handleAllowAllToggle}
                    loading={isPlaybookSaving}
                    disabled={isPlaybookSaving || isLoading || !isMcpEnabled}
                  />
                </Flex>
              </Col>
            </Row>

            <Row justify="space-between" align="top" gutter={[16, 16]}>
              <Col xs={24}>
                <Typography.Text disabled={allowAllPlaybooks}>
                  <Popover
                    content={
                      'Select specific playbooks that MCP clients are permitted to execute.'
                    }
                    title="Select Allowed Playbooks"
                  >
                    <InfoCircleFilled style={{ marginRight: 8 }} />
                  </Popover>
                  Select Allowed Playbooks
                </Typography.Text>
              </Col>
              <Col xs={24} style={{ marginTop: 8 }}>
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder={
                    allowAllPlaybooks
                      ? 'All playbooks allowed'
                      : 'Select specific playbooks...'
                  }
                  value={allowedPlaybooks}
                  onChange={setAllowedPlaybooks}
                  options={availablePlaybooks}
                  loading={isPlaybookLoading}
                  disabled={
                    allowAllPlaybooks ||
                    isPlaybookSaving ||
                    isLoading ||
                    !isMcpEnabled
                  }
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  tagRender={(props) => {
                    const { label, value, closable, onClose } = props;
                    const onPreventMouseDown = (
                      event: React.MouseEvent<HTMLSpanElement>,
                    ) => {
                      event.preventDefault();
                      event.stopPropagation();
                    };
                    return (
                      <Tag
                        onMouseDown={onPreventMouseDown}
                        closable={closable}
                        onClose={onClose}
                        style={{ marginRight: 3 }}
                      >
                        {label}
                      </Tag>
                    );
                  }}
                />
              </Col>
            </Row>

            <Row justify="end" style={{ marginTop: 16 }}>
              <Col>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={isPlaybookSaving}
                  disabled={isPlaybookSaving || isLoading || !isMcpEnabled}
                  onClick={handleSaveAllowedPlaybooks}
                >
                  Save Playbook Settings
                </Button>
              </Col>
            </Row>
          </Flex>
        </Card>

        {showRestartLoader &&
          ReactDOM.createPortal(
            <FullScreenLoader
              isVisible={true}
              message="Restarting server to apply MCP setting..."
              onPollSuccess={handlePollSuccess}
              onPollTimeout={handlePollTimeout}
            />,
            document.body,
          )}
      </Card>
    </Spin>
  );
};

export default MCPSettings;
