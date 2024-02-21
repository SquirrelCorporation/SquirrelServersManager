import taskStatusTimeline from '@/components/TerminalModal/TaskStatusTimeline';
import {
  executePlaybook,
  getExecLogs,
  getTaskStatuses,
} from '@/services/rest/ansible';
import { ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Col, Modal, Row, Steps, StepsProps, message } from 'antd';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { ReactTerminal, TerminalContext } from 'react-terminal';
import { DotLottiePlayer } from '@dotlottie/react-player';

export type TerminalStateProps = {
  isOpen: boolean;
  command: string | undefined;
  target?: API.DeviceItem[];
};

export type TerminalModalProps = {
  terminalProps: TerminalStateProps & {
    setIsOpen: (open: boolean) => void;
  };
};

export type TaskStatusTimelineType = StepsProps & {
  _status: string;
  icon: ReactNode;
  title: string;
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
    fontSize: '12px',
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
  let statusesSet = new Set<string>();
  let logsSet = new Set<string>();

  const resetTerminal = () => {
    setBufferedContent('');
    setIsPollingEnabled(false);
    setSavedStatuses([taskInit]);
    statusesSet = new Set();
    logsSet = new Set();
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
    if (!props.terminalProps.command) {
      message.error({
        type: 'error',
        content: 'Error running playbook (internal)',
        duration: 8,
      });
      return;
    }
    try {
      const res = await executePlaybook(
        props.terminalProps.command,
        props.terminalProps.target?.map((e) => e.uuid),
      );
      setExecId(res.data.execId);
      message.loading({
        content: `Playbook is running with id "${res.data.execId}"`,
        duration: 8,
      });
      setIsPollingEnabled(true);
    } catch (err) {
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
    const pollingCallback = async () => {
      await getTaskStatuses(execId)
        .then((statuses) => {
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
              if (!statusesSet.has(status.status)) {
                statusesSet.add(status.status);
                setSavedStatuses((oldStatuses) => [
                  ...oldStatuses,
                  taskStatusTimeline.transformToTaskStatusTimeline(status),
                ]);
                if (taskStatusTimeline.isFinalStatus(status.status)) {
                  setHasReachedFinalStatus(true);
                  setTimeout(() => {
                    setIsPollingEnabled(false);
                  }, 5000);
                }
              }
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });

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
              if (!logsSet.has(execLog.logRunnerId)) {
                logsSet.add(execLog.logRunnerId);
                if (execLog.stdout) {
                  setBufferedContent((previous) => (
                    <>
                      {previous}
                      <span style={terminalContentStyle}>{execLog.stdout}</span>
                      <br />
                    </>
                  ));
                }
              }
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    };

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
              Executing playbook {props.terminalProps.command}...{' '}
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
