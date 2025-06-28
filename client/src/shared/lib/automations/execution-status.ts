/**
 * Execution Status Tracking Business Logic
 * Pure functions for handling automation execution status and monitoring
 */

import { API } from 'ssm-shared-lib';

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'timeout';

export interface ExecutionStatusInfo {
  status: ExecutionStatus;
  message: string;
  color: string;
  icon: string;
  canRetry: boolean;
}

export interface ExecutionLog {
  id: string;
  automationUuid: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  message?: string;
  error?: string;
  progress?: number;
}

export interface ExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  successRate: number;
  lastExecution?: Date;
  nextExecution?: Date;
}

/**
 * Gets display information for execution status
 */
export function getExecutionStatusInfo(status: ExecutionStatus): ExecutionStatusInfo {
  switch (status) {
    case 'pending':
      return {
        status,
        message: 'Waiting to execute',
        color: '#faad14',
        icon: 'clock-circle',
        canRetry: false,
      };
    case 'running':
      return {
        status,
        message: 'Currently executing',
        color: '#1890ff',
        icon: 'loading',
        canRetry: false,
      };
    case 'success':
      return {
        status,
        message: 'Executed successfully',
        color: '#52c41a',
        icon: 'check-circle',
        canRetry: true,
      };
    case 'failed':
      return {
        status,
        message: 'Execution failed',
        color: '#ff4d4f',
        icon: 'close-circle',
        canRetry: true,
      };
    case 'cancelled':
      return {
        status,
        message: 'Execution cancelled',
        color: '#d9d9d9',
        icon: 'stop',
        canRetry: true,
      };
    case 'timeout':
      return {
        status,
        message: 'Execution timed out',
        color: '#ff7a45',
        icon: 'exclamation-circle',
        canRetry: true,
      };
  }
}

/**
 * Calculates execution duration in human-readable format
 */
export function formatExecutionDuration(startTime: Date, endTime?: Date): string {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const duration = end.getTime() - start.getTime();
  
  if (duration < 1000) {
    return '< 1s';
  }
  
  const seconds = Math.floor(duration / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

/**
 * Gets the time since last execution
 */
export function getTimeSinceLastExecution(lastExecutionTime?: Date): string {
  if (!lastExecutionTime) {
    return 'Never executed';
  }
  
  const now = new Date();
  const last = new Date(lastExecutionTime);
  const diff = now.getTime() - last.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

/**
 * Calculates execution statistics for an automation
 */
export function calculateExecutionStats(
  automation: API.Automation,
  executionLogs: ExecutionLog[]
): ExecutionStats {
  const automationLogs = executionLogs.filter(
    log => log.automationUuid === automation.uuid
  );
  
  const totalExecutions = automationLogs.length;
  const successfulExecutions = automationLogs.filter(
    log => log.status === 'success'
  ).length;
  const failedExecutions = automationLogs.filter(
    log => log.status === 'failed'
  ).length;
  
  // Calculate average duration for completed executions
  const completedLogs = automationLogs.filter(
    log => log.endTime && log.startTime
  );
  const totalDuration = completedLogs.reduce((sum, log) => {
    const duration = new Date(log.endTime!).getTime() - new Date(log.startTime).getTime();
    return sum + duration;
  }, 0);
  const averageDuration = completedLogs.length > 0 ? totalDuration / completedLogs.length : 0;
  
  const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
  
  const lastExecution = automation.lastExecutionTime 
    ? new Date(automation.lastExecutionTime) 
    : undefined;
  
  return {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    averageDuration,
    successRate,
    lastExecution,
  };
}

/**
 * Determines if automation needs attention based on execution history
 */
export function needsAttention(
  automation: API.Automation,
  executionLogs: ExecutionLog[]
): { needsAttention: boolean; reason?: string } {
  const stats = calculateExecutionStats(automation, executionLogs);
  
  // Check if success rate is too low
  if (stats.totalExecutions >= 3 && stats.successRate < 50) {
    return {
      needsAttention: true,
      reason: `Low success rate: ${stats.successRate.toFixed(1)}%`,
    };
  }
  
  // Check if last few executions failed
  const recentLogs = executionLogs
    .filter(log => log.automationUuid === automation.uuid)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 3);
  
  if (recentLogs.length >= 2 && recentLogs.every(log => log.status === 'failed')) {
    return {
      needsAttention: true,
      reason: 'Recent executions failed',
    };
  }
  
  // Check if automation hasn't run in a long time (for enabled automations)
  if (automation.enabled && stats.lastExecution) {
    const daysSinceLastExecution = (new Date().getTime() - stats.lastExecution.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastExecution > 7) {
      return {
        needsAttention: true,
        reason: 'No recent executions',
      };
    }
  }
  
  return { needsAttention: false };
}

/**
 * Groups execution logs by date for visualization
 */
export function groupExecutionLogsByDate(
  logs: ExecutionLog[]
): Record<string, ExecutionLog[]> {
  return logs.reduce((groups, log) => {
    const date = new Date(log.startTime).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, ExecutionLog[]>);
}

/**
 * Gets execution trend (improving, stable, declining)
 */
export function getExecutionTrend(
  automation: API.Automation,
  executionLogs: ExecutionLog[]
): 'improving' | 'stable' | 'declining' | 'unknown' {
  const automationLogs = executionLogs
    .filter(log => log.automationUuid === automation.uuid)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  if (automationLogs.length < 4) {
    return 'unknown';
  }
  
  // Compare recent half vs older half
  const midpoint = Math.floor(automationLogs.length / 2);
  const olderLogs = automationLogs.slice(0, midpoint);
  const recentLogs = automationLogs.slice(midpoint);
  
  const olderSuccessRate = olderLogs.filter(log => log.status === 'success').length / olderLogs.length;
  const recentSuccessRate = recentLogs.filter(log => log.status === 'success').length / recentLogs.length;
  
  const difference = recentSuccessRate - olderSuccessRate;
  
  if (difference > 0.1) return 'improving';
  if (difference < -0.1) return 'declining';
  return 'stable';
}

/**
 * Checks if execution is currently running
 */
export function isExecutionRunning(
  automation: API.Automation,
  executionLogs: ExecutionLog[]
): boolean {
  const runningLog = executionLogs.find(
    log => log.automationUuid === automation.uuid && log.status === 'running'
  );
  return !!runningLog;
}

/**
 * Gets next expected execution time based on cron expression
 */
export function getNextExecutionTime(cronValue: string): Date | null {
  // This is a simplified implementation
  // In a real application, you'd use a proper cron parser library
  try {
    // For demo purposes, return next hour
    const next = new Date();
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next;
  } catch (error) {
    return null;
  }
}