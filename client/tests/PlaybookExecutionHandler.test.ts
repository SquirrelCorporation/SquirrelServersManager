import taskStatusTimeline from '@/components/PlaybookExecutionModal/TaskStatusTimeline';
// Import the mocked modules
import {
  getExecLogs,
  getTaskStatuses,
} from '@/services/rest/playbooks/playbooks';
import { API } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import PlaybookExecutionHandler, {
  TaskStatusTimelineType,
} from '../src/components/PlaybookExecutionModal/PlaybookExecutionHandler';

// Mock the external dependencies
vi.mock('@/services/rest/playbooks/playbooks', () => ({
  getExecLogs: vi.fn(),
  getTaskStatuses: vi.fn(),
}));

vi.mock('@/components/PlaybookExecutionModal/TaskStatusTimeline', () => ({
  default: {
    transformToTaskStatusTimeline: vi.fn(),
  },
}));

// Helper functions to create mock data
const createExecStatus = (status: string, createdAt: Date): API.ExecStatus => ({
  status,
  createdAt,
  ident: 'execId',
});

const createExecLog = (
  logRunnerId: string,
  createdAt: Date,
  stdout: string,
): API.ExecLog => ({
  logRunnerId,
  createdAt,
  stdout,
  ident: 'execId',
  content: '',
});

describe('PlaybookExecutionHandler', () => {
  let setIsPollingEnabled: Mock;
  let setSavedStatuses: Mock;
  let setHasReachedFinalStatus: Mock;
  let execLogsCallBack: Mock;
  let statusChangedCallBack: Mock;

  beforeEach(() => {
    // Reinitialize mocks before each test
    setIsPollingEnabled = vi.fn();
    setSavedStatuses = vi.fn();
    setHasReachedFinalStatus = vi.fn();
    execLogsCallBack = vi.fn();
    statusChangedCallBack = vi.fn();

    // Clear all mocks
    vi.clearAllMocks();
  });

  it('should reset the terminal', () => {
    const handler = new PlaybookExecutionHandler(setIsPollingEnabled);
    handler.resetTerminal();
    expect((handler as any).statusesSet.size).toBe(0);
    expect((handler as any).logsSet.size).toBe(0);
  });

  it('should handle task statuses polling correctly', async () => {
    const statuses = [
      createExecStatus('pending', new Date('2023-01-01T12:00:00Z')),
      createExecStatus('running', new Date('2023-01-01T12:01:00Z')),
    ];

    vi.mocked(getTaskStatuses).mockResolvedValue({
      success: true,
      message: '',
      data: { execId: 'execId', execStatuses: statuses },
    });

    vi.mocked(taskStatusTimeline.transformToTaskStatusTimeline).mockReturnValue(
      {
        _status: 'pending',
        icon: 'icon',
        title: 'Task Status',
      } as TaskStatusTimelineType,
    );

    const handler = new PlaybookExecutionHandler(
      setIsPollingEnabled,
      setHasReachedFinalStatus,
      execLogsCallBack,
      statusChangedCallBack,
      setSavedStatuses,
    );

    await handler.pollingCallback('execId');

    // Each unique status should trigger one call
    expect(setSavedStatuses).toHaveBeenCalledTimes(2);
    expect(statusChangedCallBack).toHaveBeenCalledTimes(2);

    // Second call should not trigger additional callbacks since statuses are already in the set
    await handler.pollingCallback('execId');
    expect(setSavedStatuses).toHaveBeenCalledTimes(2);
    expect(statusChangedCallBack).toHaveBeenCalledTimes(2);
  });

  it('should handle exec logs polling correctly', async () => {
    const logs = [
      createExecLog('logRunnerId1', new Date('2023-01-01T12:00:00Z'), 'log 1'),
      createExecLog('logRunnerId2', new Date('2023-01-01T12:01:00Z'), 'log 2'),
    ];

    vi.mocked(getExecLogs).mockResolvedValue({
      success: true,
      message: '',
      data: { execId: 'execId', execLogs: logs },
    });

    const handler = new PlaybookExecutionHandler(
      setIsPollingEnabled,
      setHasReachedFinalStatus,
      execLogsCallBack,
      statusChangedCallBack,
      setSavedStatuses,
    );

    await handler.pollingCallback('execId');

    // Each unique log should trigger one call
    expect(execLogsCallBack).toHaveBeenCalledTimes(2);

    // Second call should not trigger additional callbacks since logs are already in the set
    await handler.pollingCallback('execId');
    expect(execLogsCallBack).toHaveBeenCalledTimes(2);
  });

  it('should identify final statuses correctly', () => {
    expect(PlaybookExecutionHandler.isFinalStatus('failed')).toBe(true);
    expect(PlaybookExecutionHandler.isFinalStatus('successful')).toBe(true);
    expect(PlaybookExecutionHandler.isFinalStatus('running')).toBe(false);
  });
});
