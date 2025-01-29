import SystemInformationView, {
  DetailInfo,
} from '@/components/DeviceComponents/Device/components/SystemInformationView';
import {
  FileSystem,
  FlatPlatform,
  InterfaceArrowsNetwork,
  Nametag,
  Number,
  PciCard,
  Size,
} from '@/components/Icons/CustomIcons';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';

type FilesystemsTabProps = {
  device: API.DeviceItem;
};

const FilesystemsTab: React.FC<FilesystemsTabProps> = ({ device }) => {
  const [selectedInterface, setSelectedInterface] = React.useState(
    device?.systemInformation?.fileSystems?.[0] !== undefined ? 0 : undefined,
  );
  const [detailedInfo, setDetailedInfo] = React.useState<DetailInfo[]>([]);

  const importantInfo = [];
  if (
    device?.systemInformation?.fileSystems &&
    device?.systemInformation?.fileSystems.length > 0
  ) {
    const totalDiskSpace = device.systemInformation.fileSystems.reduce(
      (acc: any, disk: { size: any }) => acc + disk.size,
      0,
    );
    importantInfo.push({
      key: 'Disk Space',
      title: 'Disk Space',
      value: `~${Math.ceil(totalDiskSpace / (1024 * 1024 * 1024))} GB`,
      icon: <FileSystem />,
      color: '#406471',
    });
  }
  // Detailed info with associated icons

  useEffect(() => {
    if (
      device?.systemInformation?.fileSystems &&
      selectedInterface !== undefined
    ) {
      const _detailedInfo = [];
      if (device?.systemInformation?.fileSystems[selectedInterface]?.name) {
        _detailedInfo.push({
          key: 'Name',
          value: `${device?.systemInformation?.fileSystems[selectedInterface]?.name}`,
          icon: <Nametag />,
          color: '#518523',
        });
      }
      if (device?.systemInformation?.fileSystems[selectedInterface]?.type) {
        _detailedInfo.push({
          key: 'Type',
          value: `${device?.systemInformation?.fileSystems[selectedInterface]?.type}`,
          icon: <InterfaceArrowsNetwork />,
          color: '#1b2547',
        });
      }
      if (device?.systemInformation?.fileSystems[selectedInterface]?.device) {
        _detailedInfo.push({
          key: 'Device',
          value: `${device?.systemInformation?.fileSystems[selectedInterface]?.device}`,
          icon: <FlatPlatform />,
          color: '#1b2547',
        });
      }
      if (device?.systemInformation?.fileSystems[selectedInterface]?.size) {
        _detailedInfo.push({
          key: 'Size',
          value: `~${Math.ceil(device?.systemInformation?.fileSystems[selectedInterface]?.size / (1024 * 1024 * 1024))} GB`,
          icon: <Size />,
          color: '#df713e',
        });
      }
      if (
        device?.systemInformation?.fileSystems[selectedInterface]?.serialNum
      ) {
        _detailedInfo.push({
          key: 'Serial',
          value: `${device?.systemInformation?.fileSystems[selectedInterface]?.serialNum}`,
          icon: <Number />,
          color: '#1b672b',
        });
      }
      if (
        device?.systemInformation?.fileSystems[selectedInterface]?.interfaceType
      ) {
        _detailedInfo.push({
          key: 'Interface Type',
          value: `${device?.systemInformation?.fileSystems[selectedInterface]?.interfaceType}`,
          icon: <PciCard />,
          color: '#671b58',
        });
      }
      setDetailedInfo(_detailedInfo);
    }
  }, [selectedInterface]);

  return (
    <SystemInformationView
      name={'File Systems'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
      selectedInterface={selectedInterface}
      setSelectedInterface={setSelectedInterface}
      options={device?.systemInformation?.fileSystems?.map((e, index) => {
        return {
          label: `${e.type} ${e.device ? `(${e.device})` : ''}`,
          value: index,
        };
      })}
    />
  );
};

export default FilesystemsTab;
