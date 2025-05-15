import SystemInformationView, {
  DetailInfo,
} from '@/components/DeviceComponents/DeviceInformation/components/SystemInformationView';
import { FlatPlatform, Wifi } from '@/components/Icons/CustomIcons';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';
import { ACCENT_COLORS } from '../../../../styles/colors';

type WifiTabProps = {
  device: API.DeviceItem;
};

const WifiTab: React.FC<WifiTabProps> = ({ device }) => {
  const [selectedInterface, setSelectedInterface] = React.useState(
    device?.systemInformation?.wifi?.[0] !== undefined ? 0 : undefined,
  );
  const [detailedInfo, setDetailedInfo] = React.useState<DetailInfo[]>([]);

  // Detailed info with associated icons
  const importantInfo = [];
  importantInfo.push({
    title: 'Wifi',
    value: '',
    icon: <Wifi />,
  });
  useEffect(() => {
    if (device?.systemInformation?.wifi && selectedInterface !== undefined) {
      const _detailedInfo = [];
      if (device?.systemInformation?.wifi[selectedInterface]?.iface) {
        _detailedInfo.push({
          key: 'Iface',
          value: `${device?.systemInformation?.wifi[selectedInterface]?.iface}`,
          icon: <FlatPlatform />,
        });
      }
      if (device?.systemInformation?.wifi[selectedInterface]?.model) {
        _detailedInfo.push({
          key: 'Model',
          value: `${device?.systemInformation?.wifi[selectedInterface]?.model}`,
          icon: <FlatPlatform />,
        });
      }
      if (device?.systemInformation?.wifi[selectedInterface]?.vendor) {
        _detailedInfo.push({
          key: 'Vendor',
          value: `${device?.systemInformation?.wifi[selectedInterface]?.vendor}`,
          icon: <FlatPlatform />,
        });
      }
      if (device?.systemInformation?.wifi[selectedInterface]?.mac) {
        _detailedInfo.push({
          key: 'Mac',
          value: `${device?.systemInformation?.wifi[selectedInterface]?.mac}`,
          icon: <FlatPlatform />,
        });
      }
      const coloredDetailedInfo = _detailedInfo.map((item, idx) => ({
        ...item,
        color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
      }));
      setDetailedInfo(coloredDetailedInfo);
    }
  }, [selectedInterface]);

  return (
    <SystemInformationView
      name={'WiFi'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
      selectedInterface={selectedInterface}
      setSelectedInterface={setSelectedInterface}
      options={device?.systemInformation?.wifi?.map((e, index) => {
        return {
          label: `${e.iface} (${e.model})`,
          value: index,
        };
      })}
      lastUpdatedAt={
        device.systemInformation.wifi?.[selectedInterface]?.lastUpdatedAt
      }
    />
  );
};

export default WifiTab;
