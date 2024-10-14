import SwitchConnexionMethod from '@/components/NewDeviceModal/SwitchConnexionMethod';
import TerminalHandler, {
  TaskStatusTimelineType,
} from '@/components/PlaybookExecutionModal/PlaybookExecutionHandler';
import { getAnsibleSmartFailure } from '@/services/rest/ansible';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  InfoCircleFilled,
  LoadingOutlined,
  SwitcherOutlined,
} from '@ant-design/icons';
import { Alert, Button, Popover, Steps, Typography } from 'antd';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';

export type CheckDeviceConnectionProps = {
  execId?: string;
  dockerConnRes?: string;
  dockerConnErrorMessage?: string;
};

const taskInit: TaskStatusTimelineType = {
  _status: 'created',
  status: 'finish',
  icon: <ClockCircleOutlined />,
  title: 'created',
};

const animationVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

const CheckDeviceConnection: React.FC<CheckDeviceConnectionProps> = (props) => {
  const { execId, dockerConnRes, dockerConnErrorMessage } = props;
  const timerIdRef = useRef();
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [playbookStatus, setPlaybookStatus] = useState('running...');
  const [dockerStatus, setDockerStatus] = useState('running...');
  const [execRes, setExecRes] = useState(<></>);
  const [smartFailure, setSmartFailure] = useState<
    API.SmartFailure | undefined
  >();
  const statusesType: TaskStatusTimelineType[] = [taskInit];
  const [savedStatuses, setSavedStatuses] = useState(statusesType);
  const statusCallback = (status: string) => {
    setPlaybookStatus(status);
  };
  const [count, setCount] = useState(0);

  const isFinalStatusFailed = async () => {
    if (savedStatuses?.find((status) => status._status === 'failed')) {
      const res = await getAnsibleSmartFailure({ execId: execId });
      if (res.data) {
        setSmartFailure(res.data);
      }
      return true;
    }
  };
  const execLogsCallBack = (execLog: API.ExecLog) => {
    setExecRes((previous) => (
      <>
        <Typography.Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
        >
          {' '}
          {execLog.stdout}
        </Typography.Paragraph>
        {previous}
      </>
    ));
  };
  const terminalHandler = new TerminalHandler(
    setIsPollingEnabled,
    undefined,
    execLogsCallBack,
    statusCallback,
    setSavedStatuses,
  );

  useEffect(() => {
    void isFinalStatusFailed();
  }, [savedStatuses]);

  useEffect(() => {
    if (execId) {
      terminalHandler.resetTerminal();
      setPlaybookStatus('running...');
      setIsPollingEnabled(true);
    } else {
      setPlaybookStatus('running...');
      terminalHandler.resetTerminal();
      setIsPollingEnabled(false);
    }
  }, [execId]);

  useEffect(() => {
    if (dockerConnRes) {
      setDockerStatus(dockerConnRes);
    } else {
      setDockerStatus('running...');
    }
  }, [dockerConnRes]);

  useEffect(() => {
    const pollingCallback = () => {
      terminalHandler.pollingCallback(execId || '');
      setCount((prevCount) => prevCount + 1);
    };

    const startPolling = () => {
      setCount(0);
      // Polling every 3 seconds
      // @ts-ignore
      timerIdRef.current = setInterval(pollingCallback, 3000);
      setSmartFailure(undefined);
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
      <Steps
        direction="vertical"
        items={[
          {
            title: 'Ansible Playbook : Ansible Ping & Call SSM API URL',
            description: (
              <>
                {playbookStatus}{' '}
                {playbookStatus === 'failed' && (
                  <Popover
                    title={'Ansible Connection Logs'}
                    content={
                      <div style={{ overflowY: 'scroll', height: '400px' }}>
                        {execRes}
                      </div>
                    }
                    overlayStyle={{
                      width: '400px',
                      height: '400px',
                      overflowY: 'scroll',
                    }}
                  >
                    <InfoCircleFilled />
                  </Popover>
                )}
              </>
            ),
            icon:
              playbookStatus === 'successful' ? (
                <CheckCircleOutlined />
              ) : playbookStatus === 'failed' ? (
                <CloseOutlined style={{ color: 'red' }} />
              ) : (
                <LoadingOutlined />
              ),
          },
          {
            title: 'Docker Connection test',
            description: (
              <>
                {dockerStatus}{' '}
                {dockerStatus === 'failed' && (
                  <Popover
                    content={
                      <Typography.Text type="danger">
                        {dockerConnErrorMessage}
                      </Typography.Text>
                    }
                    title={'Docker Connection Logs'}
                  >
                    <InfoCircleFilled />
                  </Popover>
                )}
              </>
            ),
            icon:
              dockerStatus === 'successful' ? (
                <CheckCircleOutlined />
              ) : dockerStatus === 'failed' ? (
                <CloseOutlined style={{ color: 'red' }} />
              ) : (
                <LoadingOutlined />
              ),
          },
        ]}
      />
      {smartFailure && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animationVariants}
          transition={{ duration: 0.5 }}
        >
          <Alert
            message={'Ansible failed'}
            description={
              <>
                <Typography.Paragraph>
                  <b>Probable cause</b>: {smartFailure.cause}
                  <br />
                  <b>Probable Resolution</b>: {smartFailure.resolution}
                </Typography.Paragraph>
              </>
            }
            showIcon
            type={'error'}
          />
        </motion.div>
      )}
      {(playbookStatus === 'failed' || count > 10) && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animationVariants}
          transition={{ duration: 0.5 }}
        >
          <SwitchConnexionMethod />
        </motion.div>
      )}
    </>
  );
};

export default CheckDeviceConnection;
