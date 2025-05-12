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
import { ACCENT_COLORS } from '../../../../styles/colors';

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
  } else {
    importantInfo.push({
      title: 'CPU',
      value: '',
      icon: <WhhCpu style={{ fontSize: '24px', color: '#faad14' }} />,
    });
  }

  // Detailed info with associated icons
  const rawDetailedInfo = [];
  if (device?.systemInformation?.cpu?.vendor) {
    rawDetailedInfo.push({
      key: 'Vendor',
      value: `${capitalizeFirstLetter(device.systemInformation.cpu.vendor)}`,
      icon: <FlatPlatform />,
    });
  }
  if (device?.systemInformation?.cpu?.family) {
    rawDetailedInfo.push({
      key: 'Family',
      value: `${capitalizeFirstLetter(device.systemInformation.cpu.family)}`,
      icon: <Family />,
    });
  }
  if (device?.systemInformation?.cpu?.model) {
    rawDetailedInfo.push({
      key: 'Model',
      value: `${capitalizeFirstLetter(device.systemInformation.cpu.model)}`,
      icon: <FlatPlatform />,
    });
  }
  if (device?.systemInformation?.cpu?.speedMax) {
    rawDetailedInfo.push({
      key: 'Max Speed',
      value: `${device.systemInformation.cpu.speedMax}`,
      icon: <Speedometer />,
    });
  }
  if (device?.systemInformation?.cpu?.speedMin) {
    rawDetailedInfo.push({
      key: 'Min Speed',
      value: `${device.systemInformation.cpu.speedMin}`,
      icon: <SpeedometerSlow />,
    });
  }
  if (device?.systemInformation?.cpu?.flags) {
    rawDetailedInfo.push({
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
    });
  }
  if (device?.systemInformation?.cpu?.virtualization !== undefined) {
    rawDetailedInfo.push({
      key: 'Virtualization',
      value: `${device.systemInformation.cpu.virtualization}`,
      icon: <VmOutline />,
    });
  }
  if (device?.systemInformation?.cpu?.cache) {
    const cacheInfo = Object.entries(device.systemInformation.cpu.cache)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}:${value}`)
      .join(', ');
    rawDetailedInfo.push({
      key: 'Cache',
      value: `${cacheInfo}`,
      icon: <Cached />,
    });
  }
  const detailedInfo = rawDetailedInfo.map((item, idx) => ({
    ...item,
    color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
  }));
  return (
    <SystemInformationView
      name={'CPU'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
    />
  );
};

export default CPUTab;
