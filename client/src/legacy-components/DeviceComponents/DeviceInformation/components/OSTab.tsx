import SystemInformationView from '@/components/DeviceComponents/DeviceInformation/components/SystemInformationView';
import { OsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import {
  Binary,
  BoltCircleOutline,
  FlatPlatform,
  GrommetIconsSystem,
  Kernelsu,
  Nametag,
  Number,
  Version,
} from '@/components/Icons/CustomIcons';
import { capitalizeFirstLetter } from '@/utils/strings';
import { Avatar } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';
import { ACCENT_COLORS } from '../../../../styles/colors';

type OSTabProps = {
  device: API.DeviceItem;
};

const OSTab: React.FC<OSTabProps> = ({ device }) => {
  const importantInfo = [];
  if (device?.systemInformation?.os?.distro) {
    importantInfo.push({
      title: 'OS Version',
      value: `${device.systemInformation.os.distro ?? ''} ${device.systemInformation.os.release ?? ''} `,
      icon: (
        <GrommetIconsSystem style={{ fontSize: '24px', color: '#1890ff' }} />
      ),
      secondaryIcon: OsLogo(device.systemInformation.os.logofile),
    });
  }
  if (device?.systemInformation?.os?.kernel) {
    importantInfo.push({
      title: 'Kernel',
      value: `${device.systemInformation.os.kernel}`,
      icon: <Kernelsu style={{ fontSize: '24px', color: '#faad14' }} />,
    });
  }
  if (device?.systemInformation?.os?.fqdn) {
    importantInfo.push({
      title: 'FQDN',
      value: `${device.systemInformation.os.fqdn}`,
      icon: <Nametag style={{ fontSize: '24px', color: '#408c3c' }} />,
    });
  }
  // Detailed info with associated icons
  const rawDetailedInfo = [];
  if (device?.systemInformation?.os?.platform) {
    rawDetailedInfo.push({
      key: 'Platform',
      value: (
        <>
          {capitalizeFirstLetter(device.systemInformation.os.platform)}{' '}
          <Avatar src={OsLogo(device.systemInformation.os.platform)} />
        </>
      ),
      icon: <FlatPlatform />,
    });
  }
  if (device?.systemInformation?.os?.arch) {
    rawDetailedInfo.push({
      key: 'Arch',
      value: `${device.systemInformation.os.arch}`,
      icon: <GrommetIconsSystem />,
    });
  }
  if (device?.systemInformation?.os?.distro) {
    rawDetailedInfo.push({
      key: 'Distro',
      value: `${device.systemInformation.os.distro}`,
      icon: <GrommetIconsSystem />,
    });
  }
  if (device?.systemInformation?.os?.codename) {
    rawDetailedInfo.push({
      key: 'Codename',
      value: `${device.systemInformation.os.codename}`,
      icon: <Version />,
    });
  }
  if (device?.systemInformation?.os?.codepage) {
    rawDetailedInfo.push({
      key: 'Codepage',
      value: `${device.systemInformation.os.codepage}`,
      icon: <Binary />,
    });
  }
  if (device?.systemInformation?.os?.serial) {
    rawDetailedInfo.push({
      key: 'Serial',
      value: `${device.systemInformation.os.serial}`,
      icon: <Number />,
    });
  }
  if (device?.systemInformation?.os?.uefi !== undefined) {
    rawDetailedInfo.push({
      key: 'UEFI',
      value: `${device.systemInformation.os.uefi}`,
      icon: <BoltCircleOutline />,
    });
  }
  const detailedInfo = rawDetailedInfo.map((item, idx) => ({
    ...item,
    color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
  }));
  return (
    <SystemInformationView
      name={'OS'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
      lastUpdatedAt={device.systemInformation.os?.lastUpdatedAt}
    />
  );
};

export default OSTab;
