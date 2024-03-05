import {
  InfoCircleFilled,
  TableOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Flex,
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
import { useModel } from '@@/exports';
import {
  postDashboardSetting,
  postDeviceSetting,
  postLogsSetting,
  postResetSettings,
} from '@/services/rest/settings';
import SystemPerformanceCard from '@/pages/Dashboard/Components/SystemPerformanceCard';

export const PajamasLog = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 16 16"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.5 2.5v11h9v-11h-9ZM3 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3Zm5 10a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H8.75A.75.75 0 0 1 8 11Zm-2 1a1 1 0 1 0 0-2a1 1 0 0 0 0 2Zm2-4a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H8.75A.75.75 0 0 1 8 8ZM6 9a1 1 0 1 0 0-2a1 1 0 0 0 0 2Zm2-4a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H8.75A.75.75 0 0 1 8 5ZM6 6a1 1 0 1 0 0-2a1 1 0 0 0 0 2Z"
      clipRule="evenodd"
    />
  </svg>
);
export const MaterialSymbolsDashboard = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M13 9V3h8v6h-8ZM3 13V3h8v10H3Zm10 8V11h8v10h-8ZM3 21v-6h8v6H3Z"
    />
  </svg>
);
export const MynauiDangerTriangle = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M12 8.5V14m0 3.247v-.5m-6.02-5.985C8.608 5.587 9.92 3 12 3c2.08 0 3.393 2.587 6.02 7.762l.327.644c2.182 4.3 3.274 6.45 2.287 8.022C19.648 21 17.208 21 12.327 21h-.654c-4.88 0-7.321 0-8.307-1.572c-.987-1.572.105-3.722 2.287-8.022z"
    />
  </svg>
);

