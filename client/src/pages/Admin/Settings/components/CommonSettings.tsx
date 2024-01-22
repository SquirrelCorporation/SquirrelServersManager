import { useModel } from '@@/exports';
import { KeyOutlined } from '@ant-design/icons';
import { Button, Flex, Input, message, Space, Typography } from 'antd';
import React from 'react';

const CommonSettings: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  return (
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
                  await navigator.clipboard.writeText(currentUser?.settings.apiKey);
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
          }
          }
          >
            Copy
          </Button>
          <Input defaultValue={currentUser?.settings.apiKey} disabled />
          <Button danger>Reset</Button>
        </Space.Compact>
      </Space>
    </Flex>
  );
};

export default CommonSettings;
