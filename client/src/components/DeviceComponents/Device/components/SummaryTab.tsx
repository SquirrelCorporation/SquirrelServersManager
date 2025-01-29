import { CPULogoSrc } from '@/components/DeviceComponents/CPULogo';
import SystemInformationView from '@/components/DeviceComponents/Device/components/SystemInformationView';
import { OsLogo } from '@/components/DeviceComponents/OsLogo/OsLogo';
import {
  ElNetwork,
  FileSystem,
  GraphicsCard,
  GrommetIconsSystem,
  HardwareCircuit,
  Raspberrypi,
  WhhCpu,
  WhhRam,
} from '@/components/Icons/CustomIcons';
import { capitalizeFirstLetter } from '@/utils/strings';
import React from 'react';
import { API } from 'ssm-shared-lib';

type SummaryTabProps = {
  device: API.DeviceItem;
};

const SummaryTab: React.FC<SummaryTabProps> = ({ device }) => {
  const importantInfo = [];
  if (device?.systemInformation?.os?.distro) {
    importantInfo.push({
      title: 'OS Version',
      value: `${device.systemInformation.os.distro ?? ''} ${device.systemInformation.os.release ?? ''} `,
      icon: (
        <GrommetIconsSystem style={{ fontSize: '24px', color: '#1890ff' }} />
      ),
      secondaryIcon: OsLogo(device.systemInformation.os.logofile),
    });
  }
  if (device?.systemInformation?.system?.raspberry?.type) {
    importantInfo.push({
      title: 'Raspberry Pi',
      value: `${device.systemInformation.system.raspberry.type} `,
      secondaryIcon: OsLogo('raspbian'),
      icon: <Raspberrypi style={{ fontSize: '24px', color: '#bd0f0f' }} />,
    });
  }
  if (device?.systemInformation?.cpu?.speed) {
    importantInfo.push({
      title: 'CPU',
      value: `${device.systemInformation.cpu.brand ?? ''} ${device.systemInformation.cpu.speed ? device.systemInformation.cpu.speed + 'GHz' : ''}`,
      icon: <WhhCpu style={{ fontSize: '24px', color: '#faad14' }} />,
      secondaryIcon: CPULogoSrc(
        device.systemInformation.cpu.brand,
        device.systemInformation?.os?.arch,
      ),
    });
  }
  if (device?.systemInformation?.mem?.total) {
    importantInfo.push({
      title: 'Memory',
      value: `~${device.systemInformation.mem.total ? Math.ceil(device.systemInformation.mem.total / (1024 * 1024 * 1024)) : ''} Gb`,
      icon: <WhhRam style={{ fontSize: '24px', color: '#faad14' }} />,
    });
  }
  // Detailed info with associated icons
  const detailedInfo = [];
  if (
    device?.systemInformation?.cpu?.vendor ||
    device?.systemInformation?.cpu?.manufacturer
  ) {
    detailedInfo.push({
      key: 'Processor',
      value: `${device.systemInformation.cpu.vendor ?? device.systemInformation.cpu.manufacturer ?? ''} - ${device.systemInformation.cpu.brand ?? ''}`,
      icon: <WhhCpu />,
      color: '#979347',
    });
  }
  if (device?.systemInformation?.cpu?.cores) {
    const efficiency = device.systemInformation.cpu.efficiencyCores
      ? `${device.systemInformation.cpu.efficiencyCores} Efficiency`
      : undefined;
    const performance = device.systemInformation.cpu.performanceCores
      ? `${device.systemInformation.cpu.performanceCores} Performance`
      : undefined;
    const physical = device.systemInformation.cpu.physicalCores
      ? `${device.systemInformation.cpu.physicalCores} Physical`
      : undefined;
    const coreDetails = [efficiency, performance, physical]
      .filter(Boolean)
      .join(' + ');
    detailedInfo.push({
      key: 'Cores',
      value: `${device.systemInformation.cpu.cores}-Cores (${coreDetails})`,
      icon: <HardwareCircuit />,
      color: '#9a1010',
    });
  }
  if (
    device?.systemInformation?.fileSystems &&
    device?.systemInformation?.fileSystems.length > 0
  ) {
    const totalDiskSpace = device.systemInformation.fileSystems.reduce(
      (acc: any, disk: { size: any }) => acc + disk.size,
      0,
    );
    detailedInfo.push({
      key: 'Disk Space',
      value: `~${Math.ceil(totalDiskSpace / (1024 * 1024 * 1024))} GB`,
      icon: <FileSystem />,
      color: '#406471',
    });
  }
  if (
    device?.systemInformation?.graphics?.controllers &&
    device?.systemInformation?.graphics?.controllers.length > 0
  ) {
    const graphicsControllersSummary =
      device.systemInformation.graphics.controllers
        .map(
          (controller: { vendor: any; model?: any }) =>
            `${controller.vendor} ${controller?.model ? '-' : ''} ${controller?.model}`,
        )
        .join(', ');
    detailedInfo.push({
      key: 'Graphics',
      value: `${graphicsControllersSummary}`,
      icon: <GraphicsCard />,
      color: '#412d47',
    });
  }
  if (device?.systemInformation?.os?.arch) {
    detailedInfo.push({
      key: 'Arch',
      value: `${device.systemInformation.os.arch}`,
      icon: <GrommetIconsSystem />,
      color: '#252987',
    });
  }
  if (device?.systemInformation?.networkInterfaces) {
    const defaultInterface = device.systemInformation.networkInterfaces.find(
      (e: { default: boolean }) => e.default,
    );
    if (defaultInterface) {
      detailedInfo.push({
        key: 'Network',
        value: `Default: ${defaultInterface.type ? capitalizeFirstLetter(defaultInterface.type) : ''}, ${defaultInterface.ip4 ?? ''}`,
        icon: <ElNetwork />,
        color: '#4c4e51',
      });
    }
  }
  return (
    <SystemInformationView
      name={'Summary'}
      importantInfo={importantInfo}
      detailedInfo={detailedInfo}
    />
  );
};

export default SummaryTab;
