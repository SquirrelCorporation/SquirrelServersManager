import { CPULogo } from '@/components/CPULogo/CPULogo';
import { OsLogo } from '@/components/OsLogo/OsLogo';
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
    {props?.device?.cpuBrand && <CPULogo cpuBrand={props.device.cpuBrand} />}
  </>
);

export default DeviceLogos;
