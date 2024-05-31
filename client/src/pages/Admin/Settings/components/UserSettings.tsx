import { MynauiApi } from '@/components/Icons/CustomIcons';
import Title, { SettingsSubTitleColors } from '@/components/Template/Title';
import { postResetApiKey, postUserLogs } from '@/services/rest/usersettings';
import { useModel } from '@@/exports';
import {
  InfoCircleFilled,
  UnorderedListOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
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

  return (
    <Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'User Level Logs'}
            backgroundColor={SettingsSubTitleColors.USER_LOGS}
            icon={<UnorderedListOutlined />}
          />
        }
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              <Popover
                content={
                  <>
                    The verbosity level of Ansible output, as described{' '}
                    <a
                      target={'_blank'}
                      href={
                        'https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#cmdoption-ansible-playbook-v'
                      }
                      rel="noreferrer"
                    >
                      {' '}
                      here
                    </a>
                  </>
                }
              >
                <InfoCircleFilled />
              </Popover>{' '}
              Log level of terminal
            </Typography>{' '}
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
          <Title.SubTitle
            title={'API'}
            backgroundColor={SettingsSubTitleColors.API}
            icon={<MynauiApi />}
          />
        }
        style={{ marginTop: 16 }}
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover
                content={
                  'The API key is used for programmatic access such as agent or direct REST API'
                }
              >
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
