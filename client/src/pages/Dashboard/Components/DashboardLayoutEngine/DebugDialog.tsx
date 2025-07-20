import React from 'react';
import { Modal, Tabs, Typography, Space, Tag, Collapse, Empty } from 'antd';
import { CodeOutlined, ApiOutlined, SettingOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface DebugDialogProps {
  visible: boolean;
  onClose: () => void;
  widgetId: string;
  widgetTitle: string;
  debugData?: Record<string, unknown>;
}

const DebugDialog: React.FC<DebugDialogProps> = ({
  visible,
  onClose,
  widgetId,
  widgetTitle,
  debugData = {}
}) => {
  const renderJsonData = (data: unknown, title: string) => {
    if (!data || (typeof data === 'object' && data !== null && Object.keys(data).length === 0)) {
      return <Empty description="No debug data available" />;
    }

    return (
      <pre style={{ 
        padding: '16px', 
        borderRadius: '4px',
        overflow: 'auto',
        maxHeight: '400px',
        fontSize: '12px'
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  const renderDebugInfo = () => {
    const {
      componentName,
      fileName,
      rawApiData,
      processedData,
      config,
      settings,
      props
    } = debugData;

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Component Info */}
        <div>
          <Space size="middle">
            <Tag color="blue" icon={<CodeOutlined />}>{componentName || 'Unknown Component'}</Tag>
            {fileName && <Tag color="green">{fileName}</Tag>}
          </Space>
        </div>

        {/* Debug Data Sections */}
        <Collapse defaultActiveKey={['api']} accordion>
          {rawApiData && (
            <Panel 
              header={
                <Space>
                  <ApiOutlined />
                  <Text strong>API Data</Text>
                </Space>
              } 
              key="api"
            >
              {renderJsonData(rawApiData, 'API Data')}
            </Panel>
          )}

          {processedData && (
            <Panel 
              header={
                <Space>
                  <DatabaseOutlined />
                  <Text strong>Processed Data</Text>
                </Space>
              } 
              key="processed"
            >
              {renderJsonData(processedData, 'Processed Data')}
            </Panel>
          )}

          {config && (
            <Panel 
              header={
                <Space>
                  <SettingOutlined />
                  <Text strong>Configuration</Text>
                </Space>
              } 
              key="config"
            >
              {renderJsonData(config, 'Configuration')}
            </Panel>
          )}

          {settings && (
            <Panel 
              header={
                <Space>
                  <SettingOutlined />
                  <Text strong>Widget Settings</Text>
                </Space>
              } 
              key="settings"
            >
              {renderJsonData(settings, 'Widget Settings')}
            </Panel>
          )}

          {props && (
            <Panel 
              header={
                <Space>
                  <CodeOutlined />
                  <Text strong>Component Props</Text>
                </Space>
              } 
              key="props"
            >
              {renderJsonData(props, 'Component Props')}
            </Panel>
          )}
        </Collapse>
      </Space>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <CodeOutlined />
          <span>Debug Info - {widgetTitle}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
    >
      <Tabs
        defaultActiveKey="debug"
        items={[
          {
            key: 'debug',
            label: 'Debug Data',
            children: renderDebugInfo()
          },
          {
            key: 'widget',
            label: 'Widget Info',
            children: (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Widget ID:</Text>
                  <br />
                  <Text code>{widgetId}</Text>
                </div>
                <div>
                  <Text type="secondary">Widget Title:</Text>
                  <br />
                  <Text strong>{widgetTitle}</Text>
                </div>
              </Space>
            )
          }
        ]}
      />
    </Modal>
  );
};

export default DebugDialog;