import {
  MaterialSymbolsDashboard,
  MynauiDangerTriangle,
  PajamasLog,
} from '@/components/Icons/CustomIcons';
import Title, { TitleColors } from '@/components/Template/Title';
import SystemPerformanceCard from '@/pages/Dashboard/Components/SystemPerformanceCard';
import {
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
        <Flex vertical gap={32} style={{ width: '100%' }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Typography.Text>
                <Popover content={'Keep servers logs for X days'}>
                  <InfoCircleFilled />
                </Popover>{' '}
                Server logs retention days
              </Typography.Text>
            </Col>
            <Col xs={24} sm={8}>
              <InputNumber
                min={1}
                max={60}
                defaultValue={serverLogsRetentionInDays || 0}
                suffix="day(s)"
                style={{ width: '100%' }}
                onChange={onChangeServerLogsRetention}
              />
            </Col>
          </Row>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Typography.Text>
                <Popover
                  content={
                    'Purge the Ansible task & statuses logs after X seconds'
                  }
                >
                  <InfoCircleFilled />
                </Popover>{' '}
                Ansible tasks & statuses retention in seconds
              </Typography.Text>
            </Col>
            <Col xs={24} sm={8}>
              <InputNumber
                min={1}
                max={7 * 60 * 24}
                defaultValue={ansibleCleanUpInSeconds || 0}
                suffix="second(s)"
                style={{ width: '100%' }}
                onChange={onChangeAnsibleCleanUp}
              />
            </Col>
          </Row>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Typography.Text>
                <Popover content={'Delete device statistics after X days'}>
                  <InfoCircleFilled />
                </Popover>{' '}
                Device statistics retention days
              </Typography.Text>
            </Col>
            <Col xs={24} sm={8}>
              <InputNumber
                min={1}
                defaultValue={deviceStatsRetentionInDays || 0}
                suffix="day(s)"
                style={{ width: '100%' }}
                onChange={onChangeDeviceStatsRetention}
              />
            </Col>
          </Row>
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
        <Flex vertical gap={32} style={{ width: '100%' }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Typography.Text>
                <Popover
                  content={
                    'Set the status of a device to offline after X minutes'
                  }
                >
                  <InfoCircleFilled />
                </Popover>{' '}
                Consider device offline after
              </Typography.Text>
            </Col>
            <Col xs={24} sm={8}>
              <InputNumber
                min={1}
                max={60}
                defaultValue={considerDeviceOnlineInMinutes || 0}
                suffix="minute(s)"
                style={{ width: '100%' }}
                onChange={onChangeConsiderDeviceOnline}
              />
            </Col>
          </Row>
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
        <Flex vertical gap={32} style={{ width: '100%' }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Typography.Text>
                <Popover content={<SystemPerformanceCard />}>
                  <InfoCircleFilled />
                </Popover>{' '}
                System is healthy when average CPU percentage is bellow{' '}
              </Typography.Text>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Slider
                min={1}
                max={100}
                onChange={(newValue) => setDashboardMaxCpuInPercent(newValue)}
                onChangeComplete={onChangeMaxCpu}
                value={dashboardMaxCpuInPercent || 0}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <InputNumber
                min={1}
                max={100}
                value={dashboardMaxCpuInPercent}
                onChange={onChangeMaxCpu}
                suffix={'%'}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Typography.Text>
                <Popover content={<SystemPerformanceCard />}>
                  <InfoCircleFilled />
                </Popover>{' '}
                System is healthy when average free memory above{' '}
              </Typography.Text>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Slider
                min={1}
                max={100}
                onChange={(newValue) => setDashboardMinMemInPercent(newValue)}
                onChangeComplete={onChangeMinMem}
                value={dashboardMinMemInPercent || 0}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <InputNumber
                min={1}
                max={100}
                style={{ width: '100%' }}
                value={dashboardMinMemInPercent}
                suffix="%"
                onChange={onChangeMinMem}
              />
            </Col>
          </Row>
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
        <Flex vertical gap={32} style={{ width: '100%' }}>
          <Row justify="center" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Popconfirm
                title="Reset general settings"
                description="Are you sure to reset all the general settings back to default?"
                onConfirm={confirmReset}
                okText="Yes"
                cancelText="No"
                icon={<WarningOutlined style={{ color: 'red' }} />}
              >
                <Button danger block>
                  <InfoCircleFilled /> Reset settings to default
                </Button>
              </Popconfirm>
            </Col>
          </Row>
        </Flex>
      </Card>
    </Card>
  );
};

export default GeneralSettings;
