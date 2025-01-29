import CPUTab from '@/components/DeviceComponents/Device/components/CPUTab';
import FilesystemsTab from '@/components/DeviceComponents/Device/components/FilesystemsTab';
import MemoryTab from '@/components/DeviceComponents/Device/components/MemoryTab';
import NetworkInterfacesTab from '@/components/DeviceComponents/Device/components/NetworkInterfacesTab';
import OSTab from '@/components/DeviceComponents/Device/components/OSTab';
import SummaryTab from '@/components/DeviceComponents/Device/components/SummaryTab';
import SystemTab from '@/components/DeviceComponents/Device/components/SystemTab';
import USBTab from '@/components/DeviceComponents/Device/components/USBTab';
import WifiTab from '@/components/DeviceComponents/Device/components/WifiTab';
import {
  ElNetwork,
  FileSystem,
  GrommetIconsSystem,
  HardwareCircuit,
  Usb,
  WhhCpu,
  WhhRam,
  Wifi,
} from '@/components/Icons/CustomIcons';
import {
  Avatar,
  Card,
  Col,
  List,
  Modal,
  Row,
  Tabs,
  TabsProps,
  Typography,
} from 'antd';
import { motion } from 'framer-motion';
import React, { useImperativeHandle, useState } from 'react';
import { API } from 'ssm-shared-lib';

export interface DeviceInformationModalHandles {
  open: () => void;
}

type DeviceModalProps = {
  device: API.DeviceItem;
};

const DeviceInformationModal = React.forwardRef<
  DeviceInformationModalHandles,
  DeviceModalProps
>(({ device }, ref) => {
  const [visible, setVisible] = useState(false);

  const open = () => {
    setVisible(true);
  };

  useImperativeHandle(ref, () => ({ open }));

  const items: TabsProps['items'] = [
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
      width={1000}
      destroyOnClose
      okText={'Close'}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <Tabs
        onChange={(key: string) => {
          console.log(key);
        }}
        items={items}
      />
    </Modal>
  );
});

export default DeviceInformationModal;
