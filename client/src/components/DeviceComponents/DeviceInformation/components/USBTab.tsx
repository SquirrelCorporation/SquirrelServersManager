import SystemInformationView, {
  DetailInfo,
} from '@/components/DeviceComponents/DeviceInformation/components/SystemInformationView';
import {
  FlatPlatform,
  HardwareCircuit,
  InterfaceArrowsNetwork,
  Nametag,
  Number,
  Speedometer,
  Usb,
} from '@/components/Icons/CustomIcons';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';
import { ACCENT_COLORS } from '../../../../styles/colors';

type USBTabProps = {
  device: API.DeviceItem;
};

const USBTab: React.FC<USBTabProps> = ({ device }) => {
  const [selectedInterface, setSelectedInterface] = React.useState(
    device?.systemInformation?.wifi?.[0] !== undefined ? 0 : undefined,
  );
  const [detailedInfo, setDetailedInfo] = React.useState<DetailInfo[]>([]);

  // Detailed info with associated icons
  const importantInfo = [];
  importantInfo.push({
    title: 'USB',
    value: '',
    icon: <Usb />,
  });
  useEffect(() => {
    if (device?.systemInformation?.usb && selectedInterface !== undefined) {
      const _detailedInfo = [];
      if (device?.systemInformation?.usb[selectedInterface]?.id) {
        _detailedInfo.push({
          key: 'ID',
          value: `${device?.systemInformation?.usb[selectedInterface]?.id}`,
          icon: <FlatPlatform />,
        });
      }
      if (device?.systemInformation?.usb[selectedInterface]?.name) {
        _detailedInfo.push({
          key: 'Name',
          value: `${device?.systemInformation?.usb[selectedInterface]?.name}`,
          icon: <Nametag />,
        });
      }
      if (device?.systemInformation?.usb[selectedInterface]?.type) {
        _detailedInfo.push({
          key: 'Type',
          value: `${device?.systemInformation?.usb[selectedInterface]?.type}`,
          icon: <InterfaceArrowsNetwork />,
        });
      }
      if (device?.systemInformation?.usb[selectedInterface]?.vendor) {
        _detailedInfo.push({
          key: 'Vendor',
          value: `${device?.systemInformation?.usb[selectedInterface]?.vendor}`,
          icon: <FlatPlatform />,
        });
      }
      if (device?.systemInformation?.usb[selectedInterface]?.manufacturer) {
        _detailedInfo.push({
          key: 'Manufacturer',
          value: `${device?.systemInformation?.usb[selectedInterface]?.manufacturer}`,
          icon: <HardwareCircuit />,
        });
      }
      if (device?.systemInformation?.usb[selectedInterface]?.maxPower) {
        _detailedInfo.push({
          key: 'Max Power',
          value: `${device?.systemInformation?.usb[selectedInterface]?.maxPower}`,
          icon: <Speedometer />,
        });
      }
      if (device?.systemInformation?.usb[selectedInterface]?.serialNumber) {
        _detailedInfo.push({
          key: 'Serial',
          value: `${device?.systemInformation?.usb[selectedInterface]?.serialNumber}`,
          icon: <Number />,
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
      name={'USB'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
      selectedInterface={selectedInterface}
      setSelectedInterface={setSelectedInterface}
      options={device?.systemInformation?.usb?.map((e, index) => ({
        label: `${e.name} (${e.bus})`,
        value: index,
      }))}
    />
  );
};

export default USBTab;
