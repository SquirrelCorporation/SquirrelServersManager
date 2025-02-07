import { CPULogoSrc } from '@/components/DeviceComponents/CPULogo';
import SystemInformationView from '@/components/DeviceComponents/DeviceInformation/components/SystemInformationView';
import {
  Cached,
  Family,
  FlagOutline,
  FlatPlatform,
  Speedometer,
  SpeedometerSlow,
  VmOutline,
  WhhCpu,
} from '@/components/Icons/CustomIcons';
import { capitalizeFirstLetter } from '@/utils/strings';
import { Typography } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type CPUTabProps = {
  device: API.DeviceItem;
};

const CPUTab: React.FC<CPUTabProps> = ({ device }) => {
  const importantInfo = [];
  if (device?.systemInformation?.cpu?.speed) {
    importantInfo.push({
      title: 'CPU',
      value: `${device.systemInformation.cpu.brand ?? ''} ${device.systemInformation.cpu.speed ? device.systemInformation.cpu.speed + 'GHz' : ''}`,
      icon: <WhhCpu style={{ fontSize: '24px', color: '#faad14' }} />,
      secondaryIcon: CPULogoSrc(
        device.systemInformation.cpu.brand,
        device.systemInformation?.os?.arch,
      ),
    });
  } else if (device?.systemInformation?.cpu?.manufacturer) {
    importantInfo.push({
      title: 'Manufacturer',
      value: `${device.systemInformation.cpu.manufacturer}`,
      icon: <WhhCpu style={{ fontSize: '24px', color: '#faad14' }} />,
      secondaryIcon: CPULogoSrc(device.systemInformation.cpu.vendor),
    });
  }

  // Detailed info with associated icons
  const detailedInfo = [];

  if (device?.systemInformation?.cpu?.vendor) {
    detailedInfo.push({
      key: 'Vendor',
      value: `${capitalizeFirstLetter(device.systemInformation.cpu.vendor)}`,
      icon: <FlatPlatform />,
      color: 'rgba(19,19,19,0.5)',
    });
  }
  if (device?.systemInformation?.cpu?.family) {
    detailedInfo.push({
      key: 'Family',
      value: `${capitalizeFirstLetter(device.systemInformation.cpu.family)}`,
      icon: <Family />,
      color: '#774797',
    });
  }
  if (device?.systemInformation?.cpu?.model) {
    detailedInfo.push({
      key: 'Model',
      value: `${capitalizeFirstLetter(device.systemInformation.cpu.model)}`,
      icon: <FlatPlatform />,
      color: '#979347',
    });
  }
  if (device?.systemInformation?.cpu?.speedMax) {
    detailedInfo.push({
      key: 'Max Speed',
      value: `${device.systemInformation.cpu.speedMax}`,
      icon: <Speedometer />,
      color: '#c81519',
    });
  }
  if (device?.systemInformation?.cpu?.speedMin) {
    detailedInfo.push({
      key: 'Min Speed',
      value: `${device.systemInformation.cpu.speedMin}`,
      icon: <SpeedometerSlow />,
      color: '#6bb157',
    });
  }
  if (device?.systemInformation?.cpu?.flags) {
    detailedInfo.push({
      key: 'Flags',
      value: (
        <Typography.Text
          ellipsis={{ tooltip: device.systemInformation.cpu.flags }}
          style={{ maxWidth: 400 }}
        >
          {device.systemInformation.cpu.flags}
        </Typography.Text>
      ),
      icon: <FlagOutline />,
      color: '#5a21aa',
    });
  }
  if (device?.systemInformation?.cpu?.virtualization !== undefined) {
    detailedInfo.push({
      key: 'Virtualization',
      value: `${device.systemInformation.cpu.virtualization}`,
      icon: <VmOutline />,
      color: '#47977b',
    });
  }
  if (device?.systemInformation?.cpu?.cache) {
    const cacheInfo = Object.entries(device.systemInformation.cpu.cache)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}:${value}`)
      .join(', ');
    detailedInfo.push({
      key: 'Cache',
      value: `${cacheInfo}`,
      icon: <Cached />,
      color: '#884b08',
    });
  }
  return (
    <SystemInformationView
      name={'CPU'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
    />
  );
};

export default CPUTab;
