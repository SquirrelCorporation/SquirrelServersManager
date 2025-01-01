import { MedicalSearchDiagnosisSolid } from '@/components/Icons/CustomIcons';
import TroubleshootModal from '@/components/Troubleshoot/TroubleshootModal';
import { postDeviceDiagnostic } from '@/services/rest/device';
import { socket } from '@/socket';
import { history } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Col,
  message,
  Row,
  Space,
  StepProps,
  Steps,
} from 'antd';
import React, { useEffect } from 'react';
import { API, SsmDeviceDiagnostic, SsmEvents } from 'ssm-shared-lib';

type ExistingDeviceAdvancedDiagnosticProps = {
  device: Partial<API.DeviceItem>;
};

const items: (StepProps & any)[] = [
  {
    title: 'Ssh Connect',
    description: 'Waiting...',
    key: SsmDeviceDiagnostic.Checks.SSH_CONNECT,
  },
  {
    title: 'Ssh Docker Connect',
    description: 'Waiting...',
    key: SsmDeviceDiagnostic.Checks.SSH_DOCKER_CONNECT,
  },
  {
    title: 'Ssh Docker Socket Connectivity',
    description: 'Waiting...',
    key: SsmDeviceDiagnostic.Checks.DOCKER_SOCKET,
  },
  {
    title: 'Disk Space',
    description: 'Waiting...',
    key: SsmDeviceDiagnostic.Checks.DISK_SPACE,
  },
  {
    title: 'Memory & CPU',
    description: 'Waiting...',
    key: SsmDeviceDiagnostic.Checks.CPU_MEMORY_INFO,
  },
];

const TroubleshootCard: React.FC<ExistingDeviceAdvancedDiagnosticProps> = ({
  device,
}) => {
  const [diagInProgress, setDiagInProgress] = React.useState(false);
  const [steps, setSteps] = React.useState<any[]>(items);
  const onDiagnosticProgress = (payload: any) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.key === payload?.data?.check
          ? {
              ...step,
              description: payload.message || step.description, // Update description if provided
              status: !payload.success ? 'error' : 'success',
            }
          : step,
      ),
    );
  };

  useEffect(() => {
    socket.connect();
    socket.on(SsmEvents.Diagnostic.PROGRESS, onDiagnosticProgress);

    return () => {
      socket.off(SsmEvents.Diagnostic.PROGRESS, onDiagnosticProgress);
      socket.disconnect();
    };
  }, []);

  const onStartDiag = async () => {
    setDiagInProgress(true);
    setSteps(items);
    await postDeviceDiagnostic(device?.uuid as string)
      .then(() => {
        message.loading({ content: 'Diagnostic in progress...', duration: 5 });
      })
      .catch(() => {
        setDiagInProgress(false);
        setSteps(items);
      });
  };

  return (
    <Card
      type="inner"
      title={
        <Row>
          <Col>
            <Avatar
              style={{ backgroundColor: '#8e165e' }}
              shape="square"
              icon={<MedicalSearchDiagnosisSolid />}
            />
          </Col>
          <Col
            style={{
              marginLeft: 10,
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          >
            Troubleshoot
          </Col>
        </Row>
      }
      style={{ marginBottom: 10 }}
      styles={{
        header: { height: 55, minHeight: 55, paddingLeft: 15 },
      }}
    >
      <TroubleshootModal />
    </Card>
  );
};

export default TroubleshootCard;
