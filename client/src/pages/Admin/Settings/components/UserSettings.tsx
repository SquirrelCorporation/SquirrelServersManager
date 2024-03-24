import { MynauiDangerTriangle } from '@/pages/Admin/Settings/components/GeneralSettings';
import { postResetApiKey, postUserLogs } from '@/services/rest/usersettings';
import { useModel } from '@@/exports';
import {
  InfoCircleFilled,
  KeyOutlined,
  UnorderedListOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Popover,
  Row,
  Slider,
  Space,
  Typography,
} from 'antd';
import React, { useState } from 'react';

const UserSettings: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [inputValue, setInputValue] = useState<number | null>(
    currentUser?.settings.userSpecific.userLogsLevel.terminal,
  );
  const [apiKey, setApiKey] = useState(currentUser?.settings.apiKey);

  const onChange = async (newValue: number | null) => {
    if (newValue) {
      await postUserLogs({ terminal: newValue }).then(() => {
        setInputValue(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };

  const onClickResetApiKey = async () => {
    await postResetApiKey().then((res) => {
      setApiKey(res.data.uuid);
      message.success({ content: 'API Key successfully reset', duration: 6 });
    });
  };

  const MynauiApi = (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M5.5 13L7 11.5l5.5 5.5l-1.5 1.5c-.75.75-3.5 2-5.5 0s-.75-4.75 0-5.5ZM3 21l2.5-2.5m13-7.5L17 12.5L11.5 7L13 5.5c.75-.75 3.5-2 5.5 0s.75 4.75 0 5.5Zm-6-3l-2 2M21 3l-2.5 2.5m-2.5 6l-2 2"
      />
    </svg>
  );
  return (
    <Card>
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: '#6d26a8' }}
                shape="square"
                icon={<UnorderedListOutlined />}
              />
            </Col>
            <Col
              style={{ marginLeft: 5, marginTop: 'auto', marginBottom: 'auto' }}
            >
              Logs
            </Col>
          </Row>
        }
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>Log level of terminal</Typography>{' '}
            <Row>
              <Col span={12}>
                <Slider
                  min={1}
                  max={5}
                  onChange={(newValue) => setInputValue(newValue)}
                  onChangeComplete={onChange}
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
        </Flex>
      </Card>
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <Avatar
                style={{ backgroundColor: '#1e6d80' }}
                shape="square"
                icon={<MynauiApi />}
              />
            </Col>
            <Col
              style={{ marginLeft: 5, marginTop: 'auto', marginBottom: 'auto' }}
            >
              API
            </Col>
          </Row>
        }
        style={{ marginTop: 16 }}
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'This will reset all your settings to default'}>
                <InfoCircleFilled />
              </Popover>{' '}
              API KEY
            </Typography>
            <Space.Compact style={{ width: '100%' }}>
              <Button
                type={'primary'}
                onClick={async () => {
                  if (apiKey) {
                    try {
                      await navigator.clipboard.writeText(apiKey);
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
              <Input style={{ width: '350px' }} value={apiKey} disabled />
              <Popconfirm
                title="Reset your API key"
                description={
                  <>
                    Are you sure to delete your API key? <br />
                    This will potentially disable all your agents running on
                    others devices
                  </>
                }
                icon={<WarningOutlined style={{ color: 'red' }} />}
                onConfirm={onClickResetApiKey}
                okText="Yes"
                cancelText="No"
              >
                <Button danger>Reset</Button>
              </Popconfirm>
            </Space.Compact>
          </Space>
        </Flex>
      </Card>
    </Card>
  );
};

export default UserSettings;
