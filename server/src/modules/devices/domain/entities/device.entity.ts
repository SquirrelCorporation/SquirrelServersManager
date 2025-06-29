import { SsmAgent, SsmStatus, Systeminformation } from 'ssm-shared-lib';

/**
 * Device entity interface in the domain layer
 */
export interface IDevice {
  _id: string;
  uuid: string;
  disabled?: boolean;
  capabilities: {
    containers: {
      docker?: {
        enabled: boolean;
      };
      proxmox?: {
        enabled: boolean;
      };
      lxd?: {
        enabled: boolean;
      };
    };
  };
  configuration: {
    containers: {
      proxmox?: {
        watchContainersCron?: string;
      };
      docker?: {
        watchContainers?: boolean;
        watchContainersCron?: string;
        watchContainersStats?: boolean;
        watchContainersStatsCron?: string;
        watchEvents?: boolean;
        watchAll?: boolean;
      };
    };
    systemInformation?: {
      system?: {
        watch?: boolean;
        cron?: string;
      };
      os?: {
        watch?: boolean;
        cron?: string;
      };
      cpu?: {
        watch?: boolean;
        cron?: string;
      };
      cpuStats?: {
        watch?: boolean;
        cron?: string;
      };
      mem?: {
        watch?: boolean;
        cron?: string;
      };
      memStats?: {
        watch?: boolean;
        cron?: string;
      };
      networkInterfaces?: {
        watch?: boolean;
        cron?: string;
      };
      versions?: {
        watch?: boolean;
        cron?: string;
      };
      usb?: {
        watch?: boolean;
        cron?: string;
      };
      wifi?: {
        watch?: boolean;
        cron?: string;
      };
      bluetooth?: {
        watch?: boolean;
        cron?: string;
      };
      graphics?: {
        watch?: boolean;
        cron?: string;
      };
      fileSystems?: {
        watch?: boolean;
        cron?: string;
      };
      fileSystemsStats?: {
        watch?: boolean;
        cron?: string;
      };
    };
  };
  dockerVersion?: string;
  dockerId?: string;
  hostname?: string;
  fqdn?: string;
  status: SsmStatus.DeviceStatus;
  uptime?: number;
  systemInformation: {
    system?: Systeminformation.SystemData;
    os?: Systeminformation.OsData;
    cpu?: Systeminformation.CpuData;
    mem?: Partial<Systeminformation.MemData>;
    networkInterfaces?: Systeminformation.NetworkInterfacesData[];
    versions?: Systeminformation.VersionData;
    usb?: Systeminformation.UsbData[];
    wifi?: Systeminformation.WifiInterfaceData[];
    bluetooth?: Systeminformation.BluetoothDeviceData[];
    graphics?: Systeminformation.GraphicsData;
    memLayout?: Systeminformation.MemLayoutData[];
    fileSystems?: Systeminformation.DiskLayoutData[];
    cpuStats?: { lastUpdatedAt: string };
    memStats?: { lastUpdatedAt: string };
    fileSystemsStats?: { lastUpdatedAt: string };
  };
  ip?: string;
  agentVersion?: string;
  createdAt?: Date;
  updatedAt?: Date;
  agentLogPath?: string;
  agentType?: SsmAgent.InstallMethods;
}
