import SystemInformationView from '@/components/DeviceComponents/DeviceInformation/components/SystemInformationView';
import { FlatPlatform, WhhRam } from '@/components/Icons/CustomIcons';
import React from 'react';
import { API } from 'ssm-shared-lib';
import { ACCENT_COLORS } from '../../../../styles/colors';

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
  const rawDetailedInfo = [];
  if (device?.systemInformation?.mem?.swaptotal) {
    rawDetailedInfo.push({
      key: 'Swap Total',
      value: `~${device.systemInformation.mem.swaptotal ? Math.ceil(device.systemInformation.mem.swaptotal / (1024 * 1024 * 1024)) : ''} Gb`,
      icon: <FlatPlatform />,
    });
  }
  const detailedInfo = rawDetailedInfo.map((item, idx) => ({
    ...item,
    color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
  }));
  return (
    <SystemInformationView
      name={'Memory'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
    />
  );
};

export default MemoryTab;
