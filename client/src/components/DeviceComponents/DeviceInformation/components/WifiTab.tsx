import SystemInformationView, {
  DetailInfo,
} from '@/components/DeviceComponents/DeviceInformation/components/SystemInformationView';
import { FlatPlatform } from '@/components/Icons/CustomIcons';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';

type WifiTabProps = {
  device: API.DeviceItem;
};

const WifiTab: React.FC<WifiTabProps> = ({ device }) => {
  const [selectedInterface, setSelectedInterface] = React.useState(
    device?.systemInformation?.wifi?.[0] !== undefined ? 0 : undefined,
  );
  const [detailedInfo, setDetailedInfo] = React.useState<DetailInfo[]>([]);

  // Detailed info with associated icons

  useEffect(() => {
    if (device?.systemInformation?.wifi && selectedInterface !== undefined) {
      const _detailedInfo = [];
      if (device?.systemInformation?.wifi[selectedInterface]?.iface) {
        _detailedInfo.push({
          key: 'Iface',
          value: `${device?.systemInformation?.wifi[selectedInterface]?.iface}`,
          icon: <FlatPlatform />,
          color: '#518523',
        });
      }
      if (device?.systemInformation?.wifi[selectedInterface]?.model) {
        _detailedInfo.push({
          key: 'Model',
          value: `${device?.systemInformation?.wifi[selectedInterface]?.model}`,
          icon: <FlatPlatform />,
          color: '#1b2547',
        });
      }
      if (device?.systemInformation?.wifi[selectedInterface]?.vendor) {
        _detailedInfo.push({
          key: 'Vendor',
          value: `${device?.systemInformation?.wifi[selectedInterface]?.vendor}`,
          icon: <FlatPlatform />,
          color: '#1b2547',
        });
      }
      if (device?.systemInformation?.wifi[selectedInterface]?.mac) {
        _detailedInfo.push({
          key: 'Mac',
          value: `${device?.systemInformation?.wifi[selectedInterface]?.mac}`,
          icon: <FlatPlatform />,
          color: '#df713e',
        });
      }
      setDetailedInfo(_detailedInfo);
    }
  }, [selectedInterface]);

  return (
    <SystemInformationView
      name={'Wifi'}
      detailedInfo={detailedInfo}
      selectedInterface={selectedInterface}
      setSelectedInterface={setSelectedInterface}
      options={device?.systemInformation?.wifi?.map((e, index) => {
        return {
          label: `${e.iface} (${e.id})`,
          value: index,
        };
      })}
    />
  );
};

export default WifiTab;
