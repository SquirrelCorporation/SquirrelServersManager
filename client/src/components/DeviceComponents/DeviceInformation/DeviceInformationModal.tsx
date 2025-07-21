import CPUTab from '@/components/DeviceComponents/DeviceInformation/components/CPUTab';
import FilesystemsTab from '@/components/DeviceComponents/DeviceInformation/components/FilesystemsTab';
import GraphicsTab from '@/components/DeviceComponents/DeviceInformation/components/GraphicsTab';
import MemoryTab from '@/components/DeviceComponents/DeviceInformation/components/MemoryTab';
import NetworkInterfacesTab from '@/components/DeviceComponents/DeviceInformation/components/NetworkInterfacesTab';
import OSTab from '@/components/DeviceComponents/DeviceInformation/components/OSTab';
import SummaryTab from '@/components/DeviceComponents/DeviceInformation/components/SummaryTab';
import SystemTab from '@/components/DeviceComponents/DeviceInformation/components/SystemTab';
import USBTab from '@/components/DeviceComponents/DeviceInformation/components/USBTab';
import WifiTab from '@/components/DeviceComponents/DeviceInformation/components/WifiTab';
import {
  ElNetwork,
  FileSystem,
  GraphicsCard,
  GrommetIconsSystem,
  HardwareCircuit,
  Usb,
  WhhCpu,
  WhhRam,
  Wifi,
} from '@/components/Icons/CustomIcons';
import { Modal } from 'antd';
import React, { useImperativeHandle, useState } from 'react';
import { API } from 'ssm-shared-lib';
import ModalStyledTabs from '@/components/Layout/ModalStyledTabs';

export interface DeviceInformationModalHandles {
  open: () => void;
}

type DeviceModalProps = {
  device: API.DeviceItem;
};

const MODAL_WIDTH = 1200;

const DeviceInformationModal = React.forwardRef<
  DeviceInformationModalHandles,
  DeviceModalProps
>(({ device }, ref) => {
  const [visible, setVisible] = useState(false);

  const open = () => {
    setVisible(true);
  };

  useImperativeHandle(ref, () => ({ open }));

  const items = [
    {
      key: 'summary',
      label: 'Summary',
      icon: <GrommetIconsSystem />,
      children: <SummaryTab device={device} />,
    },
    {
      key: 'os',
      label: 'OS',
      icon: <GrommetIconsSystem />,
      children: <OSTab device={device} />,
    },
    {
      key: 'system',
      label: 'System',
      icon: <HardwareCircuit />,
      children: <SystemTab device={device} />,
    },
    {
      key: 'cpu',
      label: 'CPU',
      icon: <WhhCpu />,
      children: <CPUTab device={device} />,
    },
    {
      key: 'mem',
      label: 'Memory',
      icon: <WhhRam />,
      children: <MemoryTab device={device} />,
    },
    {
      key: 'networks',
      label: 'Networks',
      icon: <ElNetwork />,
      children: <NetworkInterfacesTab device={device} />,
    },
    {
      key: 'filesystems',
      label: 'FileSystems',
      icon: <FileSystem />,
      children: <FilesystemsTab device={device} />,
    },
    {
      key: 'graphics',
      label: 'Graphics',
      icon: <GraphicsCard />,
      children: <GraphicsTab device={device} />,
    },
    {
      key: 'wifi',
      label: 'Wifi',
      icon: <Wifi />,
      children: <WifiTab device={device} />,
    },
    {
      key: 'usb',
      label: 'USB',
      icon: <Usb />,
      children: <USBTab device={device} />,
    },
  ];
  return (
    <Modal
      title="Device Information"
      open={visible}
      onCancel={() => setVisible(false)}
      style={{ padding: '32px 40px 48px' }}
      width={MODAL_WIDTH}
      destroyOnClose
      okText={'Close'}
      onOk={() => setVisible(false)}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <ModalStyledTabs
        tabItems={items}
        onChange={(key: string) => {
          console.log(key);
        }}
      />
    </Modal>
  );
});

export default DeviceInformationModal;
