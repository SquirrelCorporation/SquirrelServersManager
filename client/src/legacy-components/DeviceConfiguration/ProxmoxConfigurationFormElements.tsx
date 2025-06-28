import CapabilityCard from '@/components/DeviceConfiguration/capability/CapabilityCard';
import ProxmoxConnectionCard from '@/components/DeviceConfiguration/proxmox/ProxmoxConnectionCard';
import ProxmoxWatcherCronsCard from '@/components/DeviceConfiguration/proxmox/ProxmoxWatcherCronsCard';
import { postDeviceCapabilities } from '@/services/rest/devices/devices';
import { ProFormInstance } from '@ant-design/pro-components';
import message from '@/components/Message/DynamicMessage';
import React from 'react';
import 'react-js-cron/dist/styles.css';
import { API } from 'ssm-shared-lib';

export type ProxmoxConfigurationFormElementsProps = {
  device: Partial<API.DeviceItem>;
  formRef: React.MutableRefObject<ProFormInstance | undefined>;
};

const ProxmoxConfigurationFormElements: React.FC<
  ProxmoxConfigurationFormElementsProps
> = ({ device, formRef }) => {
  const handleOnChangeCapability = async (checked: boolean) => {
    if (!device.uuid || !device.capabilities?.containers) return;
    await postDeviceCapabilities(device.uuid, {
      containers: {
        ...device.capabilities?.containers,
        proxmox: {
          enabled: checked,
        },
      },
    }).catch((error) => {
      message.error({
        content: `Configuration update failed (${error.message})`,
        duration: 6,
      });
    });
  };
  return (
    <>
      <CapabilityCard
        initialValue={
          device.capabilities?.containers?.proxmox?.enabled || false
        }
        onChange={handleOnChangeCapability}
      />
      <ProxmoxConnectionCard formRef={formRef} />
      <ProxmoxWatcherCronsCard device={device} />
    </>
  );
};

export default ProxmoxConfigurationFormElements;
