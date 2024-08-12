import TerminalHandler, {
  TaskStatusTimelineType,
} from '@/components/TerminalModal/TerminalHandler';
import TerminalLogs from '@/components/TerminalModal/TerminalLogs';
import { ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { Button, Col, Modal, Row, Steps } from 'antd';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ReactTerminal, TerminalContext } from 'react-terminal';
import { API } from 'ssm-shared-lib';

export interface TerminalCoreModalHandles {
  resetTerminal: () => void;
  resetScreen: () => void;
}

type TerminalCoreModalProps = {
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

const terminalContentStyle = {
  fontSize: '11px',
  fontFamily: 'Menlo',
};

const POLLING_INTERVAL_MS = 3000;

const TerminalCoreModal = React.forwardRef<
  TerminalCoreModalHandles,
  TerminalCoreModalProps
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
    const { setBufferedContent } = React.useContext(TerminalContext);
    const execLogCallBack = (execLog: API.ExecLog) => {
      setBufferedContent((previous) => (
        <TerminalLogs
          execLog={execLog}
          previous={previous}
          terminalContentStyle={terminalContentStyle}
        />
      ));
    };

    const resetScreen = () => {
      setBufferedContent(() => (
        <>
          <span style={terminalContentStyle}>Starting...</span>
          <br />
        </>
      ));
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

    useEffect(() => {
      convertRunningStatusToFinish();
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
      setBufferedContent('');
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
        <Modal
          open={isOpen}
          title={
            <div style={{ verticalAlign: 'center' }}>
              <DotLottiePlayer
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
              <Button disabled={!hasReachedFinalStatus} onClick={startTerminal}>
                Restart
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
                <ReactTerminal
                  theme="material-dark"
                  showControlBar={false}
                  showControlButtons={false}
                  enableInput={false}
                  prompt={'$'}
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
export default TerminalCoreModal;
