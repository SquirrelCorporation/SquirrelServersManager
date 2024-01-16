import taskStatusTimeline from '@/components/TerminalModal/TaskStatusTimeline';
import { executePlaybook, getExecLogs, getTaskStatuses } from '@/services/ant-design-pro/ansible';
import { ClockCircleOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Button, Col, Modal, Row, Steps, StepsProps, message } from 'antd';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { ReactTerminal, TerminalContext } from 'react-terminal';

export type TerminalModalProps = {
  setOpen: any;
  open: boolean;
  command?: string;
};

export type TaskStatusTimelineType = StepsProps & {
  _status: string;
  icon: ReactNode;
  title: string;
};

const TerminalModal = (props: TerminalModalProps) => {
  const { setBufferedContent, setTemporaryContent } = React.useContext(TerminalContext);
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
  let statusesSet = new Set<string>();
  let logsSet = new Set<string>();

  const showModal = () => {
    props.setOpen(true);
  };

  const resetTerminal = () => {
    setBufferedContent('');
    setIsPollingEnabled(false);
    setSavedStatuses([taskInit]);
    statusesSet = new Set();
    logsSet = new Set();
  };

  const handleOk = () => {
    props.setOpen(false);
    resetTerminal();
  };

  const handleCancel = () => {
    props.setOpen(false);
    resetTerminal();
  };

  const handleClick = async () => {
    resetTerminal();
    setBufferedContent((previous) => (
      <>
        <span style={terminalContentStyle}>Starting...</span>
        <br />
      </>
    ));
    try {
      const res = await executePlaybook();
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
      savedStatuses[hasRunning].icon = <VerticalAlignBottomOutlined />;
      savedStatuses[hasRunning].status = 'finish';
    }
  }, [savedStatuses]);

  useEffect(() => {
    const pollingCallback = async () => {
      await getTaskStatuses(execId)
        .then((statuses) => {
          if (statuses && statuses.data.execStatuses) {
            statuses.data.execStatuses.sort((a: API.ExecStatus, b: API.ExecStatus) => {
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
            statuses.data.execStatuses.forEach((status) => {
              if (!statusesSet.has(status.status)) {
                statusesSet.add(status.status);
                setSavedStatuses((savedStatuses) => [
                  ...savedStatuses,
                  taskStatusTimeline.transformToTaskStatusTimeline(status),
                ]);
                if (taskStatusTimeline.isFinalStatus(status.status)) {
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
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
            logs.data.execLogs.forEach((execLog) => {
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

  return (
    <>
      <Modal
        open={props.open}
        title={`Executing playbook ${props.command}...`}
        onOk={handleOk}
        onCancel={handleCancel}
        styles={modalStyles}
        width={1000}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <Button onClick={handleClick}>Restart</Button>
            <CancelBtn />
            <OkBtn />
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
                prompt={''}
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
