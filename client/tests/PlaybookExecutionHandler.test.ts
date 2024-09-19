import { API } from 'ssm-shared-lib';
import {
  beforeEach,
  describe,
  expect,
  it,
  Mock,
  MockedFunction,
  vi,
} from 'vitest';
import PlaybookExecutionHandler, {
  TaskStatusTimelineType,
} from '../src/components/PlaybookExecutionModal/PlaybookExecutionHandler';
import mockTransformToTaskStatusTimeline from '../src/components/PlaybookExecutionModal/TaskStatusTimeline';
import {
  getExecLogs,
  getExecLogs as mockGetExecLogs,
  getTaskStatuses,
  getTaskStatuses as mockGetTaskStatuses,
} from '../src/services/rest/playbooks';

// Mock the external dependencies
vi.mock('../src/services/rest/playbooks', () => ({
  getExecLogs: vi.fn(),
  getTaskStatuses: vi.fn(),
}));

vi.mock('../src/components/PlaybookExecutionModal/TaskStatusTimeline', () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Cast the mock functions appropriately
const mockedGetExecLogs = mockGetExecLogs as MockedFunction<typeof getExecLogs>;
const mockedGetTaskStatuses = mockGetTaskStatuses as MockedFunction<
  typeof getTaskStatuses
>;
const mockedTransformToTaskStatusTimeline =
  mockTransformToTaskStatusTimeline as unknown as MockedFunction<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (execStatus: API.ExecStatus) => TaskStatusTimelineType
  >;

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

    mockedGetExecLogs.mockClear();
    mockedGetTaskStatuses.mockClear();
    mockedTransformToTaskStatusTimeline.mockClear();
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
    // Proper mock setup with a Promise
    mockedGetTaskStatuses.mockResolvedValue({
      success: true,
      message: '',
      data: { execId: 'execId', execStatuses: statuses },
    });
    //@ts-ignore
    mockedTransformToTaskStatusTimeline.mockReturnValue({});

    const handler = new PlaybookExecutionHandler(
      setIsPollingEnabled,
      setHasReachedFinalStatus,
      execLogsCallBack,
      statusChangedCallBack,
      setSavedStatuses,
    );

    await handler.pollingCallback('execId');
    expect(setSavedStatuses).toHaveBeenCalledTimes(2);
    expect(statusChangedCallBack).toHaveBeenCalledTimes(2);
  });

  it('should handle exec logs polling correctly', async () => {
    const logs = [
      createExecLog('logRunnerId1', new Date('2023-01-01T12:00:00Z'), 'log 1'),
      createExecLog('logRunnerId2', new Date('2023-01-01T12:01:00Z'), 'log 2'),
    ];
    // Proper mock setup with a Promise
    mockedGetExecLogs.mockResolvedValue({
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
    expect(execLogsCallBack).toHaveBeenCalledTimes(2);
  });

  it('should identify final statuses correctly', () => {
    expect(PlaybookExecutionHandler.isFinalStatus('failed')).toBe(true);
    expect(PlaybookExecutionHandler.isFinalStatus('successful')).toBe(true);
    expect(PlaybookExecutionHandler.isFinalStatus('pending')).toBe(false);
  });
});
