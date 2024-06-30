import taskStatusTimeline from '@/components/TerminalModal/TaskStatusTimeline';
import { getExecLogs, getTaskStatuses } from '@/services/rest/playbooks';
import { StepsProps } from 'antd';
import React, { ReactNode } from 'react';
import { API } from 'ssm-shared-lib';

export type TaskStatusTimelineType = StepsProps & {
  _status: string;
  icon: ReactNode;
  title: string;
};

export default class TerminalHandler {
  private statusesSet;
  private logsSet;
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
    return status === 'failed' || status === 'successful';
  };

  resetTerminal = () => {
    this.statusesSet = new Set<string>();
    this.logsSet = new Set<string>();
  };

  pollingCallback = async (execId: string) => {
    await getTaskStatuses(execId)
      .then((statuses) => {
        // Sort statuses
        if (statuses && statuses.data.execStatuses) {
          statuses.data.execStatuses.sort(
            (a: API.ExecStatus, b: API.ExecStatus) => {
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            },
          );
          statuses.data.execStatuses.forEach((status: API.ExecStatus) => {
            // Check if a new statuses appeared
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
                  TerminalHandler.isFinalStatus(status.status),
                );
              }
              if (TerminalHandler.isFinalStatus(status.status)) {
                if (this.setHasReachedFinalStatus) {
                  this.setHasReachedFinalStatus(true);
                }
                setTimeout(() => {
                  this.setIsPollingEnabled(false);
                }, 5000);
              }
            }
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });

    if (this.execLogsCallBack) {
      await getExecLogs(execId)
        .then((logs) => {
          if (logs && logs.data.execLogs) {
            logs.data.execLogs.sort((a: API.ExecLog, b: API.ExecLog) => {
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            });
            logs.data.execLogs.forEach((execLog: API.ExecLog) => {
              if (!this.logsSet.has(execLog.logRunnerId)) {
                this.logsSet.add(execLog.logRunnerId);
                if (execLog.stdout) {
                  // @ts-expect-error
                  this.execLogsCallBack(execLog);
                }
              }
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
}
