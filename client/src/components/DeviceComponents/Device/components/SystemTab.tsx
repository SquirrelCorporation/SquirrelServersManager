import SystemInformationView from '@/components/DeviceComponents/Device/components/SystemInformationView';
import { OsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import {
  FlatPlatform,
  HardwareCircuit,
  Number,
  Raspberrypi,
  Version,
} from '@/components/Icons/CustomIcons';
import { capitalizeFirstLetter } from '@/utils/strings';
import React from 'react';
import { API } from 'ssm-shared-lib';

type SystemTabProps = {
  device: API.DeviceItem;
};

const SystemTab: React.FC<SystemTabProps> = ({ device }) => {
  const importantInfo = [];
  if (device?.systemInformation?.system?.raspberry?.type) {
    importantInfo.push({
      title: 'Raspberry Pi',
      value: `${device.systemInformation.system.raspberry.type} `,
      secondaryIcon: OsLogo('raspbian'),
      icon: <Raspberrypi style={{ fontSize: '24px', color: '#bd0f0f' }} />,
    });
  }
  if (device?.systemInformation?.system?.manufacturer) {
    importantInfo.push({
      title: 'Manufacturer',
      value: `${device.systemInformation.system.manufacturer} `,
      icon: <HardwareCircuit style={{ fontSize: '24px', color: '#1890ff' }} />,
    });
  }

  // Detailed info with associated icons
  const detailedInfo = [];
  if (device?.systemInformation?.system?.model) {
    detailedInfo.push({
      key: 'Model',
      value: `${capitalizeFirstLetter(device.systemInformation.system.model)}`,
      icon: <FlatPlatform />,
      color: '#979347',
    });
  }
  if (device?.systemInformation?.system?.version) {
    detailedInfo.push({
      key: 'Version',
      value: `${device.systemInformation.system.version}`,
      icon: <Version />,
      color: '#252987',
    });
  }
  if (device?.systemInformation?.system?.serial) {
    detailedInfo.push({
      key: 'Serial',
      value: `${device.systemInformation.system.serial}`,
      icon: <Number />,
      color: '#1e2e4c',
    });
  }
  if (device?.systemInformation?.system?.raspberry?.manufacturer) {
    detailedInfo.push({
      key: 'Raspberry Pi Manufacturer',
      value: `${device?.systemInformation?.system?.raspberry?.manufacturer}`,
      icon: <Raspberrypi />,
      color: '#1e2e4c',
    });
  }
  if (device?.systemInformation?.system?.raspberry?.processor) {
    detailedInfo.push({
      key: 'Raspberry Pi Processor',
      value: `${device?.systemInformation?.system?.raspberry?.processor}`,
      icon: <Raspberrypi />,
      color: '#1e2e4c',
    });
  }
  if (device?.systemInformation?.system?.raspberry?.revision) {
    detailedInfo.push({
      key: 'Raspberry Pi Revision',
      value: `${device?.systemInformation?.system?.raspberry?.revision}`,
      icon: <Raspberrypi />,
      color: '#1e2e4c',
    });
  }

  return (
    <SystemInformationView
      name={'System'}
      detailedInfo={detailedInfo}
      importantInfo={importantInfo}
    />
  );
};

export default SystemTab;
