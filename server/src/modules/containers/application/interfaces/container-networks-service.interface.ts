import { ContainerNetworkEntity } from '../../domain/entities/container-network.entity';

export const CONTAINER_NETWORKS_SERVICE = 'CONTAINER_NETWORKS_SERVICE';

/**
 * Interface for the Container Networks Service
 */
export interface ContainerNetworksServiceInterface {

  getAllNetworks(): Promise<ContainerNetworkEntity[]>;

  /**
   * Get all networks for a specific device
   */
  getNetworksByDeviceUuid(deviceUuid: string): Promise<ContainerNetworkEntity[]>;

  /**
   * Get a specific network by UUID
   */
  getNetworkByUuid(uuid: string): Promise<ContainerNetworkEntity | null>;

  /**
   * Create a network on a device
   */
  createNetwork(deviceUuid: string, network: Partial<ContainerNetworkEntity>): Promise<ContainerNetworkEntity>;

  /**
   * Update a network
   */
  updateNetwork(uuid: string, network: Partial<ContainerNetworkEntity>): Promise<ContainerNetworkEntity>;

  /**
   * Delete a network
   */
  deleteNetwork(uuid: string): Promise<boolean>;

  /**
   * Connect a container to a network
   */
  connectContainerToNetwork(networkUuid: string, containerUuid: string): Promise<boolean>;

  /**
   * Disconnect a container from a network
   */
  disconnectContainerFromNetwork(networkUuid: string, containerUuid: string): Promise<boolean>;
}