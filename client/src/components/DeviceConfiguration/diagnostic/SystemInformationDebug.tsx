import { Avatar, Button, Card, Col, Row, Tooltip } from 'antd';
import { useState } from 'react';
import { HardwareCircuit } from '@/components/Icons/CustomIcons';
import RemoteSystemInformationTerminal from '@/components/Terminal/RemoteSystemInformationTerminal';
import { API } from 'ssm-shared-lib';
import { ACCENT_COLORS } from '@/styles/colors';

export type SystemInformationDebugProps = {
  device: Partial<API.DeviceItem>;
};

const SystemInformationDebug: React.FC<SystemInformationDebugProps> = ({
  device,
}) => {
  const [debugModalVisible, setDebugModalVisible] = useState<boolean>(false);

  return (
    <>
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: ACCENT_COLORS[1] }}
                shape="square"
                icon={<HardwareCircuit />}
              />
            </Col>
            <Col
              style={{
                marginLeft: 10,
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              Advanced Diagnostic
            </Col>
          </Row>
        }
        style={{ marginBottom: 10 }}
        styles={{
          header: { height: 55, minHeight: 55, paddingLeft: 15 },
          body: { paddingBottom: 0 },
        }}
      >
        <Tooltip title="Debug mode - Execute commands in real-time and view output">
          <Button
            onClick={() => setDebugModalVisible(true)}
            style={{ marginBottom: 20 }}
          >
            Debug System Information
          </Button>
        </Tooltip>
      </Card>
      {/* Debug Terminal Modal */}
      <RemoteSystemInformationTerminal
        visible={debugModalVisible}
        onClose={() => setDebugModalVisible(false)}
        device={device}
      />
    </>
  );
};

export default SystemInformationDebug;
