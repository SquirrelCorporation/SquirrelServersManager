import { SsmContainer } from 'ssm-shared-lib';
// Import the new domain entity interface
import { IProxmoxContainer } from '../entities/proxmox-container.entity';

// Update Populated type to extend the domain entity
export interface PopulatedProxmoxContainer extends IProxmoxContainer {
  displayType: SsmContainer.ContainerTypes.PROXMOX;
}

export interface IProxmoxContainerRepository {
  findAll(): Promise<PopulatedProxmoxContainer[]>;
  updateOrCreate(
    container: Partial<IProxmoxContainer>, // Use domain entity
  ): Promise<IProxmoxContainer>; // Return domain entity
  findByUuid(uuid: string): Promise<IProxmoxContainer | null>;
  findByDeviceUuid(deviceUuid: string): Promise<IProxmoxContainer[]>;
  findByWatcher(watcher: string): Promise<IProxmoxContainer[]>;
  deleteByUuid(uuid: string): Promise<boolean>;
  deleteByDeviceUuid(deviceUuid: string): Promise<number>;
  create(
    containerDto: Partial<IProxmoxContainer>, // Use domain entity
  ): Promise<IProxmoxContainer>; // Return domain entity
  update(
    uuid: string,
    updates: Partial<IProxmoxContainer>, // Use domain entity
  ): Promise<IProxmoxContainer | null>;
  countByDeviceUuid(deviceUuid: string): Promise<number>;
  countByStatus(status: string): Promise<number>;
  countAll(): Promise<number>;
  updateStatusByWatcher(watcher: string, status: string): Promise<number>;
}

// Define Injection Token (optional but good practice)
export const PROXMOX_CONTAINER_REPOSITORY = 'ProxmoxContainerRepository';
