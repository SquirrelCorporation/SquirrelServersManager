import { useModel } from '@@/exports';
import { BorderOutlined, KeyOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Flex,
  Input,
  InputNumber,
  message,
  Row,
  Slider,
  Space,
  Typography,
} from 'antd';
import React, { useState } from 'react';

const CommonSettings: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [inputValue, setInputValue] = useState<number | null>(1);

  const onChange = (newValue: number | null) => {
    setInputValue(newValue);
  };
  return (
    <Card>
      <Card type="inner" title="Logs">
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>Log level of terminal</Typography>{' '}
            <Row>
              <Col span={12}>
                <Slider
                  min={1}
                  max={5}
                  onChange={onChange}
                  value={typeof inputValue === 'number' ? inputValue : 0}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={1}
                  max={5}
                  style={{ margin: '0 16px' }}
                  value={inputValue}
                  onChange={onChange}
                />
              </Col>
            </Row>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
          <Space direction="horizontal" size="middle">
            <Typography>Server logs retention days</Typography>{' '}
            <InputNumber min={1} max={60} defaultValue={3} />
            <Typography>day(s)</Typography>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
        </Flex>
      </Card>
      <Card type="inner" title="API" style={{ marginTop: 16 }}>
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="vertical" size="middle">
            <Typography>
              <KeyOutlined /> API KEY
            </Typography>
            <Space.Compact style={{ width: '100%' }}>
              <Button
                type={'primary'}
                onClick={async () => {
                  if (currentUser?.settings.apiKey) {
                    try {
                      await navigator.clipboard.writeText(
                        currentUser?.settings.apiKey,
                      );
                      message.success({
                        content: 'Successfully copied',
                        duration: 8,
                      });
                    } catch (err) {
                      message.error({
                        content: 'Cannot copy',
                        duration: 8,
                      });
                    }
                  } else {
                    message.error({
                      content: 'Internal error',
                      duration: 8,
                    });
                  }
                }}
              >
                Copy
              </Button>
              <Input defaultValue={currentUser?.settings.apiKey} disabled />
              <Button danger>Reset</Button>
            </Space.Compact>
          </Space>
        </Flex>
      </Card>
    </Card>
  );
};

export default CommonSettings;
