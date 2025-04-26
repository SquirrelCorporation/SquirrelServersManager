import { ProxmoxModel, SsmProxmox } from 'ssm-shared-lib';
import { IDevice } from '../../../devices/domain/entities/device.entity';

// Domain Entity Interface - Represents the core business object
export interface IProxmoxContainer {
  uuid: string; // Unique identifier for the container within SSM
  deviceUuid: string; // UUID of the parent device
  device?: IDevice; // Populated device information (optional)

  id: string; // Proxmox specific ID (vmid)
  name: string; // Proxmox specific name
  customName?: string; // User-defined name
  displayName?: string; // Name shown in UI (could be customName or name)
  displayIcon?: string; // Icon shown in UI

  status: string; // e.g., 'running', 'stopped', 'unknown'
  watcher: string; // Identifier for the watcher process managing this container
  node: string; // Proxmox node name
  hostname?: string; // Guest hostname
  type: SsmProxmox.ContainerType; // 'lxc' or 'qemu'

  // Configuration details (kept flexible as per original schema)
  config: ProxmoxModel.nodesLxcConfigVmConfig | ProxmoxModel.nodesQemuConfigVmConfig;
  // Network interface details (kept flexible)
  interfaces?: ProxmoxModel.nodesLxcInterfacesIp[];

  // Timestamps managed by the database
  createdAt?: Date;
  updatedAt?: Date;
}
