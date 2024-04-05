import { CPULogo } from '@/components/DeviceComponents/CPULogo';
import { OsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import Avatar from 'antd/es/avatar/avatar';
import React from 'react';
import { DeviceItem } from 'ssm-shared-lib/distribution/types/api';

type DeviceLogosProps = {
  device?: DeviceItem;
};

const DeviceLogos: React.FC<DeviceLogosProps> = (props: DeviceLogosProps) => (
  <>
    {props?.device?.osLogoFile && (
      <Avatar
        src={
          <img
            src={OsLogo(props.device?.osLogoFile)}
            alt={props.device?.osLogoFile}
          />
        }
      />
    )}
    {props?.device?.cpuBrand && (
      <CPULogo cpuBrand={props.device.cpuBrand} osArch={props.device.osArch} />
    )}
  </>
);

export default DeviceLogos;
