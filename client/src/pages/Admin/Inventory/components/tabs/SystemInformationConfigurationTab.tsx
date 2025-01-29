import { CardHeader } from '@/components/Template/CardHeader';
import { updateDeviceSystemInformationConfiguration } from '@/services/rest/device';
import { capitalizeFirstLetter } from '@/utils/strings';
import { FieldTimeOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormSelect,
  ProFormSwitch,
} from '@ant-design/pro-components';
import { Card, message } from 'antd';
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
      >
        <ProForm.Group>
          <ProFormSelect
            name={'feature'}
            label={'Feature'}
            options={options}
            initialValue={selectedFeature}
            onChange={(value: string) => setSelectedFeature(value)}
          />

          <ProFormSwitch
            label={'Enabled'}
            labelAlign={'left'}
            name={`switch`}
            fieldProps={{
              size: 'small',
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
