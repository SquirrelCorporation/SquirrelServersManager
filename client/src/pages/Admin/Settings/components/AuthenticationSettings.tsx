import { MynauiApi } from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import { postResetApiKey } from '@/services/rest/usersettings';
import { useModel } from '@@/exports';
import { InfoCircleFilled, WarningOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Popover,
  Typography,
  Row,
  Col,
  Flex,
} from 'antd';
import React, { useState } from 'react';

const AuthenticationSettings: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [apiKey, setApiKey] = useState(currentUser?.settings.apiKey);

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
            title={'API'}
            backgroundColor={TitleColors.API}
            icon={<MynauiApi />}
          />
        }
        style={{ marginTop: 16 }}
      >
        <Flex vertical gap={32} style={{ width: '100%' }}>
          <Row
            justify="space-between"
            align="middle"
            gutter={[16, 16]}
            style={{ width: '100%' }}
          >
            <Col xs={24} md={4}>
              <Typography.Text>
                <Popover
                  content={
                    'The API key is used for programmatic access such as agent or direct REST API'
                  }
                >
                  <InfoCircleFilled />
                </Popover>{' '}
                API KEY
              </Typography.Text>
            </Col>
            <Col xs={24} md={4}>
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
                block
              >
                Copy
              </Button>
            </Col>
            <Col xs={24} md={12}>
              <Input value={apiKey} disabled style={{ width: '100%' }} />
            </Col>
            <Col xs={24} md={4}>
              <Popconfirm
                title="Reset your API key"
                description={
                  <>
                    Are you sure to delete your API key? <br />
                    This will potentially disable all your agents running on
                    other devices
                  </>
                }
                icon={<WarningOutlined style={{ color: 'red' }} />}
                onConfirm={onClickResetApiKey}
                okText="Yes"
                cancelText="No"
              >
                <Button danger block>
                  Reset
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        </Flex>
      </Card>
    </Card>
  );
};

export default AuthenticationSettings;
