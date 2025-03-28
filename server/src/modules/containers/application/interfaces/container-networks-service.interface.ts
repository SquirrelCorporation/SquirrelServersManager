import { IContainerNetworkEntity } from '../../domain/entities/container-network.entity';

export const CONTAINER_NETWORKS_SERVICE = 'CONTAINER_NETWORKS_SERVICE';

/**
 * Interface for the Container Networks Service
 */
export interface IContainerNetworksService {
  getAllNetworks(): Promise<IContainerNetworkEntity[]>;

  /**
   * Get all networks for a specific device
   */
  getNetworksByDeviceUuid(deviceUuid: string): Promise<IContainerNetworkEntity[]>;

  /**
   * Get a specific network by UUID
   */
  getNetworkById(id: string): Promise<IContainerNetworkEntity | null>;

  /**
   * Create a network on a device
   */
  createNetwork(
    deviceUuid: string,
    network: Partial<IContainerNetworkEntity>,
  ): Promise<IContainerNetworkEntity>;

  /**
   * Update a network
   */
  updateNetwork(
    id: string,
    network: Partial<IContainerNetworkEntity>,
  ): Promise<IContainerNetworkEntity>;

  /**
   * Delete a network
   */
  deleteNetwork(id: string): Promise<boolean>;

  /**
   * Connect a container to a network
   */
  connectContainerToNetwork(networkId: string, containerUuid: string): Promise<boolean>;

  /**
   * Disconnect a container from a network
   */
  disconnectContainerFromNetwork(networkId: string, containerUuid: string): Promise<boolean>;
}
