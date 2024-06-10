import TerminalHandler from '@/components/TerminalModal/TerminalHandler';
import {
  CheckCircleOutlined,
  CloseOutlined,
  InfoCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import { Popover, Steps, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { API } from 'ssm-shared-lib';

export type CheckDeviceConnectionProps = {
  execId?: string;
  dockerConnRes?: string;
  dockerConnErrorMessage?: string;
};

const CheckDeviceConnection: React.FC<CheckDeviceConnectionProps> = (props) => {
  const { execId, dockerConnRes, dockerConnErrorMessage } = props;
  const timerIdRef = useRef();
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [playbookStatus, setPlaybookStatus] = useState('running...');
  const [dockerStatus, setDockerStatus] = useState('running...');
  const [execRes, setExecRes] = useState(<></>);
  const statusCallback = (status: string) => {
    setPlaybookStatus(status);
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
  );

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
    const pollingCallback = () => terminalHandler.pollingCallback(execId || '');

    const startPolling = () => {
      // pollingCallback(); // To immediately start fetching data
      // Polling every 3 seconds
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
    <Steps
      direction="vertical"
      items={[
        {
          title: 'Ansible Playbook test',
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
  );
};

export default CheckDeviceConnection;
