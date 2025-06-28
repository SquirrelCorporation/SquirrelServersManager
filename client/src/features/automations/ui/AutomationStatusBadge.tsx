/**
 * Automation Status Badge Component
 * Displays automation execution status with appropriate colors and icons
 */

import React from 'react';
import { Badge, Tooltip } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { getExecutionStatusInfo } from '@/shared/lib/automations';
import type { ExecutionStatus } from '@/shared/lib/automations';

interface AutomationStatusBadgeProps {
  status: ExecutionStatus;
  isCurrentlyExecuting?: boolean;
  progress?: number;
  showText?: boolean;
  size?: 'small' | 'default';
}

export const AutomationStatusBadge: React.FC<AutomationStatusBadgeProps> = ({
  status,
  isCurrentlyExecuting = false,
  progress = 0,
  showText = false,
  size = 'default',
}) => {
  const getIcon = () => {
    if (isCurrentlyExecuting) {
      return <LoadingOutlined spin />;
    }

    switch (status) {
      case 'pending':
        return <ClockCircleOutlined />;
      case 'running':
        return <LoadingOutlined spin />;
      case 'success':
        return <CheckCircleOutlined />;
      case 'failed':
        return <CloseCircleOutlined />;
      case 'cancelled':
        return <StopOutlined />;
      case 'timeout':
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getColor = () => {
    if (isCurrentlyExecuting) return '#1890ff';
    
    const statusInfo = getExecutionStatusInfo(status);
    return statusInfo.color;
  };

  const getText = () => {
    if (isCurrentlyExecuting) {
      return `Running (${progress}%)`;
    }
    
    const statusInfo = getExecutionStatusInfo(status);
    return statusInfo.message;
  };

  const getTooltipText = () => {
    if (isCurrentlyExecuting) {
      return `Automation is currently executing (${progress}% complete)`;
    }
    
    const statusInfo = getExecutionStatusInfo(status);
    
    switch (status) {
      case 'pending':
        return 'Automation is queued for execution';
      case 'running':
        return 'Automation is currently executing';
      case 'success':
        return 'Last execution completed successfully';
      case 'failed':
        return 'Last execution failed';
      case 'cancelled':
        return 'Last execution was cancelled';
      case 'timeout':
        return 'Last execution timed out';
      default:
        return statusInfo.message;
    }
  };

  if (showText) {
    return (
      <Tooltip title={getTooltipText()}>
        <Badge
          color={getColor()}
          text={getText()}
          size={size}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={getTooltipText()}>
      <span style={{ color: getColor(), fontSize: size === 'small' ? '12px' : '14px' }}>
        {getIcon()}
      </span>
    </Tooltip>
  );
};