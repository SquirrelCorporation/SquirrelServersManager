import { CPULogo } from '@/components/DeviceComponents/CPULogo';
import { OsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import Avatar from 'antd/es/avatar/avatar';
import React from 'react';
import { API } from 'ssm-shared-lib';

type DeviceLogosProps = {
  device?: API.DeviceItem;
};

const DeviceLogos: React.FC<DeviceLogosProps> = ({ device }) => {
  const osLogoSrc = device?.osLogoFile ? OsLogo(device.osLogoFile) : null;
  const hasCpuLogo = device?.cpuBrand !== undefined;

  return (
    <>
      {osLogoSrc && (
        <Avatar src={<img src={osLogoSrc} alt={device?.osLogoFile} />} />
      )}
      {hasCpuLogo && (
        <CPULogo cpuBrand={device.cpuBrand} osArch={device.osArch} />
      )}
    </>
  );
};

export default DeviceLogos;
