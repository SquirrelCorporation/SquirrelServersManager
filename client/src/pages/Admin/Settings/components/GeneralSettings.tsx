import {
  MaterialSymbolsDashboard,
  MynauiDangerTriangle,
  PajamasLog,
} from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import SystemPerformanceCard from '@/pages/Dashboard/Components/SystemPerformanceCard';
import {
  postContainerStatsSettings,
  postDashboardSetting,
  postDeviceSetting,
  postDeviceStatsSettings,
  postLogsSetting,
  postResetSettings,
} from '@/services/rest/settings';
import { useModel } from '@@/exports';
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
import { SettingsKeys } from 'ssm-shared-lib';

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
  const [containerStatsRetentionInDays, setContainerStatsRetentionInDays] =
    useState<number | null>(
      currentUser?.settings.stats.containerStatsRetention,
    );
  const [deviceStatsRetentionInDays, setDeviceStatsRetentionInDays] = useState<
    number | null
  >(currentUser?.settings.stats.deviceStatsRetention);
  const onChangeMaxCpu = async (newValue: number | null) => {
    if (newValue) {
      await postDashboardSetting(
        SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
        newValue,
      ).then(() => {
        setDashboardMaxCpuInPercent(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };

  const onChangeMinMem = async (newValue: number | null) => {
    if (newValue) {
      await postDashboardSetting(
        SettingsKeys.GeneralSettingsKeys
          .CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
        newValue,
      ).then(() => {
        setDashboardMinMemInPercent(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };

  const onChangeConsiderDeviceOnline = async (newValue: number | null) => {
    if (newValue) {
      await postDeviceSetting(
        SettingsKeys.GeneralSettingsKeys
          .CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
        newValue,
      ).then(() => {
        setConsiderDeviceOnlineInMinutes(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };

  const onChangeAnsibleCleanUp = async (newValue: number | null) => {
    if (newValue) {
      await postLogsSetting(
        SettingsKeys.GeneralSettingsKeys
          .CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
        newValue,
      ).then(() => {
        setAnsibleCleanUpInSeconds(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };
  const onChangeServerLogsRetention = async (newValue: number | null) => {
    if (newValue) {
      await postLogsSetting(
        SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
        newValue,
      ).then(() => {
        setServerLogsRetentionInDays(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };

  const onChangeRegisterDeviceStatEvery = async (newValue: number | null) => {
    if (newValue) {
      await postDeviceSetting(
        SettingsKeys.GeneralSettingsKeys.REGISTER_DEVICE_STAT_EVERY_IN_SECONDS,
        newValue,
      ).then(() => {
        setRegisterDeviceStatEveryXSeconds(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };

  const confirmReset = async () => {
    await postResetSettings().then(() => {
      message.warning({ content: 'Settings have been reset', duration: 6 });
    });
  };

  const onChangeDeviceStatsRetention = async (newValue: number | null) => {
    if (newValue) {
      await postDeviceStatsSettings(
        SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS,
        newValue,
      ).then(() => {
        setDeviceStatsRetentionInDays(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };

  const onChangeContainerStatsRetention = async (newValue: number | null) => {
    if (newValue) {
      await postContainerStatsSettings(
        SettingsKeys.GeneralSettingsKeys.CONTAINER_STATS_RETENTION_IN_DAYS,
        newValue,
      ).then(() => {
        setContainerStatsRetentionInDays(newValue);
        message.success({
          content: 'Setting successfully updated',
          duration: 6,
        });
      });
    }
  };
  return (
    <Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Logs & Statistics Retention'}
            backgroundColor={TitleColors.LOGS_RETENTION}
            icon={<PajamasLog />}
          />
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
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'Delete device statistics after X days'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Device statistics retention days
            </Typography>{' '}
            <InputNumber
              min={1}
              defaultValue={
                typeof deviceStatsRetentionInDays === 'number'
                  ? deviceStatsRetentionInDays
                  : 0
              }
              suffix="day(s)"
              style={{ width: 'auto' }}
              onChange={onChangeDeviceStatsRetention}
            />
            <Space.Compact style={{ width: '100%' }} />
          </Space>
          <Space direction="horizontal" size="middle">
            <Typography>
              {' '}
              <Popover content={'Delete container statistics after X days'}>
                <InfoCircleFilled />
              </Popover>{' '}
              Container statistics retention days
            </Typography>{' '}
            <InputNumber
              min={1}
              defaultValue={
                typeof containerStatsRetentionInDays === 'number'
                  ? containerStatsRetentionInDays
                  : 0
              }
              suffix="day(s)"
              style={{ width: 'auto' }}
              onChange={onChangeContainerStatsRetention}
            />
            <Space.Compact style={{ width: '100%' }} />
          </Space>
        </Flex>
      </Card>
      <Card
        type="inner"
        title={
          <Title.SubTitle
            title={'Devices'}
            backgroundColor={TitleColors.DEVICES}
            icon={<TableOutlined />}
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
          <Title.SubTitle
            title={'Dashboard'}
            backgroundColor={TitleColors.DASHBOARD}
            icon={<MaterialSymbolsDashboard />}
          />
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
          <Title.SubTitle
            title={'Danger Zone'}
            backgroundColor={TitleColors.DANGER_ZONE}
            icon={<MynauiDangerTriangle />}
          />
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
                <Popover
                  content={'This will reset all your settings to default'}
                >
                  <InfoCircleFilled />
                </Popover>{' '}
                Reset settings to default{' '}
                <Button style={{ marginLeft: 10 }} danger>
                  Reset
                </Button>
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
