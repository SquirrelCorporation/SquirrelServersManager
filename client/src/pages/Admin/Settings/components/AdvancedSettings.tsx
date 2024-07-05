import {
  IonServer,
  MaterialSymbolsDashboard,
  PajamasLog,
} from '@/components/Icons/CustomIcons';
import Title, { SettingsSubTitleColors } from '@/components/Template/Title';
import {
  deleteAnsibleLogs,
  deleteContainerStats,
  deleteDeviceStats,
  deletePlaybooksAndResync,
  deleteServerLogs,
  postRestartServer,
} from '@/services/rest/settings';
import { BugFilled, InfoCircleFilled, RedoOutlined } from '@ant-design/icons';
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
            title={'Logs'}
            backgroundColor={SettingsSubTitleColors.LOGS_RETENTION}
            icon={<PajamasLog />}
          />
        }
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'Delete all servers logs from database'}>
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
              <Popover
                content={
                  'Delete all Ansible task & statuses logs from database'
                }
              >
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
        style={{ marginTop: 16 }}
        title={
          <Title.SubTitle
            title={'Statistics'}
            backgroundColor={SettingsSubTitleColors.DASHBOARD}
            icon={<MaterialSymbolsDashboard />}
          />
        }
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover
                content={
                  'Delete all device stats from database - Be aware that it can be long'
                }
              >
                <InfoCircleFilled />
              </Popover>{' '}
              Device Statistics
            </Typography>{' '}
            <Button
              danger
              icon={<DeleteOutline />}
              onClick={async () => await deleteDeviceStats()}
            >
              Purge
            </Button>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover
                content={
                  'Delete all the container stats from database - Be aware that it can be long'
                }
              >
                <InfoCircleFilled />
              </Popover>{' '}
              Container Stats
            </Typography>{' '}
            <Button
              danger
              icon={<DeleteOutline />}
              onClick={async () => await deleteContainerStats()}
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
            backgroundColor={SettingsSubTitleColors.SERVER}
            icon={<IonServer />}
          />
        }
        style={{ marginTop: 16 }}
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'Restart the underlying NodeJs server'}>
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
      <Card
        type="inner"
        style={{ marginTop: 16 }}
        title={
          <Title.SubTitle
            title={'Debug'}
            backgroundColor={SettingsSubTitleColors.DEBUG}
            icon={<BugFilled />}
          />
        }
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'Delete all playbooks and resync'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Playbooks
            </Typography>{' '}
            <Button
              danger
              icon={<DeleteOutline />}
              onClick={async () => await deletePlaybooksAndResync()}
            >
              Purge & Sync again
            </Button>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
        </Flex>
      </Card>
    </Card>
  );
};

export default AdvancedSettings;
