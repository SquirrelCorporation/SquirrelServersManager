import SystemInformationView from '@/components/DeviceComponents/DeviceInformation/components/SystemInformationView';
import { FlatPlatform, WhhRam } from '@/components/Icons/CustomIcons';
import React from 'react';
import { API } from 'ssm-shared-lib';

type MemoryTabProps = {
  device: API.DeviceItem;
};

const MemoryTab: React.FC<MemoryTabProps> = ({ device }) => {
  const importantInfo = [];
  if (device?.systemInformation?.mem?.total) {
    importantInfo.push({
      title: 'Memory',
      value: `~${device.systemInformation.mem.total ? Math.ceil(device.systemInformation.mem.total / (1024 * 1024 * 1024)) : ''} Gb`,
      icon: <WhhRam style={{ fontSize: '24px', color: '#faad14' }} />,
    });
  }

  // Detailed info with associated icons
  const detailedInfo = [];
  if (device?.systemInformation?.mem?.swaptotal) {
    detailedInfo.push({
      key: 'Swap Total',
      value: `~${device.systemInformation.mem.swaptotal ? Math.ceil(device.systemInformation.mem.swaptotal / (1024 * 1024 * 1024)) : ''} Gb`,
      icon: <FlatPlatform />,
      color: 'rgba(12,23,232,0.5)',
    });
  }
  return (
    <SystemInformationView
      name={'Memory'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
    />
  );
};

export default MemoryTab;
