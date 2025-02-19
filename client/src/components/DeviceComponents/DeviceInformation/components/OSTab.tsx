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
  const detailedInfo = [];
  if (device?.systemInformation?.os?.platform) {
    detailedInfo.push({
      key: 'Platform',
      value: (
        <>
          {capitalizeFirstLetter(device.systemInformation.os.platform)}{' '}
          <Avatar src={OsLogo(device.systemInformation.os.platform)} />
        </>
      ),
      icon: <FlatPlatform />,
      color: '#979347',
    });
  }
  if (device?.systemInformation?.os?.arch) {
    detailedInfo.push({
      key: 'Arch',
      value: `${device.systemInformation.os.arch}`,
      icon: <GrommetIconsSystem />,
      color: '#252987',
    });
  }
  if (device?.systemInformation?.os?.distro) {
    detailedInfo.push({
      key: 'Distro',
      value: `${device.systemInformation.os.distro}`,
      color: '#874725',
      icon: <GrommetIconsSystem />,
    });
  }
  if (device?.systemInformation?.os?.codename) {
    detailedInfo.push({
      key: 'Codename',
      value: `${device.systemInformation.os.codename}`,
      icon: <Version />,
      color: '#8e165e',
    });
  }
  if (device?.systemInformation?.os?.codepage) {
    detailedInfo.push({
      key: 'Codepage',
      value: `${device.systemInformation.os.codepage}`,
      icon: <Binary />,
      color: '#288725',
    });
  }
  if (device?.systemInformation?.os?.serial) {
    detailedInfo.push({
      key: 'Serial',
      value: `${device.systemInformation.os.serial}`,
      icon: <Number />,
      color: '#1e2e4c',
    });
  }
  if (device?.systemInformation?.os?.uefi !== undefined) {
    detailedInfo.push({
      key: 'UEFI',
      value: `${device.systemInformation.os.uefi}`,
      icon: <BoltCircleOutline />,
      color: '#272729',
    });
  }
  return (
    <SystemInformationView
      name={'Operating System'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
    />
  );
};

export default OSTab;
