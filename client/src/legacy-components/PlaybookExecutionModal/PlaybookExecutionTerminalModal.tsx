import { Smart } from '@/components/Icons/CustomIcons';
import TerminalHandler, {
  TaskStatusTimelineType,
} from '@/components/PlaybookExecutionModal/PlaybookExecutionHandler';
import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { getExecLogs } from '@/services/rest/playbooks/playbooks';
import styles from '../HeaderComponents/PlaybookExecutionWidget.less';
import { Spin } from 'antd';
import PlaybookExecutionHandler from '@/components/PlaybookExecutionModal/PlaybookExecutionHandler';
import {
  PLAYBOOK_EXECUTION_START,
  playbookExecutionEvents,
} from '../HeaderComponents/PlaybookExecutionWidget';

import { Button, Col, Modal, notification, Row, Steps, Typography } from 'antd';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';

declare global {
  interface Window {
    setPlaybookWidgetRetry?: () => void;
  }
}

export interface PlaybookExecutionTerminalModalHandles {
  resetTerminal: () => void;
  resetScreen: () => void;
}

type PlaybookExecutionTerminalModalProps = {
  execId: string;
  startTerminal: () => Promise<void>;
  isOpen: boolean;
  displayName: string;
  setIsOpen: (open: boolean) => void;
  isPollingEnabled: boolean;
  setIsPollingEnabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const MODAL_WIDTH = 1000;
const modalStyles = {
  body: {
    height: '600px',
  },
};

const POLLING_INTERVAL_MS = 3000;

const PlaybookExecutionTerminalModal = React.forwardRef<
  PlaybookExecutionTerminalModalHandles,
  PlaybookExecutionTerminalModalProps
>(
  (
    {
      execId,
      startTerminal,
      isOpen,
      displayName,
      setIsOpen,
      isPollingEnabled,
      setIsPollingEnabled,
    },
    ref,
  ) => {
    const taskInit: TaskStatusTimelineType = {
      status: 'created',
      title: 'created',
    };
    const statusesType: TaskStatusTimelineType[] = [taskInit];
    const [savedStatuses, setSavedStatuses] = useState(statusesType);
    const timerIdRef = useRef();
    const [hasReachedFinalStatus, setHasReachedFinalStatus] = useState(false);
    const terminalRef = useRef<TerminalCoreHandles>(null);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
      if (hasReachedFinalStatus) {
        terminalRef?.current?.onDataIn('# Playbook execution finished', true);
      }
    }, [hasReachedFinalStatus]);

    const execLogCallBack = (execLog: API.ExecLog) => {
      if (execLog.stdout) {
        terminalRef?.current?.onDataIn(execLog.stdout as string, true);
      }
    };

    const resetScreen = () => {
      terminalRef?.current?.resetTerminalContent();
    };

    const terminalHandler = new TerminalHandler(
      setIsPollingEnabled,
      setHasReachedFinalStatus,
      execLogCallBack,
      undefined,
      setSavedStatuses,
    );

    const convertRunningStatusToFinish = () => {
      const hasRunning = savedStatuses.findIndex(
        (status) => status.status === 'running',
      );
      if (hasRunning !== -1 && hasRunning < savedStatuses.length - 1) {
        savedStatuses[hasRunning].status = 'finish';
      }
    };

    useEffect(() => {
      convertRunningStatusToFinish();
    }, [savedStatuses]);

    useEffect(() => {
      const pollingCallback = () => terminalHandler.pollingCallback(execId);

      const startPolling = () => {
        terminalRef?.current?.onDataIn(
          '---\n' +
            '#  ,;;:;,\n' +
            '#   ;;;;;\n' +
            "#  ,:;;:;    ,'=.\n" +
            "#  ;:;:;' .=\" ,'_\\\n" +
            "#  ':;:;,/  ,__:=@\n" +
            "#   ';;:;  =./)_\n" +
            '#     `"=\\_  )_"`\n' +
            '#          ``\'"`\n' +
            '# Squirrel Servers Manager Playbook Executor\n' +
            '---\n',
        );
        // pollingCallback(); // To immediately start fetching data
        // Polling every 30 seconds
        // @ts-ignore
        timerIdRef.current = setInterval(pollingCallback, POLLING_INTERVAL_MS);
      };

      const stopPolling = () => {
        clearInterval(timerIdRef.current);
      };

      if (isPollingEnabled) {
        startPolling();
      } else {
        stopPolling();
      }

      return () => {
        stopPolling();
      };
    }, [isPollingEnabled]);

    const resetTerminal = () => {
      resetScreen();
      setIsPollingEnabled(false);
      setSavedStatuses([taskInit]);
      terminalHandler.resetTerminal();
    };

    const handleOk = () => {
      setIsOpen(false);
      resetTerminal();
    };

    const handleCancel = () => {
      setIsOpen(false);
      resetTerminal();
    };

    useImperativeHandle(ref, () => ({
      resetTerminal,
      resetScreen,
    }));

    // Fetch all logs once if modal is opened after execution is finished
    useEffect(() => {
      if (isOpen && !isPollingEnabled && execId) {
        setHasReachedFinalStatus(true);
        getExecLogs(execId).then((logs) => {
          if (logs?.data?.execLogs) {
            logs.data.execLogs.sort(
              (a: API.ExecLog, b: API.ExecLog) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
            logs.data.execLogs.forEach((execLog: API.ExecLog) => {
              if (execLog.stdout) {
                terminalRef?.current?.onDataIn(execLog.stdout as string, true);
              }
            });
          }
        });
      }
    }, [isOpen, isPollingEnabled, execId]);

    // Compute current status and isFinal for reactivity
    return (
      <>
        {contextHolder}
        <Modal
          open={isOpen}
          title={
            <>
              Executing playbook {displayName}
              ...{' '}
            </>
          }
          onOk={handleOk}
          onCancel={handleCancel}
          styles={modalStyles}
          width={MODAL_WIDTH}
          footer={() => (
            <>
              <Button
                disabled={!hasReachedFinalStatus}
                onClick={() => {
                  if (window.setPlaybookWidgetRetry) {
                    window.setPlaybookWidgetRetry();
                  }
                  playbookExecutionEvents.emit(PLAYBOOK_EXECUTION_START, {
                    execId,
                    displayName,
                  });
                  setIsOpen(false);
                  api.destroy('notification-failed');
                }}
              >
                Retry
              </Button>
              <Button
                disabled={!hasReachedFinalStatus}
                type="primary"
                loading={!hasReachedFinalStatus}
                onClick={handleOk}
              >
                OK
              </Button>
            </>
          )}
        >
          <Row>
            <Col span={24}>
              <div style={{ height: '500px' }}>
                <TerminalCore
                  ref={terminalRef}
                  disableStdin={true}
                  rows={35}
                  cols={130}
                  convertEol={true}
                />
              </div>
            </Col>
          </Row>
          <Row
            style={{
              marginTop: '10px',
              textAlign: 'center',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Col span={24}>
              <img
                src="/squirrels/happy-fox.svg"
                alt="Happy Fox"
                style={{ height: 60, margin: '0 auto', display: 'block' }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                {!hasReachedFinalStatus && (
                  <Spin size="small" style={{ marginRight: 8 }} />
                )}
                <span
                  className={
                    !hasReachedFinalStatus ? styles['shimmer-text'] : ''
                  }
                >
                  Playbook execution:{' '}
                  {savedStatuses[savedStatuses.length - 1]?.title}
                </span>
              </div>
            </Col>
          </Row>
        </Modal>
      </>
    );
  },
);
export default PlaybookExecutionTerminalModal;
