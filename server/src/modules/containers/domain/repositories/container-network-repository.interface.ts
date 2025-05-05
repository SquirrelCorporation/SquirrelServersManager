import { IContainerNetwork } from '../entities/container-network.entity';

export const CONTAINER_NETWORK_REPOSITORY = 'CONTAINER_NETWORK_REPOSITORY';

/**
 * Repository interface for container network operations
 */
export interface IContainerNetworkRepository {
  /**
   * Find all networks
   */
  findAll(): Promise<IContainerNetwork[]>;

  /**
   * Find all networks by device UUID
   */
  findAllByDeviceUuid(deviceUuid: string): Promise<IContainerNetwork[]>;

  /**
   * Find one network by its UUID
   */
  findOneById(id: string): Promise<IContainerNetwork | null>;

  /**
   * Find one network by its name and device UUID
   */
  findOneByNameAndDeviceUuid(
    name: string,
    deviceUuid: string,
  ): Promise<IContainerNetwork | null>;

  /**
   * Save a network
   */
  save(network: IContainerNetwork): Promise<IContainerNetwork>;

  /**
   * Create a network
   */
  create(network: Partial<IContainerNetwork>): Promise<IContainerNetwork>;

  /**
   * Update a network
   */
  update(id: string, network: Partial<IContainerNetwork>): Promise<IContainerNetwork>;

  /**
   * Delete a network by UUID
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Delete all networks by device UUID
   */
  deleteAllByDeviceUuid(deviceUuid: string): Promise<boolean>;
}
