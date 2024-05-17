import { PajamasLog } from '@/components/Icons/CustomIcons';
import Title, { SettingsSubTitleColors } from '@/components/Template/Title';
import {
  deleteAnsibleLogs,
  deleteServerLogs,
  postRestartServer,
} from '@/services/rest/settings';
import {
  InfoCircleFilled,
  RedoOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button, Card, Flex, Popover, Space, Typography } from 'antd';
import { DeleteOutline } from 'antd-mobile-icons';
import React from 'react';

const AdvancedSettings: React.FC = () => {
  return (
    <Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Logs Retention'}
            backgroundColor={SettingsSubTitleColors.LOGS_RETENTION}
            icon={<PajamasLog />}
          />
        }
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'Purge servers logs'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Server logs
            </Typography>{' '}
            <Button
              danger
              icon={<DeleteOutline />}
              onClick={async () => await deleteServerLogs()}
            >
              Purge
            </Button>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'Purge the Ansible task & statuses logs'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Ansible tasks & statuses
            </Typography>{' '}
            <Button
              danger
              icon={<DeleteOutline />}
              onClick={async () => await deleteAnsibleLogs()}
            >
              Purge
            </Button>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
        </Flex>
      </Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Server'}
            backgroundColor={SettingsSubTitleColors.DEVICES}
            icon={<TableOutlined />}
          />
        }
        style={{ marginTop: 16 }}
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'Restart the underlying server'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Restart Server
            </Typography>{' '}
            <Button
              danger
              icon={<RedoOutlined />}
              onClick={async () => await postRestartServer()}
            >
              Restart
            </Button>
            <Space.Compact style={{ width: 'auto' }} />
          </Space>
        </Flex>
      </Card>
    </Card>
  );
};

export default AdvancedSettings;
