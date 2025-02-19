import SystemInformationView, {
  DetailInfo,
} from '@/components/DeviceComponents/DeviceInformation/components/SystemInformationView';
import {
  ElNetwork,
  FlatPlatform,
  InterfaceArrowsNetwork,
  Internal,
  Ip,
  State,
  SubsetProperOfBold,
  VirtualNetwork20Regular,
} from '@/components/Icons/CustomIcons';
import React, { useEffect } from 'react';
import { API } from 'ssm-shared-lib';

type NetworkInterfacesTabProps = {
  device: API.DeviceItem;
};

const NetworkInterfacesTab: React.FC<NetworkInterfacesTabProps> = ({
  device,
}) => {
  const [selectedInterface, setSelectedInterface] = React.useState(
    device?.systemInformation?.networkInterfaces?.findIndex((x) => x.default),
  );
  const [detailedInfo, setDetailedInfo] = React.useState<DetailInfo[]>([]);

  const importantInfo = [];
  if (
    device?.systemInformation?.networkInterfaces &&
    device?.systemInformation?.networkInterfaces.length > 0
  ) {
    const defaultInterface = device?.systemInformation?.networkInterfaces.find(
      (x) => x.default,
    );
    if (defaultInterface) {
      importantInfo.push({
        title: 'Default Network Interface',
        value: `${defaultInterface.ifaceName} ${defaultInterface.ip4 ? `(${defaultInterface.ip4})` : ''} `,
        icon: <ElNetwork style={{ fontSize: '24px', color: '#5891ed' }} />,
      });
    }
  }

  // Detailed info with associated icons

  useEffect(() => {
    if (
      device?.systemInformation?.networkInterfaces &&
      selectedInterface !== undefined
    ) {
      const _detailedInfo = [];
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]
          ?.ifaceName
      ) {
        _detailedInfo.push({
          key: 'Iface Name',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.ifaceName}`,
          icon: <FlatPlatform />,
          color: '#1b2547',
        });
      }
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]?.type
      ) {
        _detailedInfo.push({
          key: 'Type',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.type}`,
          icon: <InterfaceArrowsNetwork />,
          color: '#3c6e70',
        });
      }
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]
          ?.operstate
      ) {
        _detailedInfo.push({
          key: 'State',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.operstate}`,
          icon: <State />,
          color: '#673a70',
        });
      }
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]?.ip4
      ) {
        _detailedInfo.push({
          key: 'Ipv4',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.ip4}`,
          icon: <Ip />,
          color: '#479754',
        });
      }
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]
          ?.ip4subnet
      ) {
        _detailedInfo.push({
          key: 'Ipv4 Subnet',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.ip4subnet}`,
          icon: <SubsetProperOfBold />,
          color: '#850668',
        });
      }
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]?.ip6
      ) {
        _detailedInfo.push({
          key: 'Ipv6',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.ip6}`,
          icon: <Ip />,
          color: '#4c9747',
        });
      }
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]
          ?.ip6subnet
      ) {
        _detailedInfo.push({
          key: 'Ipv6 Subnet',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.ip6subnet}`,
          icon: <SubsetProperOfBold />,
          color: '#bc943a',
        });
      }
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]?.mac
      ) {
        _detailedInfo.push({
          key: 'Mac',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.mac}`,
          icon: <FlatPlatform />,
          color: '#1b5754',
        });
      }
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]
          ?.internal !== undefined
      ) {
        _detailedInfo.push({
          key: 'Internal',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.internal}`,
          icon: <Internal />,
          color: '#055c09',
        });
      }
      if (
        device?.systemInformation?.networkInterfaces[selectedInterface]
          ?.virtual !== undefined
      ) {
        _detailedInfo.push({
          key: 'Virtual',
          value: `${device?.systemInformation?.networkInterfaces[selectedInterface]?.virtual}`,
          icon: <VirtualNetwork20Regular />,
          color: '#979347',
        });
      }
      setDetailedInfo(_detailedInfo);
    }
  }, [selectedInterface]);

  return (
    <SystemInformationView
      name={'Network Interfaces'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
      selectedInterface={selectedInterface}
      setSelectedInterface={setSelectedInterface}
      options={device?.systemInformation?.networkInterfaces?.map((e, index) => {
        return {
          label: `${e.ifaceName} ${e.ip4 ? `(${e.ip4})` : ''}`,
          value: index,
        };
      })}
    />
  );
};

export default NetworkInterfacesTab;
