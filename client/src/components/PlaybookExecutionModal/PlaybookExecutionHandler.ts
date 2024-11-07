import taskStatusTimeline from '@/components/PlaybookExecutionModal/TaskStatusTimeline';
import { getExecLogs, getTaskStatuses } from '@/services/rest/playbooks';
import { StepsProps } from 'antd';
import React, { ReactNode } from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';

export type TaskStatusTimelineType = StepsProps & {
  _status: string;
  icon: ReactNode;
  title: string;
};

export default class PlaybookExecutionHandler {
  private statusesSet: Set<string>;
  private logsSet: Set<string>;
  public setIsPollingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  public setSavedStatuses:
    | React.Dispatch<React.SetStateAction<TaskStatusTimelineType[]>>
    | undefined;
  public setHasReachedFinalStatus?: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  public execLogsCallBack?: (execLogs: API.ExecLog) => void;
  public statusChangedCallBack?: (status: string, isFinal: boolean) => void;

  constructor(
    setIsPollingEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setHasReachedFinalStatus?: React.Dispatch<React.SetStateAction<boolean>>,
    execLogsCallBack?: (execLogs: API.ExecLog) => void,
    statusChangedCallBack?: (status: string, isFinal: boolean) => void,
    setSavedStatuses?: React.Dispatch<
      React.SetStateAction<TaskStatusTimelineType[]>
    >,
  ) {
    this.statusesSet = new Set<string>();
    this.logsSet = new Set<string>();
    this.execLogsCallBack = execLogsCallBack;
    this.setIsPollingEnabled = setIsPollingEnabled;
    this.setSavedStatuses = setSavedStatuses;
    this.setHasReachedFinalStatus = setHasReachedFinalStatus;
    this.statusChangedCallBack = statusChangedCallBack;
  }

  static isFinalStatus = (status: string): boolean => {
    return (
      status === SsmAnsible.AnsibleTaskStatus.FAILED ||
      status === SsmAnsible.AnsibleTaskStatus.SUCCESS ||
      status === SsmAnsible.AnsibleTaskStatus.CANCELED ||
      status === SsmAnsible.AnsibleTaskStatus.TIMEOUT
    );
  };

  resetTerminal = () => {
    this.statusesSet = new Set<string>();
    this.logsSet = new Set<string>();
  };

  pollingCallback = async (execId: string) => {
    try {
      const statuses = await getTaskStatuses(execId);
      if (statuses?.data?.execStatuses) {
        statuses.data.execStatuses.sort(
          (a: API.ExecStatus, b: API.ExecStatus) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

        for (const status of statuses.data.execStatuses) {
          try {
            if (!this.statusesSet.has(status.status)) {
              this.statusesSet.add(status.status);
              if (this.setSavedStatuses) {
                this.setSavedStatuses((oldStatuses) => [
                  ...oldStatuses,
                  taskStatusTimeline.transformToTaskStatusTimeline(status),
                ]);
              }
              if (this.statusChangedCallBack) {
                this.statusChangedCallBack(
                  status.status,
                  PlaybookExecutionHandler.isFinalStatus(status.status),
                );
              }
              if (PlaybookExecutionHandler.isFinalStatus(status.status)) {
                if (this.setHasReachedFinalStatus) {
                  this.setHasReachedFinalStatus(true);
                }
                setTimeout(() => {
                  this.setIsPollingEnabled(false);
                }, 5000);
              }
            }
          } catch (error) {
            console.error('Error processing status:', error, status);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch task statuses:', error);
    }

    if (this.execLogsCallBack) {
      try {
        const logs = await getExecLogs(execId);
        if (logs?.data?.execLogs) {
          logs.data.execLogs.sort(
            (a: API.ExecLog, b: API.ExecLog) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

          for (const execLog of logs.data.execLogs) {
            if (!this.logsSet.has(execLog.logRunnerId)) {
              this.logsSet.add(execLog.logRunnerId);
              if (execLog.stdout) {
                this.execLogsCallBack(execLog);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch exec logs:', error);
      }
    }
  };
}
