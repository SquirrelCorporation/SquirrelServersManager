import { getExecLogs, getTaskStatuses } from '@/services/rest/playbooks';
import { API } from 'ssm-shared-lib';
import PlaybookExecutionHandler, {
  TaskStatusTimelineType,
} from '../src/components/PlaybookExecutionModal/PlaybookExecutionHandler';
import mockTransformToTaskStatusTimeline from '../src/components/PlaybookExecutionModal/TaskStatusTimeline';
import {
  getExecLogs as mockGetExecLogs,
  getTaskStatuses as mockGetTaskStatuses,
} from '../src/services/rest/playbooks';

// Mock the external dependencies
jest.mock('../src/services/rest/playbooks', () => ({
  getExecLogs: jest.fn(),
  getTaskStatuses: jest.fn(),
}));

jest.mock(
  '../src/components/PlaybookExecutionModal/TaskStatusTimeline',
  () => ({
    __esModule: true,
    default: jest.fn(),
  }),
);

// Cast the mock functions appropriately
const mockedGetExecLogs = mockGetExecLogs as jest.MockedFunction<
  typeof getExecLogs
>;
const mockedGetTaskStatuses = mockGetTaskStatuses as jest.MockedFunction<
  typeof getTaskStatuses
>;
const mockedTransformToTaskStatusTimeline =
  mockTransformToTaskStatusTimeline as unknown as jest.MockedFunction<
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
  let setIsPollingEnabled: jest.Mock;
  let setSavedStatuses: jest.Mock;
  let setHasReachedFinalStatus: jest.Mock;
  let execLogsCallBack: jest.Mock;
  let statusChangedCallBack: jest.Mock;

  beforeEach(() => {
    // Reinitialize mocks before each test
    setIsPollingEnabled = jest.fn();
    setSavedStatuses = jest.fn();
    setHasReachedFinalStatus = jest.fn();
    execLogsCallBack = jest.fn();
    statusChangedCallBack = jest.fn();

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
