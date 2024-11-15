import CheckDeviceConnection from '@/components/DeviceConfiguration/CheckDeviceConnection';
import { StreamlineComputerConnection } from '@/components/Icons/CustomIcons';
import {
  getCheckDeviceAnsibleConnection,
  getCheckDeviceDockerConnection,
} from '@/services/rest/device';
import { Avatar, Button, Card, Col, Row } from 'antd';
import React, { useState } from 'react';
import { API } from 'ssm-shared-lib';

type ConnectionTestTabProps = {
  device: Partial<API.DeviceItem>;
};

const ExistingDeviceConnectionTest: React.FC<ConnectionTestTabProps> = ({
  device,
}) => {
  const [execId, setExecId] = useState<string | undefined>();
  const [dockerConnectionStatus, setDockerConnectionStatus] = useState<
    string | undefined
  >();
  const [dockerConnectionErrorMessage, setDockerConnectionErrorMessage] =
    useState<string | undefined>();
  const [testStarted, setTestStarted] = useState(false);
  const asyncFetch = async () => {
    if (!device.uuid) {
      return;
    }
    setExecId(undefined);
    setDockerConnectionErrorMessage(undefined);
    setDockerConnectionStatus('running...');
    setTestStarted(true);
    await getCheckDeviceAnsibleConnection(device.uuid).then((e) => {
      setExecId(e.data.taskId);
    });
    await getCheckDeviceDockerConnection(device.uuid).then((e) => {
      setDockerConnectionStatus(e.data.connectionStatus);
      setDockerConnectionErrorMessage(e.data.errorMessage);
    });
  };
  return (
    <Card
      type="inner"
      title={
        <Row>
          <Col>
            <Avatar
              style={{ backgroundColor: '#16728e' }}
              shape="square"
              icon={<StreamlineComputerConnection />}
            />
          </Col>
          <Col
            style={{
              marginLeft: 10,
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          >
            Test connections
          </Col>
        </Row>
      }
      style={{ marginBottom: 10 }}
      styles={{
        header: { height: 55, minHeight: 55, paddingLeft: 15 },
        body: { paddingBottom: 0 },
      }}
    >
      {testStarted && (
        <CheckDeviceConnection
          execId={execId}
          dockerConnRes={dockerConnectionStatus}
          dockerConnErrorMessage={dockerConnectionErrorMessage}
        />
      )}
      <Button style={{ marginBottom: 20 }} onClick={asyncFetch}>
        Run connection tests
      </Button>
    </Card>
  );
};

export default ExistingDeviceConnectionTest;
