import TerminalHandler, {
  TaskStatusTimelineType,
} from '@/components/PlaybookExecutionModal/PlaybookExecutionHandler';
import TerminalCore, {
  TerminalCoreHandles,
} from '@/components/Terminal/TerminalCore';
import { getAnsibleSmartFailure } from '@/services/rest/ansible';
import { ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
  DotLottieCommonPlayer,
  DotLottiePlayer,
} from '@dotlottie/react-player';
import { Button, Col, Modal, notification, Row, Steps, Typography } from 'antd';
import React, {
  LegacyRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { API } from 'ssm-shared-lib';

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
    const lottieRef = useRef<DotLottieCommonPlayer>();
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
      if (hasReachedFinalStatus) {
        terminalRef?.current?.onDataIn('# Playbook execution finished', true);
        lottieRef.current?.stop();
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
      if (savedStatuses?.find((status) => status._status === 'failed')) {
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
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 512 512"
              >
                <path
                  fill="currentColor"
                  d="M256.3 19.95c-41 0-74.1 32.7-74.1 73.27c0 22.98 8 33.78 16.8 47.78c5.9 9.3 12 20.1 15.5 35.6h83c3.5-15.9 9.6-26.8 15.5-36.2c8.9-14.1 16.8-24.7 16.8-47.18c0-40.57-32.8-73.27-73.5-73.27zm-142.1 7.7L81 35.4l81.2 40.25l-48-48zm283.6 0l-48 48L431 35.4l-33.2-7.75zM210.5 79.2l45.5 22.7l45.5-22.7l-20.8 83l-17.4-4.4l11.2-45l-18.5 9.3l-18.5-9.3l11.2 45l-17.4 4.4l-20.8-83zM64 96.03v32.07l96-16.1l-96-15.97zm384 0L352 112l96 16V96.03zM334.2 144.3l39.9 63.3l24.1-15.3l-64-48zm-156.4.1l-64 48l24.1 15.3l39.9-63.3zM216 191v16h80v-16h-80zm34.4 28.3c-13.7 0-26.9.5-35.7 1c-68.2 10.7-82.9 105.4-66.7 191.6h23.6l-1-105.4l18.6-.2c-1.4 63.7 1.6 126.6 5.5 189.7h51.4V390.3h18.7V496h50.4c4.5-65 5.9-131.5 6.5-189.7l18.7.2l-1.1 105.4h24.6c18.3-88.5-4.8-178.9-67.1-190.6c-9.4-1.4-24.9-2-40.6-2h-5.8z"
                />
              </svg>
            ),
          });
        }
      }
    };

    useEffect(() => {
      convertRunningStatusToFinish();
      isFinalStatusFailed();
    }, [savedStatuses]);

    useEffect(() => {
      const pollingCallback = () => terminalHandler.pollingCallback(execId);

      const startPolling = () => {
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
              <DotLottiePlayer
                ref={lottieRef as LegacyRef<DotLottieCommonPlayer>}
                src="/Animation-1705922266332.lottie"
                autoplay
                loop
                style={{ height: '5%', width: '5%', display: 'inline-block' }}
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
