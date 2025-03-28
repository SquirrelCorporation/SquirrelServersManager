import { IContainerNetworkEntity } from '../entities/container-network.entity';

export const CONTAINER_NETWORK_REPOSITORY = 'CONTAINER_NETWORK_REPOSITORY';

/**
 * Repository interface for container network operations
 */
export interface IContainerNetworkRepository {
  /**
   * Find all networks
   */
  findAll(): Promise<IContainerNetworkEntity[]>;

  /**
   * Find all networks by device UUID
   */
  findAllByDeviceUuid(deviceUuid: string): Promise<IContainerNetworkEntity[]>;

  /**
   * Find one network by its UUID
   */
  findOneById(id: string): Promise<IContainerNetworkEntity | null>;

  /**
   * Find one network by its name and device UUID
   */
  findOneByNameAndDeviceUuid(
    name: string,
    deviceUuid: string,
  ): Promise<IContainerNetworkEntity | null>;

  /**
   * Save a network
   */
  save(network: IContainerNetworkEntity): Promise<IContainerNetworkEntity>;

  /**
   * Create a network
   */
  create(network: Partial<IContainerNetworkEntity>): Promise<IContainerNetworkEntity>;

  /**
   * Update a network
   */
  update(id: string, network: Partial<IContainerNetworkEntity>): Promise<IContainerNetworkEntity>;

  /**
   * Delete a network by UUID
   */
  deleteById(id: string): Promise<boolean>;

  /**
   * Delete all networks by device UUID
   */
  deleteAllByDeviceUuid(deviceUuid: string): Promise<boolean>;
}