const GeneralSettings: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [dashboardMinMemInPercent, setDashboardMinMemInPercent] = useState<
    number | null
  >(currentUser?.settings.dashboard.performance.minMem);
  const [dashboardMaxCpuInPercent, setDashboardMaxCpuInPercent] = useState<
    number | null
  >(currentUser?.settings.dashboard.performance.maxCpu);
  const [considerDeviceOnlineInMinutes, setConsiderDeviceOnlineInMinutes] =
    useState<number | null>(currentUser?.settings.device.considerOffLineAfter);
  const [ansibleCleanUpInSeconds, setAnsibleCleanUpInSeconds] = useState<
    number | null
  >(currentUser?.settings.logs.ansibleRetention);
  const [serverLogsRetentionInDays, setServerLogsRetentionInDays] = useState<
    number | null
  >(currentUser?.settings.logs.serverRetention);
  const [registerDeviceStatEveryXSeconds, setRegisterDeviceStatEveryXSeconds] =
    useState<number | null>(
      currentUser?.settings.device.registerDeviceStatEvery,
    );
  const onChangeMaxCpu = async (newValue: number | null) => {
    if (newValue) {
      await postDashboardSetting(
        'consider-performance-good-cpu-if-greater',
        newValue,
      ).then(() => {
        setDashboardMaxCpuInPercent(newValue);
      });
      message.success({ content: 'Setting successfully updated', duration: 6 });
    }
  };

  const onChangeMinMem = async (newValue: number | null) => {
    if (newValue) {
      await postDashboardSetting(
        'consider-performance-good-mem-if-greater',
        newValue,
      ).then(() => {
        setDashboardMinMemInPercent(newValue);
      });
      message.success({ content: 'Setting successfully updated', duration: 6 });
    }
  };

  const onChangeConsiderDeviceOnline = async (newValue: number | null) => {
    if (newValue) {
      await postDeviceSetting(
        'consider-device-offline-after-in-minutes',
        newValue,
      ).then(() => {
        setConsiderDeviceOnlineInMinutes(newValue);
      });
      message.success({ content: 'Setting successfully updated', duration: 6 });
    }
  };

  const onChangeAnsibleCleanUp = async (newValue: number | null) => {
    if (newValue) {
      await postLogsSetting('clean-up-ansible', newValue).then(() => {
        setAnsibleCleanUpInSeconds(newValue);
      });
      message.success({ content: 'Setting successfully updated', duration: 6 });
    }
  };
  const onChangeServerLogsRetention = async (newValue: number | null) => {
    if (newValue) {
      await postLogsSetting('server-log-retention-in-days', newValue).then(
        () => {
          setServerLogsRetentionInDays(newValue);
        },
      );
      message.success({ content: 'Setting successfully updated', duration: 6 });
    }
  };

  const onChangeRegisterDeviceStatEvery = async (newValue: number | null) => {
    if (newValue) {
      await postDeviceSetting(
        'device-stat-frequency-in-seconds',
        newValue,
      ).then(() => {
        setRegisterDeviceStatEveryXSeconds(newValue);
      });
      message.success({ content: 'Setting successfully updated', duration: 6 });
    }
  };

  const confirmReset = async () => {
    await postResetSettings().then(() => {
      message.warning({ content: 'Settings have been reset', duration: 6 });
    });
  };
  return (
    <Card>
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <PajamasLog />
            </Col>
            <Col style={{ marginLeft: 3 }}>Logs Retention</Col>
          </Row>
        }
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'Keep servers logs for X days'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Server logs retention days
            </Typography>{' '}
            <InputNumber
              min={1}
              max={60}
              defaultValue={
                typeof serverLogsRetentionInDays === 'number'
                  ? serverLogsRetentionInDays
                  : 0
              }
              suffix="day(s)"
              style={{ width: 'auto' }}
              onChange={onChangeServerLogsRetention}
            />
            <Space.Compact style={{ width: '100%' }} />
          </Space>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover
                content={
                  'Purge the Ansible task & statuses logs after X seconds'
                }
              >
                <InfoCircleFilled />
              </Popover>{' '}
              Ansible tasks & statuses retention in seconds
            </Typography>{' '}
            <InputNumber
              min={1}
              max={7 * 60 * 24}
              defaultValue={
                typeof ansibleCleanUpInSeconds === 'number'
                  ? ansibleCleanUpInSeconds
                  : 0
              }
              suffix="second(s)"
              style={{ width: 'auto' }}
              onChange={onChangeAnsibleCleanUp}
            />
            <Space.Compact style={{ width: '100%' }} />
          </Space>
        </Flex>
      </Card>
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <TableOutlined style={{ width: 20, height: 20 }} />
            </Col>
            <Col style={{ marginLeft: 3 }}>Devices</Col>
          </Row>
        }
        style={{ marginTop: 16 }}
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover
                content={
                  'Set the status of a device to offline after X minutes'
                }
              >
                <InfoCircleFilled />
              </Popover>{' '}
              Consider device offline after
            </Typography>{' '}
            <InputNumber
              min={1}
              max={60}
              defaultValue={
                typeof considerDeviceOnlineInMinutes === 'number'
                  ? considerDeviceOnlineInMinutes
                  : 0
              }
              suffix="minute(s)"
              style={{ width: 'auto' }}
              onChange={onChangeConsiderDeviceOnline}
            />
            <Space.Compact style={{ width: 'auto' }} />
          </Space>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover
                content={
                  'Allow a device stat to be saved only when the latest is older than the settings, regardless of the frequency of the agent'
                }
              >
                <InfoCircleFilled />
              </Popover>{' '}
              Register device stats every
            </Typography>{' '}
            <InputNumber
              min={1}
              max={600}
              defaultValue={
                typeof registerDeviceStatEveryXSeconds === 'number'
                  ? registerDeviceStatEveryXSeconds
                  : 0
              }
              suffix="second(s)"
              style={{ width: 'auto' }}
              onChange={onChangeRegisterDeviceStatEvery}
            />
            <Space.Compact style={{ width: 'auto' }} />
          </Space>
        </Flex>
      </Card>
      <Card
        type="inner"
        title={
          <Row>
            <Col>
              <MaterialSymbolsDashboard />
            </Col>
            <Col style={{ marginLeft: 3 }}>Dashboard</Col>
          </Row>
        }
        style={{ marginTop: 16 }}
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Typography>
              <Popover content={<SystemPerformanceCard />}>
                <InfoCircleFilled />
              </Popover>{' '}
              System is healthy when average CPU percentage is bellow{' '}
            </Typography>{' '}
            <Row>
              <Col span={12}>
                <Slider
                  min={1}
                  max={100}
                  onChange={(newValue) => setDashboardMaxCpuInPercent(newValue)}
                  onChangeComplete={onChangeMaxCpu}
                  value={
                    typeof dashboardMaxCpuInPercent === 'number'
                      ? dashboardMaxCpuInPercent
                      : 0
                  }
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={1}
                  max={100}
                  style={{ margin: '0 16px' }}
                  value={dashboardMaxCpuInPercent}
                  onChange={onChangeMaxCpu}
                  suffix="%"
                />
              </Col>
            </Row>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
          <Space direction="horizontal" size="middle">
            <Typography>
              <Popover content={<SystemPerformanceCard />}>
                <InfoCircleFilled />
              </Popover>{' '}
              System is healthy when average free memory above{' '}
            </Typography>{' '}
            <Row>
              <Col span={12}>
                <Slider
                  min={1}
                  max={100}
                  onChange={(newValue) => setDashboardMinMemInPercent(newValue)}
                  onChangeComplete={onChangeMinMem}
                  value={
                    typeof dashboardMinMemInPercent === 'number'
                      ? dashboardMinMemInPercent
                      : 0
                  }
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={1}
                  max={100}
                  style={{ margin: '0 16px' }}
                  value={dashboardMinMemInPercent}
                  suffix="%"
                  onChange={onChangeMinMem}
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
              <MynauiDangerTriangle />
            </Col>
            <Col style={{ marginLeft: 3 }}>Danger</Col>
          </Row>
        }
        style={{ marginTop: 16 }}
      >
        <Flex vertical gap={32} style={{ width: '50%' }}>
          <Space direction="horizontal" size="middle">
            <Space.Compact style={{ width: 'auto' }} />
            <Popconfirm
              title="Reset general settings"
              description="Are you sure to reset all the general settings back to default?"
              onConfirm={confirmReset}
              okText="Yes"
              cancelText="No"
              icon={<WarningOutlined style={{ color: 'red' }} />}
            >
              <Typography>
                Reset to default <Button danger>Reset</Button>
              </Typography>
            </Popconfirm>
            <Space.Compact style={{ width: '100%' }} />
          </Space>
        </Flex>
      </Card>
    </Card>
  );
};

export default GeneralSettings;
