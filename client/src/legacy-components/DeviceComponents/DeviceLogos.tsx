import { CPULogo } from '@/components/DeviceComponents/CPULogo';
import { OsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import { Avatar } from 'antd';
import React from 'react';
import { API } from 'ssm-shared-lib';

type DeviceLogosProps = {
  device?: API.DeviceItem;
};

const DeviceLogos: React.FC<DeviceLogosProps> = ({ device }) => {
  const osLogoSrc = device?.systemInformation?.os?.logofile
    ? OsLogo(device?.systemInformation?.os?.logofile)
    : null;
  const hasCpuLogo = device?.systemInformation?.cpu?.brand !== undefined;

  return (
    <>
      {osLogoSrc && (
        <Avatar
          src={
            <img
              src={osLogoSrc}
              alt={device?.systemInformation?.os?.logofile}
            />
          }
        />
      )}
      {hasCpuLogo && (
        <CPULogo
          cpuBrand={device?.systemInformation?.cpu?.brand}
          osArch={device?.systemInformation?.os?.arch}
        />
      )}
    </>
  );
};

export default DeviceLogos;
