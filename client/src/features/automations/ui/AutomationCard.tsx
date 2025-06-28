/**
 * Automation Card Component
 * Displays automation information in a card format with status and actions
 */

import React from 'react';
import { 
  Card, 
  Tag, 
  Space, 
  Dropdown, 
  Button, 
  Tooltip, 
  Progress, 
  Typography,
  Badge 
} from 'antd';
import {
  MoreOutlined,
  PlayCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InteractionOutlined,
} from '@ant-design/icons';
import { useAutomationOperations, useAutomationStatus } from '../model/hooks';
import { useAutomationWebSocket, useAutomationExecutionStatus } from '@/shared/lib/websocket/automation-hooks';
import { getExecutionRiskLevel } from '@/shared/lib/automations';
import type { API } from 'ssm-shared-lib';

const { Text, Paragraph } = Typography;

interface AutomationCardProps {
  automation: API.Automation;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: (automation: API.Automation) => void;
  onDelete?: (automation: API.Automation) => void;
  onExecute?: (automation: API.Automation) => void;
}

export const AutomationCard: React.FC<AutomationCardProps> = ({
  automation,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onExecute,
}) => {
  const { executeAutomation, isExecuting } = useAutomationOperations();
  const { statusInfo, timeSinceLastExecution, canExecute, riskLevel } = useAutomationStatus(automation);
  const { isConnected } = useAutomationWebSocket(automation.uuid);
  const { isExecuting: isCurrentlyExecuting, progress, currentStep } = useAutomationExecutionStatus(automation.uuid);

  const getStatusIcon = () => {
    if (isCurrentlyExecuting) {
      return <ClockCircleOutlined spin style={{ color: '#1890ff' }} />;
    }
    
    switch (automation.lastExecutionStatus) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getStatusColor = () => {
    if (isCurrentlyExecuting) return '#1890ff';
    return statusInfo?.color || '#d9d9d9';
  };

  const getRiskBadgeColor = () => {
    switch (riskLevel) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getTriggerDisplay = () => {
    const { automationChains } = automation;
    if (automationChains.trigger === 'cron') {
      return (
        <Tooltip title={`Cron: ${automationChains.cronValue}`}>
          <Tag icon={<ClockCircleOutlined />} color="blue">
            Scheduled
          </Tag>
        </Tooltip>
      );
    }
    return <Tag>Manual</Tag>;
  };

  const getActionsSummary = () => {
    const actions = automation.automationChains.actions;
    const actionCounts = actions.reduce((acc, action) => {
      acc[action.action] = (acc[action.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(actionCounts).map(([action, count]) => {
      const getActionDisplay = (actionType: string) => {
        switch (actionType) {
          case 'PLAYBOOK': return { label: 'Playbook', color: 'purple' };
          case 'DOCKER': return { label: 'Docker', color: 'blue' };
          case 'DOCKER_VOLUME': return { label: 'Volume', color: 'orange' };
          default: return { label: actionType, color: 'default' };
        }
      };

      const { label, color } = getActionDisplay(action);
      const displayText = count > 1 ? `${label} (${count})` : label;
      
      return (
        <Tag key={action} color={color} size="small">
          {displayText}
        </Tag>
      );
    });
  };

  const menuItems = [
    {
      key: 'execute',
      label: 'Execute Now',
      icon: <PlayCircleOutlined />,
      disabled: !canExecute || isExecuting || isCurrentlyExecuting,
      onClick: () => onExecute ? onExecute(automation) : executeAutomation(automation),
    },
    { type: 'divider' },
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => onEdit?.(automation),
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      icon: <InteractionOutlined />,
      onClick: () => {
        // TODO: Implement duplicate functionality
      },
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete?.(automation),
    },
  ];

  return (
    <Badge.Ribbon 
      text={automation.enabled ? 'Enabled' : 'Disabled'} 
      color={automation.enabled ? 'green' : 'red'}
    >
      <Card
        hoverable
        loading={isExecuting}
        className={isSelected ? 'ant-card-selected' : ''}
        onClick={onSelect}
        extra={
          <Space>
            {!isConnected && (
              <Tooltip title="Real-time updates unavailable">
                <ExclamationCircleOutlined style={{ color: '#faad14' }} />
              </Tooltip>
            )}
            <Badge color={getRiskBadgeColor()} text={`${riskLevel} risk`} />
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </Space>
        }
      >
        <Card.Meta
          avatar={getStatusIcon()}
          title={
            <Space>
              <Text strong>{automation.name}</Text>
              {getTriggerDisplay()}
            </Space>
          }
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space size="small" wrap>
                {getActionsSummary()}
              </Space>
              
              {isCurrentlyExecuting && (
                <div>
                  <Text type="secondary">Executing: {currentStep}</Text>
                  <Progress 
                    percent={progress} 
                    size="small" 
                    status="active"
                    style={{ marginTop: 4 }}
                  />
                </div>
              )}
              
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Text type="secondary">Status:</Text>
                  <Tag color={getStatusColor()}>
                    {isCurrentlyExecuting ? 'Running' : automation.lastExecutionStatus}
                  </Tag>
                </Space>
                
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {timeSinceLastExecution}
                </Text>
              </Space>
              
              {automation.lastExecutionStatus === 'failed' && (
                <Text type="danger" style={{ fontSize: '12px' }}>
                  Last execution failed
                </Text>
              )}
            </Space>
          }
        />
      </Card>
    </Badge.Ribbon>
  );
};