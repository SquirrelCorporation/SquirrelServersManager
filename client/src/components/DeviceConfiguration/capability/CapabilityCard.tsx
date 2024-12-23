import { AutoFocus } from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import { InfoCircleFilled } from '@ant-design/icons';
import { ProFormSwitch } from '@ant-design/pro-components';
import { Card, Col, Row, Tooltip } from 'antd';
import React from 'react';

interface CapabilityCardProps {
  initialValue: boolean;
  onChange: (checked: boolean) => void;
}
const CapabilityCard: React.FC<CapabilityCardProps> = ({
  initialValue,
  onChange,
}) => {
  return (
    <Card
      type="inner"
      title={
        <CardHeader
          title={'Enable/Disable Capability'}
          color={'#9f323b'}
          icon={<AutoFocus />}
        />
      }
      style={{ marginBottom: 10 }}
      styles={{
        header: { height: 45, minHeight: 45, paddingLeft: 15 },
        body: { paddingBottom: 0 },
      }}
      extra={
        <Tooltip title="Activate or deactivate the capability on this device.">
          <InfoCircleFilled />
        </Tooltip>
      }
    >
      <Row justify="center" align="middle" style={{ height: '100%' }}>
        <Col>
          <ProFormSwitch
            checkedChildren={'Enabled'}
            unCheckedChildren={'Disabled'}
            fieldProps={{
              defaultChecked: initialValue,
              onChange: onChange,
            }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default CapabilityCard;
