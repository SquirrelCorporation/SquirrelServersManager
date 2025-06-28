import {
  ElNetwork,
  FileSystem,
  GrommetIconsSystem,
  WhhCpu,
  WhhRam,
} from '@shared/ui/icons/categories/system';
import {
  HardwareCircuit,
  Usb,
  Version,
  Wifi,
} from '@shared/ui/icons/categories/ui';
import RemoteSystemInformationTerminal from '@/components/Terminal/RemoteSystemInformationTerminal';
import { CardHeader } from '@shared/ui/templates/CardHeader';
import { updateDeviceSystemInformationConfiguration } from '@/services/rest/devices/devices';
import { capitalizeFirstLetter } from '@/utils/strings';
import {
  BugOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  FieldTimeOutlined,
  InfoCircleFilled,
} from '@ant-design/icons';
import {
  ProForm,
  ProFormSelect,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { message } from '@shared/ui/feedback/DynamicMessage';
import { Avatar, Button, Card, Divider, Space, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import Cron from 'react-js-cron';
import { API } from 'ssm-shared-lib';
import AnimatedInfoText from '@/components/AnimatedInfoText';
import InfoLinkWidget from '@/components/Shared/InfoLinkWidget';

export type SystemInformationConfigurationTabProps = {
  device: Partial<API.DeviceItem>;
};

const SystemInformationConfigurationTab: React.FC<
  SystemInformationConfigurationTabProps
> = ({ device }) => {
  const options = Object.keys(device.configuration?.systemInformation || {})
    .sort((e: string, f: string) => e.localeCompare(f))
    .map((e) => ({ label: capitalizeFirstLetter(e), value: e }));
  const [selectedFeature, setSelectedFeature] = useState<string>(
    options?.[0]?.value,
  );
  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>();
  const [cron, setCron] = useState<string>('');
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<
    string | undefined
  >();

  useEffect(() => {
    if (device.configuration?.systemInformation) {
      setIsFeatureEnabled(
        device.configuration?.systemInformation?.[
          selectedFeature as keyof typeof device.configuration.systemInformation
        ]?.watch ?? false,
      );
      setCron(
        device.configuration?.systemInformation?.[
          selectedFeature as keyof typeof device.configuration.systemInformation
        ]?.cron ?? '',
      );
      const info =
        device.systemInformation?.[
          selectedFeature as keyof typeof device.systemInformation
        ];
      let updatedAt: string | undefined = undefined;
      if (Array.isArray(info)) {
        const firstWithLastUpdated = info.find(
          (el) =>
            el &&
            typeof el === 'object' &&
            'lastUpdatedAt' in el &&
            (el as any).lastUpdatedAt,
        );
        updatedAt = firstWithLastUpdated
          ? (firstWithLastUpdated as { lastUpdatedAt?: string }).lastUpdatedAt
          : undefined;
      } else if (info && typeof info === 'object' && 'lastUpdatedAt' in info) {
        updatedAt = (info as { lastUpdatedAt?: string }).lastUpdatedAt;
      }
      setLastUpdatedAt(updatedAt);
    }
  }, [selectedFeature]);

  const handleOnChangeCron = async (value: string) => {
    if (value !== cron) {
      setCron(value);
      await updateDeviceSystemInformationConfiguration(device.uuid as string, {
        [selectedFeature]: { watch: isFeatureEnabled, cron: value },
      }).then(() => {
        message.success({ content: 'Configuration updated', duration: 6 });
      });
    }
  };

  const handleOnChangeWatch = async (value: boolean) => {
    if (value !== isFeatureEnabled) {
      setIsFeatureEnabled(value);
      await updateDeviceSystemInformationConfiguration(device.uuid as string, {
        [selectedFeature]: { watch: value, cron: cron },
      }).then(() => {
        message.success({ content: 'Configuration updated', duration: 6 });
      });
    }
  };

  const getIcon = (value: string) => {
    switch (value.toLowerCase()) {
      case 'networkinterfaces':
        return <ElNetwork />;
      case 'system':
        return <HardwareCircuit />;
      case 'cpu':
        return <WhhCpu />;
      case 'mem':
        return <WhhRam />;
      case 'filesystems':
        return <FileSystem />;
      case 'wifi':
        return <Wifi />;
      case 'usb':
        return <Usb />;
      case 'os':
        return <GrommetIconsSystem />;
      case 'versions':
        return <Version />;
      default:
        return <ElNetwork />;
    }
  };

  return (
    <ProForm
      submitter={{
        render: () => {
          return <></>;
        },
      }}
    >
      <Card
        type="inner"
        title={
          <CardHeader
            title={'Watchers'}
            color={'#3c8036'}
            icon={<FieldTimeOutlined />}
          />
        }
        style={{ marginBottom: 10 }}
        styles={{
          header: { height: 55, minHeight: 55, paddingLeft: 15 },
          body: { paddingBottom: 0 },
        }}
        extra={
          <Space size={'middle'}>
            {lastUpdatedAt && (
              <>
                <AnimatedInfoText
                  text={`Last updated at: ${lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString() : 'never'}`}
                />
              </>
            )}
            <Tooltip
              title={`Last updated at: ${
                lastUpdatedAt
                  ? new Date(lastUpdatedAt).toLocaleString()
                  : 'never'
              }`}
            >
              <Avatar icon={<ClockCircleOutlined />} />
            </Tooltip>

            <InfoLinkWidget
              tooltipTitle="Remote system information are collected through SSH at regular intervals. You can configure the frequency for each collections."
              documentationLink="https://squirrelserversmanager.io/docs/user-guides/devices/configuration/system-information"
            />
          </Space>
        }
      >
        <ProForm.Group>
          <ProFormSelect
            name={'feature'}
            label={'Feature'}
            options={options}
            width={'sm'}
            initialValue={selectedFeature}
            onChange={(value: string) => setSelectedFeature(value)}
            fieldProps={{
              menuItemSelectedIcon: <CheckCircleFilled />,
              labelRender: (values) => (
                <Space>
                  <span role="img" aria-label={values.label as string}>
                    {getIcon(values.label as string)}{' '}
                  </span>
                  {values.label}
                </Space>
              ),
              optionRender: (option) => (
                <Space>
                  <span role="img" aria-label={option.data.label as string}>
                    {getIcon(option.data.label as string)}
                  </span>
                  {option.data.label}
                </Space>
              ),
            }}
          />

          <ProFormSwitch
            label={'Enabled'}
            labelAlign={'left'}
            name={`switch`}
            fieldProps={{
              value: isFeatureEnabled,
              onChange: (value) => handleOnChangeWatch(value),
            }}
          />

          <ProForm.Item labelAlign={'right'} label={`Cron (${cron})`}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Cron
                clearButton={false}
                value={cron}
                setValue={(value: string) => handleOnChangeCron(value)}
              />
              <div style={{ marginBottom: 8 }}>
                <small style={{ color: '#8c8c8c' }}>Quick suggestions:</small>
              </div>
              <Space wrap>
                <Button
                  size="small"
                  onClick={() => handleOnChangeCron('* * * * *')}
                >
                  Every minute
                </Button>
                <Button
                  size="small"
                  onClick={() => handleOnChangeCron('*/5 * * * *')}
                >
                  Every 5 minutes
                </Button>
                <Button
                  size="small"
                  onClick={() => handleOnChangeCron('*/10 * * * *')}
                >
                  Every 10 minutes
                </Button>
                <Button
                  size="small"
                  onClick={() => handleOnChangeCron('0 * * * *')}
                >
                  Every hour
                </Button>
                <Button
                  size="small"
                  onClick={() => handleOnChangeCron('0 0 * * *')}
                >
                  Daily
                </Button>
                <Button
                  size="small"
                  onClick={() => handleOnChangeCron('0 0 * * 0')}
                >
                  Weekly
                </Button>
                <Button
                  size="small"
                  onClick={() => handleOnChangeCron('0 0 1 * *')}
                >
                  Monthly
                </Button>
              </Space>
            </Space>
          </ProForm.Item>
        </ProForm.Group>
      </Card>
    </ProForm>
  );
};

export default SystemInformationConfigurationTab;
