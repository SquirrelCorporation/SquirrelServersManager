import { BorderOutlined } from '@ant-design/icons';
import { Flex, InputNumber, Space, Typography } from 'antd';
import React from 'react';

const DeviceSettings: React.FC = () => {
  return (
    <Flex vertical gap={32} style={{ width: '50%' }}>
      <Space direction="horizontal" size="middle">
        <Typography>
          <BorderOutlined /> Consider device offline after
        </Typography>{' '}
        <InputNumber min={1} max={60} defaultValue={3} />
        <Typography>minute(s)</Typography>
        <Space.Compact style={{ width: '100%' }} />
      </Space>
      <Space direction="horizontal" size="middle">
        <Typography>
          <BorderOutlined /> Consider device offline after
        </Typography>{' '}
        <InputNumber min={1} max={60} defaultValue={3} />
        <Typography>minute(s)</Typography>
        <Space.Compact style={{ width: '100%' }} />
      </Space>
    </Flex>
  );
};

export default DeviceSettings;
