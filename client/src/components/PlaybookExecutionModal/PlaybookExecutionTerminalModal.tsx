import { Smart } from '@/components/Icons/CustomIcons';
import TerminalHandler, {
  TaskStatusTimelineType,
} from '@/components/PlaybookExecutionModal/PlaybookExecutionHandler';
import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { getAnsibleSmartFailure } from '@/services/rest/ansible';
import { ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { DotLottie, DotLottieReact } from '@lottiefiles/dotlottie-react';

import { Button, Col, Modal, notification, Row, Steps, Typography } from 'antd';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { API, SsmAnsible } from 'ssm-shared-lib';

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
      _status: 'created',
      status: 'finish',
      icon: <ClockCircleOutlined />,
      title: 'created',
    };
    const statusesType: TaskStatusTimelineType[] = [taskInit];
    const [savedStatuses, setSavedStatuses] = useState(statusesType);
    const timerIdRef = useRef();
    const [hasReachedFinalStatus, setHasReachedFinalStatus] = useState(false);
    const terminalRef = useRef<TerminalCoreHandles>(null);
    const [dotLottie, setDotLottie] = useState<DotLottie | null>(null);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
      if (hasReachedFinalStatus) {
        terminalRef?.current?.onDataIn('# Playbook execution finished', true);
        dotLottie?.stop();
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
        (status) => status._status === 'running',
      );
      if (hasRunning !== -1 && hasRunning < savedStatuses.length - 1) {
        savedStatuses[hasRunning].icon = <ThunderboltOutlined />;
        savedStatuses[hasRunning].status = 'finish';
      }
    };

    const isFinalStatusFailed = async () => {
      if (
        savedStatuses?.find(
          (status) => status._status === SsmAnsible.AnsibleTaskStatus.FAILED,
        )
      ) {
        const res = await getAnsibleSmartFailure({ execId: execId });
        if (res.data) {
          api.open({
            key: 'notification-failed',
            message: 'The playbook execution failed',
            duration: 0,
            description: (
              <>
                <Typography.Paragraph>
                  <b>Probable cause</b>: {res.data.cause}
                  <br />
                  <b>Probable Resolution</b>: {res.data.resolution}
                </Typography.Paragraph>
              </>
            ),
            icon: <Smart />,
          });
        }
      }
    };

    useEffect(() => {
      convertRunningStatusToFinish();
      void isFinalStatusFailed();
    }, [savedStatuses]);

    useEffect(() => {
      const pollingCallback = () => terminalHandler.pollingCallback(execId);

      const startPolling = () => {
        dotLottie?.play();
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

    return (
      <>
        {contextHolder}
        <Modal
          open={isOpen}
          title={
            <div style={{ verticalAlign: 'center' }}>
              <DotLottieReact
                dotLottieRefCallback={setDotLottie}
                src="/lotties/running_squirrel.lottie"
                autoplay
                loop
                style={{ height: '8%', width: '8%', display: 'inline-block' }}
              />
              <div
                style={{
                  display: 'inline-block',
                  transform: 'translate(0, -50%)',
                }}
              >
                Executing playbook {displayName}
                ...{' '}
              </div>
            </div>
          }
          onOk={handleOk}
          onCancel={handleCancel}
          styles={modalStyles}
          width={1000}
          footer={() => (
            <>
              <Button
                disabled={!hasReachedFinalStatus}
                onClick={() => {
                  void startTerminal();
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
          <Row style={{ marginTop: '10px' }}>
            <Col span={24}>
              <Steps size="small" items={savedStatuses} />
            </Col>
          </Row>
        </Modal>
      </>
    );
  },
);
export default PlaybookExecutionTerminalModal;
