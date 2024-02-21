import { BorderOutlined } from '@ant-design/icons';
import { Card, Flex, InputNumber, Space, Typography } from 'antd';
import React from 'react';

const GeneralSettings: React.FC = () => {
  return (
    <Card>
      <Card type="inner" title="Logs Retention">
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>Server logs retention days</Typography>{' '}
            <InputNumber min={1} max={60} defaultValue={3} />
            <Typography>day(s)</Typography>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
        </Flex>
      </Card>
      <Card type="inner" title="Devices" style={{ marginTop: 16 }}>
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>Consider device offline after</Typography>{' '}
            <InputNumber min={1} max={60} defaultValue={3} />
            <Typography>minute(s)</Typography>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
          <Space direction="horizontal" size="middle">
            <Typography>Consider device offline after</Typography>{' '}
            <InputNumber min={1} max={60} defaultValue={3} />
            <Typography>minute(s)</Typography>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
        </Flex>
      </Card>
    </Card>
  );
};

export default GeneralSettings;
