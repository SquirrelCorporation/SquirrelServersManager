import {
  ElNetwork,
  FileSystem,
  GrommetIconsSystem,
  HardwareCircuit,
  Usb,
  Version,
  WhhCpu,
  WhhRam,
  Wifi,
} from '@/components/Icons/CustomIcons';
import { CardHeader } from '@/components/Template/CardHeader';
import { updateDeviceSystemInformationConfiguration } from '@/services/rest/devices/devices';
import { capitalizeFirstLetter } from '@/utils/strings';
import {
  CheckCircleFilled,
  FieldTimeOutlined,
  InfoCircleFilled,
} from '@ant-design/icons';
import {
  ProForm,
  ProFormSelect,
  ProFormSwitch,
} from '@ant-design/pro-components';
import message from '@/components/Message/DynamicMessage';
import { Card, Space, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import Cron from 'react-js-cron';
import { API } from 'ssm-shared-lib';

export type SystemInformationConfigurationTabProps = {
  device: Partial<API.DeviceItem>;
};

const SystemInformationConfigurationTab: React.FC<
  SystemInformationConfigurationTabProps
> = ({ device }) => {
  const options = Object.keys(device.configuration?.systemInformation || {})
    .sort((e: string, f: string) => e.localeCompare(f))
    .map((e) => ({ label: capitalizeFirstLetter(e), value: e }));
  const [selectedFeature, setSelectedFeature] = React.useState<string>(
    options?.[0]?.value,
  );
  const [isFeatureEnabled, setIsFeatureEnabled] = React.useState<boolean>();
  const [cron, setCron] = React.useState<string>('');

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
          <Tooltip title="Remote system information are collected through SSH at regular intervals. You can configure the frequency for each collections.">
            <InfoCircleFilled />
          </Tooltip>
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
            <Cron
              clearButton={false}
              value={cron}
              setValue={(value: string) => handleOnChangeCron(value)}
            />
          </ProForm.Item>
        </ProForm.Group>
      </Card>
    </ProForm>
  );
};

export default SystemInformationConfigurationTab;
