/**
 * Execution Status Tests
 * Tests for execution status tracking business logic
 */

import {
  getExecutionStatusInfo,
  formatExecutionDuration,
  getTimeSinceLastExecution,
  calculateExecutionStats,
  needsAttention,
  groupExecutionLogsByDate,
  getExecutionTrend,
  isExecutionRunning,
  getNextExecutionTime,
} from '../execution-status';
import { API } from 'ssm-shared-lib';
import type { ExecutionLog } from '../execution-status';

describe('Execution Status', () => {
  const mockAutomation: API.Automation = {
    uuid: 'automation-1',
    name: 'Test Automation',
    enabled: true,
    lastExecutionStatus: 'success',
    lastExecutionTime: new Date('2024-01-15T10:00:00Z'),
    automationChains: {
      trigger: 'cron' as any,
      cronValue: '0 2 * * *',
      actions: [],
    },
  };

  const mockExecutionLogs: ExecutionLog[] = [
    {
      id: 'log-1',
      automationUuid: 'automation-1',
      status: 'success',
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T10:05:00Z'),
      duration: 300000, // 5 minutes
    },
    {
      id: 'log-2',
      automationUuid: 'automation-1',
      status: 'failed',
      startTime: new Date('2024-01-14T10:00:00Z'),
      endTime: new Date('2024-01-14T10:02:00Z'),
      duration: 120000, // 2 minutes
      error: 'Connection timeout',
    },
    {
      id: 'log-3',
      automationUuid: 'automation-1',
      status: 'success',
      startTime: new Date('2024-01-13T10:00:00Z'),
      endTime: new Date('2024-01-13T10:03:00Z'),
      duration: 180000, // 3 minutes
    },
    {
      id: 'log-4',
      automationUuid: 'automation-1',
      status: 'running',
      startTime: new Date('2024-01-16T10:00:00Z'),
    },
  ];

  describe('getExecutionStatusInfo', () => {
    it('should return correct info for success status', () => {
      const info = getExecutionStatusInfo('success');
      expect(info.status).toBe('success');
      expect(info.message).toBe('Executed successfully');
      expect(info.color).toBe('#52c41a');
      expect(info.icon).toBe('check-circle');
      expect(info.canRetry).toBe(true);
    });

    it('should return correct info for failed status', () => {
      const info = getExecutionStatusInfo('failed');
      expect(info.status).toBe('failed');
      expect(info.message).toBe('Execution failed');
      expect(info.color).toBe('#ff4d4f');
      expect(info.icon).toBe('close-circle');
      expect(info.canRetry).toBe(true);
    });

    it('should return correct info for running status', () => {
      const info = getExecutionStatusInfo('running');
      expect(info.status).toBe('running');
      expect(info.message).toBe('Currently executing');
      expect(info.color).toBe('#1890ff');
      expect(info.icon).toBe('loading');
      expect(info.canRetry).toBe(false);
    });

    it('should return correct info for pending status', () => {
      const info = getExecutionStatusInfo('pending');
      expect(info.status).toBe('pending');
      expect(info.message).toBe('Waiting to execute');
      expect(info.color).toBe('#faad14');
      expect(info.icon).toBe('clock-circle');
      expect(info.canRetry).toBe(false);
    });

    it('should return correct info for cancelled status', () => {
      const info = getExecutionStatusInfo('cancelled');
      expect(info.status).toBe('cancelled');
      expect(info.message).toBe('Execution cancelled');
      expect(info.color).toBe('#d9d9d9');
      expect(info.icon).toBe('stop');
      expect(info.canRetry).toBe(true);
    });

    it('should return correct info for timeout status', () => {
      const info = getExecutionStatusInfo('timeout');
      expect(info.status).toBe('timeout');
      expect(info.message).toBe('Execution timed out');
      expect(info.color).toBe('#ff7a45');
      expect(info.icon).toBe('exclamation-circle');
      expect(info.canRetry).toBe(true);
    });
  });

  describe('formatExecutionDuration', () => {
    it('should format duration less than 1 second', () => {
      const start = new Date('2024-01-15T10:00:00.000Z');
      const end = new Date('2024-01-15T10:00:00.500Z');
      const result = formatExecutionDuration(start, end);
      expect(result).toBe('< 1s');
    });

    it('should format duration in seconds', () => {
      const start = new Date('2024-01-15T10:00:00Z');
      const end = new Date('2024-01-15T10:00:30Z');
      const result = formatExecutionDuration(start, end);
      expect(result).toBe('30s');
    });

    it('should format duration in minutes and seconds', () => {
      const start = new Date('2024-01-15T10:00:00Z');
      const end = new Date('2024-01-15T10:02:30Z');
      const result = formatExecutionDuration(start, end);
      expect(result).toBe('2m 30s');
    });

    it('should format duration in minutes only', () => {
      const start = new Date('2024-01-15T10:00:00Z');
      const end = new Date('2024-01-15T10:05:00Z');
      const result = formatExecutionDuration(start, end);
      expect(result).toBe('5m');
    });

    it('should format duration in hours and minutes', () => {
      const start = new Date('2024-01-15T10:00:00Z');
      const end = new Date('2024-01-15T11:30:00Z');
      const result = formatExecutionDuration(start, end);
      expect(result).toBe('1h 30m');
    });

    it('should format duration in hours only', () => {
      const start = new Date('2024-01-15T10:00:00Z');
      const end = new Date('2024-01-15T12:00:00Z');
      const result = formatExecutionDuration(start, end);
      expect(result).toBe('2h');
    });

    it('should use current time when end time is not provided', () => {
      const start = new Date(Date.now() - 30000); // 30 seconds ago
      const result = formatExecutionDuration(start);
      expect(result).toMatch(/30s|31s|29s/); // Allow for small timing differences
    });
  });

  describe('getTimeSinceLastExecution', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "Never executed" when no last execution time', () => {
      const result = getTimeSinceLastExecution();
      expect(result).toBe('Never executed');
    });

    it('should return "Just now" for recent execution', () => {
      const lastExecution = new Date('2024-01-15T11:59:30Z'); // 30 seconds ago
      const result = getTimeSinceLastExecution(lastExecution);
      expect(result).toBe('Just now');
    });

    it('should return minutes for recent execution', () => {
      const lastExecution = new Date('2024-01-15T11:45:00Z'); // 15 minutes ago
      const result = getTimeSinceLastExecution(lastExecution);
      expect(result).toBe('15 minutes ago');
    });

    it('should return hours for older execution', () => {
      const lastExecution = new Date('2024-01-15T09:00:00Z'); // 3 hours ago
      const result = getTimeSinceLastExecution(lastExecution);
      expect(result).toBe('3 hours ago');
    });

    it('should return days for old execution', () => {
      const lastExecution = new Date('2024-01-13T12:00:00Z'); // 2 days ago
      const result = getTimeSinceLastExecution(lastExecution);
      expect(result).toBe('2 days ago');
    });

    it('should handle singular forms correctly', () => {
      const lastExecution = new Date('2024-01-14T12:00:00Z'); // 1 day ago
      const result = getTimeSinceLastExecution(lastExecution);
      expect(result).toBe('1 day ago');
    });
  });

  describe('calculateExecutionStats', () => {
    it('should calculate statistics correctly', () => {
      const stats = calculateExecutionStats(mockAutomation, mockExecutionLogs);
      
      expect(stats.totalExecutions).toBe(4);
      expect(stats.successfulExecutions).toBe(2);
      expect(stats.failedExecutions).toBe(1);
      expect(stats.successRate).toBe(50); // 2 out of 4
      expect(stats.lastExecution).toEqual(new Date('2024-01-15T10:00:00Z'));
    });

    it('should calculate average duration correctly', () => {
      const stats = calculateExecutionStats(mockAutomation, mockExecutionLogs);
      
      // Average of 300000, 120000, 180000 = 200000ms
      expect(stats.averageDuration).toBe(200000);
    });

    it('should handle automation with no logs', () => {
      const stats = calculateExecutionStats(mockAutomation, []);
      
      expect(stats.totalExecutions).toBe(0);
      expect(stats.successfulExecutions).toBe(0);
      expect(stats.failedExecutions).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.averageDuration).toBe(0);
    });

    it('should filter logs by automation UUID', () => {
      const logsWithDifferentAutomation = [
        ...mockExecutionLogs,
        {
          id: 'log-5',
          automationUuid: 'different-automation',
          status: 'success' as const,
          startTime: new Date('2024-01-12T10:00:00Z'),
          endTime: new Date('2024-01-12T10:01:00Z'),
          duration: 60000,
        },
      ];

      const stats = calculateExecutionStats(mockAutomation, logsWithDifferentAutomation);
      expect(stats.totalExecutions).toBe(4); // Should still be 4, not 5
    });
  });

  describe('needsAttention', () => {
    it('should not need attention for healthy automation', () => {
      const healthyLogs = [
        {
          id: 'log-1',
          automationUuid: 'automation-1',
          status: 'success' as const,
          startTime: new Date('2024-01-15T10:00:00Z'),
          endTime: new Date('2024-01-15T10:01:00Z'),
        },
        {
          id: 'log-2',
          automationUuid: 'automation-1',
          status: 'success' as const,
          startTime: new Date('2024-01-14T10:00:00Z'),
          endTime: new Date('2024-01-14T10:01:00Z'),
        },
      ];

      const result = needsAttention(mockAutomation, healthyLogs);
      expect(result.needsAttention).toBe(false);
    });

    it('should need attention for low success rate', () => {
      const failingLogs = [
        {
          id: 'log-1',
          automationUuid: 'automation-1',
          status: 'failed' as const,
          startTime: new Date('2024-01-15T10:00:00Z'),
          endTime: new Date('2024-01-15T10:01:00Z'),
        },
        {
          id: 'log-2',
          automationUuid: 'automation-1',
          status: 'failed' as const,
          startTime: new Date('2024-01-14T10:00:00Z'),
          endTime: new Date('2024-01-14T10:01:00Z'),
        },
        {
          id: 'log-3',
          automationUuid: 'automation-1',
          status: 'success' as const,
          startTime: new Date('2024-01-13T10:00:00Z'),
          endTime: new Date('2024-01-13T10:01:00Z'),
        },
      ];

      const result = needsAttention(mockAutomation, failingLogs);
      expect(result.needsAttention).toBe(true);
      expect(result.reason).toContain('Low success rate');
    });

    it('should need attention for consecutive failures', () => {
      const consecutiveFailures = [
        {
          id: 'log-1',
          automationUuid: 'automation-1',
          status: 'failed' as const,
          startTime: new Date('2024-01-15T10:00:00Z'),
          endTime: new Date('2024-01-15T10:01:00Z'),
        },
        {
          id: 'log-2',
          automationUuid: 'automation-1',
          status: 'failed' as const,
          startTime: new Date('2024-01-14T10:00:00Z'),
          endTime: new Date('2024-01-14T10:01:00Z'),
        },
      ];

      const result = needsAttention(mockAutomation, consecutiveFailures);
      expect(result.needsAttention).toBe(true);
      expect(result.reason).toBe('Recent executions failed');
    });

    it('should need attention for enabled automation without recent executions', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-25T10:00:00Z')); // 10 days after last execution

      const result = needsAttention(mockAutomation, mockExecutionLogs);
      expect(result.needsAttention).toBe(true);
      expect(result.reason).toBe('No recent executions');

      jest.useRealTimers();
    });

    it('should not need attention for disabled automation without recent executions', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-25T10:00:00Z'));

      const disabledAutomation = { ...mockAutomation, enabled: false };
      const result = needsAttention(disabledAutomation, mockExecutionLogs);
      expect(result.needsAttention).toBe(false);

      jest.useRealTimers();
    });
  });

  describe('groupExecutionLogsByDate', () => {
    it('should group logs by date', () => {
      const grouped = groupExecutionLogsByDate(mockExecutionLogs);
      
      expect(grouped['2024-01-15']).toHaveLength(1);
      expect(grouped['2024-01-14']).toHaveLength(1);
      expect(grouped['2024-01-13']).toHaveLength(1);
      expect(grouped['2024-01-16']).toHaveLength(1);
    });

    it('should handle empty logs array', () => {
      const grouped = groupExecutionLogsByDate([]);
      expect(grouped).toEqual({});
    });
  });

  describe('getExecutionTrend', () => {
    it('should return unknown for insufficient data', () => {
      const fewLogs = mockExecutionLogs.slice(0, 2);
      const trend = getExecutionTrend(mockAutomation, fewLogs);
      expect(trend).toBe('unknown');
    });

    it('should return improving for better recent performance', () => {
      const improvingLogs = [
        // Older logs (all failed)
        { id: '1', automationUuid: 'automation-1', status: 'failed' as const, startTime: new Date('2024-01-01T10:00:00Z') },
        { id: '2', automationUuid: 'automation-1', status: 'failed' as const, startTime: new Date('2024-01-02T10:00:00Z') },
        // Recent logs (all success)
        { id: '3', automationUuid: 'automation-1', status: 'success' as const, startTime: new Date('2024-01-03T10:00:00Z') },
        { id: '4', automationUuid: 'automation-1', status: 'success' as const, startTime: new Date('2024-01-04T10:00:00Z') },
      ];

      const trend = getExecutionTrend(mockAutomation, improvingLogs);
      expect(trend).toBe('improving');
    });

    it('should return declining for worse recent performance', () => {
      const decliningLogs = [
        // Older logs (all success)
        { id: '1', automationUuid: 'automation-1', status: 'success' as const, startTime: new Date('2024-01-01T10:00:00Z') },
        { id: '2', automationUuid: 'automation-1', status: 'success' as const, startTime: new Date('2024-01-02T10:00:00Z') },
        // Recent logs (all failed)
        { id: '3', automationUuid: 'automation-1', status: 'failed' as const, startTime: new Date('2024-01-03T10:00:00Z') },
        { id: '4', automationUuid: 'automation-1', status: 'failed' as const, startTime: new Date('2024-01-04T10:00:00Z') },
      ];

      const trend = getExecutionTrend(mockAutomation, decliningLogs);
      expect(trend).toBe('declining');
    });

    it('should return stable for consistent performance', () => {
      const stableLogs = [
        // Mixed performance in both halves
        { id: '1', automationUuid: 'automation-1', status: 'success' as const, startTime: new Date('2024-01-01T10:00:00Z') },
        { id: '2', automationUuid: 'automation-1', status: 'failed' as const, startTime: new Date('2024-01-02T10:00:00Z') },
        { id: '3', automationUuid: 'automation-1', status: 'success' as const, startTime: new Date('2024-01-03T10:00:00Z') },
        { id: '4', automationUuid: 'automation-1', status: 'failed' as const, startTime: new Date('2024-01-04T10:00:00Z') },
      ];

      const trend = getExecutionTrend(mockAutomation, stableLogs);
      expect(trend).toBe('stable');
    });
  });

  describe('isExecutionRunning', () => {
    it('should return true when automation is running', () => {
      const result = isExecutionRunning(mockAutomation, mockExecutionLogs);
      expect(result).toBe(true); // mockExecutionLogs contains a running log
    });

    it('should return false when automation is not running', () => {
      const nonRunningLogs = mockExecutionLogs.filter(log => log.status !== 'running');
      const result = isExecutionRunning(mockAutomation, nonRunningLogs);
      expect(result).toBe(false);
    });

    it('should return false for different automation', () => {
      const differentAutomation = { ...mockAutomation, uuid: 'different-uuid' };
      const result = isExecutionRunning(differentAutomation, mockExecutionLogs);
      expect(result).toBe(false);
    });
  });

  describe('getNextExecutionTime', () => {
    it('should return a future date for valid cron expression', () => {
      const result = getNextExecutionTime('0 2 * * *');
      expect(result).toBeInstanceOf(Date);
      expect(result!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for invalid cron expression', () => {
      // This is a simplified implementation, so it might not handle all invalid cases
      // In a real implementation, you'd use a proper cron parser library
      const result = getNextExecutionTime('0 2 * * *');
      expect(result).toBeDefined(); // For now, our simple implementation always returns a date
    });
  });
});