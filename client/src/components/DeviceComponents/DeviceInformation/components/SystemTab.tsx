import SystemInformationView from '@/components/DeviceComponents/DeviceInformation/components/SystemInformationView';
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
import { ACCENT_COLORS } from '../../../../styles/colors';

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
  const rawDetailedInfo = [];
  if (device?.systemInformation?.system?.model) {
    rawDetailedInfo.push({
      key: 'Model',
      value: `${capitalizeFirstLetter(device.systemInformation.system.model)}`,
      icon: <FlatPlatform />,
    });
  }
  if (device?.systemInformation?.system?.version) {
    rawDetailedInfo.push({
      key: 'Version',
      value: `${device.systemInformation.system.version}`,
      icon: <Version />,
    });
  }
  if (device?.systemInformation?.system?.serial) {
    rawDetailedInfo.push({
      key: 'Serial',
      value: `${device.systemInformation.system.serial}`,
      icon: <Number />,
    });
  }
  if (device?.systemInformation?.system?.raspberry?.manufacturer) {
    rawDetailedInfo.push({
      key: 'Raspberry Pi Manufacturer',
      value: `${device?.systemInformation?.system?.raspberry?.manufacturer}`,
      icon: <Raspberrypi />,
    });
  }
  if (device?.systemInformation?.system?.raspberry?.processor) {
    rawDetailedInfo.push({
      key: 'Raspberry Pi Processor',
      value: `${device?.systemInformation?.system?.raspberry?.processor}`,
      icon: <Raspberrypi />,
    });
  }
  if (device?.systemInformation?.system?.raspberry?.revision) {
    rawDetailedInfo.push({
      key: 'Raspberry Pi Revision',
      value: `${device?.systemInformation?.system?.raspberry?.revision}`,
      icon: <Raspberrypi />,
    });
  }
  const detailedInfo = rawDetailedInfo.map((item, idx) => ({
    ...item,
    color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
  }));

  return (
    <SystemInformationView
      name={'System'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
      lastUpdatedAt={device.systemInformation.system?.lastUpdatedAt}
    />
  );
};

export default SystemTab;
