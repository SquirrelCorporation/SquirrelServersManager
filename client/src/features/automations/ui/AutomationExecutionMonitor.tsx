/**
 * Automation Execution Monitor Component
 * Real-time monitoring of automation execution with progress and logs
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Progress,
  Typography,
  Space,
  Tag,
  List,
  Card,
  Button,
  Alert,
  Divider,
  Timeline,
  Empty,
  Spin,
} from 'antd';
import {
  PlayCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  StopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAutomationExecutionStatus, useAutomationLogs } from '@/shared/lib/websocket/automation-hooks';
import { formatExecutionDuration } from '@/shared/lib/automations';
import type { API } from 'ssm-shared-lib';
import type { AutomationLogUpdate } from '@/shared/lib/websocket/types';

const { Text, Title } = Typography;

interface AutomationExecutionMonitorProps {
  automation: API.Automation | null;
  isVisible: boolean;
  onClose: () => void;
  executionId?: string;
}

export const AutomationExecutionMonitor: React.FC<AutomationExecutionMonitorProps> = ({
  automation,
  isVisible,
  onClose,
  executionId,
}) => {
  const [logs, setLogs] = useState<AutomationLogUpdate[]>([]);
  const [startTime] = useState(new Date());

  const { isExecuting, progress, currentStep } = useAutomationExecutionStatus(automation?.uuid);
  const { subscribeToLogs, isConnected } = useAutomationLogs(automation?.uuid, executionId);

  // Subscribe to logs when modal is visible
  useEffect(() => {
    if (!isVisible || !automation) return;

    setLogs([]); // Clear previous logs
    
    const cleanup = subscribeToLogs((log) => {
      setLogs(prev => [...prev, log]);
    });

    return cleanup;
  }, [isVisible, automation, subscribeToLogs]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'running':
        return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warn':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      case 'debug':
        return <InfoCircleOutlined style={{ color: '#d9d9d9' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const renderProgressSection = () => {
    if (!isExecuting && progress === 0) {
      return (
        <Alert
          message="Automation Not Running"
          description="This automation is not currently executing."
          type="info"
          showIcon
        />
      );
    }

    const progressStatus = progress === 100 ? 'success' : isExecuting ? 'active' : 'normal';
    const progressColor = progress === 100 ? '#52c41a' : isExecuting ? '#1890ff' : undefined;

    return (
      <Card size="small" title="Execution Progress">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Current Step: </Text>
            <Text>{currentStep || 'Initializing...'}</Text>
          </div>
          
          <Progress
            percent={progress}
            status={progressStatus}
            strokeColor={progressColor}
            showInfo
          />
          
          <Space>
            <Tag color={isExecuting ? 'processing' : progress === 100 ? 'success' : 'default'}>
              {isExecuting ? 'Running' : progress === 100 ? 'Completed' : 'Stopped'}
            </Tag>
            
            <Text type="secondary">
              Duration: {formatExecutionDuration(startTime)}
            </Text>
            
            {!isConnected && (
              <Tag color="warning" icon={<ExclamationCircleOutlined />}>
                Offline
              </Tag>
            )}
          </Space>
        </Space>
      </Card>
    );
  };

  const renderActionsSummary = () => {
    if (!automation) return null;

    const actions = automation.automationChains.actions;
    
    return (
      <Card size="small" title="Actions to Execute">
        <Timeline size="small">
          {actions.map((action, index) => {
            const isCompleted = progress > (index / actions.length) * 100;
            const isCurrent = currentStep && currentStep.includes(`Action ${index + 1}`);
            
            return (
              <Timeline.Item
                key={index}
                color={isCompleted ? 'green' : isCurrent ? 'blue' : 'gray'}
                dot={getStepIcon(isCompleted ? 'success' : isCurrent ? 'running' : 'pending')}
              >
                <Space direction="vertical" size="small">
                  <Text strong>
                    Action {index + 1}: {action.action}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {action.action === 'PLAYBOOK' && `Playbook: ${action.playbook}`}
                    {action.action === 'DOCKER' && `Docker: ${action.dockerAction}`}
                    {action.action === 'DOCKER_VOLUME' && `Volume: ${action.dockerVolumeAction}`}
                  </Text>
                </Space>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </Card>
    );
  };

  const renderLogs = () => {
    if (logs.length === 0) {
      return (
        <Card size="small" title="Execution Logs">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No logs available"
            style={{ margin: '24px 0' }}
          />
        </Card>
      );
    }

    return (
      <Card 
        size="small" 
        title="Execution Logs"
        extra={
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => setLogs([])}
          >
            Clear
          </Button>
        }
      >
        <List
          size="small"
          dataSource={logs}
          style={{ maxHeight: 300, overflowY: 'auto' }}
          renderItem={(log) => (
            <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Space style={{ width: '100%', alignItems: 'flex-start' }}>
                {getLogIcon(log.level)}
                <div style={{ flex: 1 }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <Tag color={
                        log.level === 'error' ? 'red' :
                        log.level === 'warn' ? 'orange' :
                        log.level === 'info' ? 'blue' : 'default'
                      }>
                        {log.level.toUpperCase()}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </Text>
                      {log.source && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          [{log.source}]
                        </Text>
                      )}
                    </Space>
                    <Text style={{ fontSize: '13px', wordBreak: 'break-word' }}>
                      {log.message}
                    </Text>
                  </Space>
                </div>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  if (!automation) return null;

  return (
    <Modal
      title={
        <Space>
          <PlayCircleOutlined />
          <span>Execution Monitor - {automation.name}</span>
        </Space>
      }
      open={isVisible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      destroyOnClose
    >
      <Spin spinning={!isConnected && isExecuting}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {renderProgressSection()}
          
          <Divider style={{ margin: '16px 0' }} />
          
          {renderActionsSummary()}
          
          <Divider style={{ margin: '16px 0' }} />
          
          {renderLogs()}
        </Space>
      </Spin>
    </Modal>
  );
};