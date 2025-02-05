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
  WhhRam,
} from '@/components/Icons/CustomIcons';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';

type USBTabProps = {
  device: API.DeviceItem;
};

const GraphicsTab: React.FC<USBTabProps> = ({ device }) => {
  const [selectedInterface, setSelectedInterface] = React.useState(
    device?.systemInformation?.graphics?.controllers?.[0] !== undefined
      ? 0
      : undefined,
  );
  const [detailedInfo, setDetailedInfo] = React.useState<DetailInfo[]>([]);

  // Detailed info with associated icons

  useEffect(() => {
    if (
      device?.systemInformation?.graphics &&
      selectedInterface !== undefined
    ) {
      const _detailedInfo = [];
      if (
        device?.systemInformation?.graphics?.controllers?.[selectedInterface]
          ?.name
      ) {
        _detailedInfo.push({
          key: 'Name',
          value: `${device?.systemInformation?.graphics?.controllers?.[selectedInterface]?.name}`,
          icon: <FlatPlatform />,
          color: '#518523',
        });
      }
      if (
        device?.systemInformation?.graphics?.controllers?.[selectedInterface]
          ?.model
      ) {
        _detailedInfo.push({
          key: 'Model',
          value: `${device?.systemInformation?.graphics?.controllers?.[selectedInterface]?.model}`,
          icon: <FlatPlatform />,
          color: '#854523',
        });
      }
      if (
        device?.systemInformation?.graphics?.controllers?.[selectedInterface]
          ?.vendor
      ) {
        _detailedInfo.push({
          key: 'Vendor',
          value: `${device?.systemInformation?.graphics?.controllers?.[selectedInterface]?.vendor}`,
          icon: <FlatPlatform />,
          color: '#518523',
        });
      }
      if (
        device?.systemInformation?.graphics?.controllers?.[selectedInterface]
          ?.bus
      ) {
        _detailedInfo.push({
          key: 'Bus',
          value: `${device?.systemInformation?.graphics?.controllers?.[selectedInterface]?.bus}`,
          icon: <FlatPlatform />,
          color: '#4b6750',
        });
      }
      if (
        device?.systemInformation?.graphics?.controllers?.[selectedInterface]
          ?.memoryTotal
      ) {
        _detailedInfo.push({
          key: 'Memory',
          value: `${device?.systemInformation?.graphics?.controllers?.[selectedInterface]?.memoryTotal}`,
          icon: <WhhRam />,
          color: '#42327e',
        });
      }
      if (
        device?.systemInformation?.graphics?.controllers?.[selectedInterface]
          ?.vram
      ) {
        _detailedInfo.push({
          key: 'Vram',
          value: `${device?.systemInformation?.graphics?.controllers?.[selectedInterface]?.vram}`,
          icon: <WhhRam />,
          color: '#20105c',
        });
      }
      setDetailedInfo(_detailedInfo);
    }
  }, [selectedInterface]);

  return (
    <SystemInformationView
      name={'Graphics'}
      detailedInfo={detailedInfo}
      selectedInterface={selectedInterface}
      setSelectedInterface={setSelectedInterface}
      options={device?.systemInformation?.graphics?.controllers?.map(
        (e, index) => ({
          label: `${e.name} (${e.model})`,
          value: index,
        }),
      )}
    />
  );
};

export default GraphicsTab;
