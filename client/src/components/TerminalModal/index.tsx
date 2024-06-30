import TerminalHandler, {
  TaskStatusTimelineType,
} from '@/components/TerminalModal/TerminalHandler';
import TerminalLogs from '@/components/TerminalModal/TerminalLogs';
import {
  executePlaybook,
  executePlaybookByQuickRef,
} from '@/services/rest/playbooks';
import { ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Col, Modal, Row, Steps, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { ReactTerminal, TerminalContext } from 'react-terminal';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { API } from 'ssm-shared-lib';

export type TerminalStateProps = {
  isOpen: boolean;
  command?: string;
  quickRef?: string;
  target?: API.DeviceItem[];
  extraVars?: API.ExtraVars;
};

export type TerminalModalProps = {
  terminalProps: TerminalStateProps & {
    setIsOpen: (open: boolean) => void;
  };
};

const TerminalModal = (props: TerminalModalProps) => {
  const { setBufferedContent } = React.useContext(TerminalContext);
  const [execId, setExecId] = React.useState('');
  const modalStyles = {
    body: {
      height: '600px',
    },
  };
  const terminalContentStyle = {
    fontSize: '11px',
    fontFamily: 'Menlo',
  };
  const taskInit: TaskStatusTimelineType = {
    _status: 'created',
    status: 'finish',
    icon: <ClockCircleOutlined />,
    title: 'created',
  };
  const statusesType: TaskStatusTimelineType[] = [taskInit];

  const timerIdRef = useRef();
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [savedStatuses, setSavedStatuses] = useState(statusesType);
  const [hasReachedFinalStatus, setHasReachedFinalStatus] = useState(false);
  const execLogCallBack = (execLog: API.ExecLog) => {
    setBufferedContent((previous) => (
      <TerminalLogs
        execLog={execLog}
        previous={previous}
        terminalContentStyle={terminalContentStyle}
      />
    ));
  };

  const terminalHandler = new TerminalHandler(
    setIsPollingEnabled,
    setHasReachedFinalStatus,
    execLogCallBack,
    undefined,
    setSavedStatuses,
  );

  const resetTerminal = () => {
    setBufferedContent('');
    setIsPollingEnabled(false);
    setSavedStatuses([taskInit]);
    terminalHandler.resetTerminal();
  };

  const handleOk = () => {
    props.terminalProps.setIsOpen(false);
    resetTerminal();
  };

  const handleCancel = () => {
    props.terminalProps.setIsOpen(false);
    resetTerminal();
  };

  const startTerminal = async () => {
    resetTerminal();
    setBufferedContent(() => (
      <>
        <span style={terminalContentStyle}>Starting...</span>
        <br />
      </>
    ));
    if (!props.terminalProps.command && !props.terminalProps.quickRef) {
      message.error({
        type: 'error',
        content: 'Error running playbook (internal)',
        duration: 8,
      });
      setBufferedContent(() => (
        <>
          <span style={terminalContentStyle}>No command</span>
          <br />
        </>
      ));
      return;
    }
    try {
      const res = !props.terminalProps.quickRef
        ? await executePlaybook(
            props.terminalProps.command as string,
            props.terminalProps.target?.map((e) => e.uuid),
            props.terminalProps.extraVars,
          )
        : await executePlaybookByQuickRef(
            props.terminalProps.quickRef,
            props.terminalProps.target?.map((e) => e.uuid),
            props.terminalProps.extraVars,
          );
      setExecId(res.data.execId);
      message.loading({
        content: `Playbook is running with id "${res.data.execId}"`,
        duration: 8,
      });
      setIsPollingEnabled(true);
    } catch (error: any) {
      message.error({
        type: 'error',
        content: 'Error running playbook',
        duration: 8,
      });
    }
  };

  useEffect(() => {
    const hasRunning = savedStatuses.findIndex((e) => e._status === 'running');
    if (hasRunning !== -1 && hasRunning < savedStatuses.length - 1) {
      savedStatuses[hasRunning].icon = <ThunderboltOutlined />;
      savedStatuses[hasRunning].status = 'finish';
    }
  }, [savedStatuses]);

  useEffect(() => {
    const pollingCallback = () => terminalHandler.pollingCallback(execId);

    const startPolling = () => {
      // pollingCallback(); // To immediately start fetching data
      // Polling every 30 seconds
      // @ts-ignore
      timerIdRef.current = setInterval(pollingCallback, 3000);
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

  useEffect(() => {
    if (props.terminalProps.isOpen && !isPollingEnabled) {
      startTerminal();
    }
  }, [props.terminalProps.isOpen]);

  return (
    <>
      <Modal
        open={props.terminalProps.isOpen}
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
              Executing playbook{' '}
              {props.terminalProps.command || props.terminalProps.quickRef}...{' '}
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
};
export default TerminalModal;
