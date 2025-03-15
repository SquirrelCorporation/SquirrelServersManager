import { ContainerNetworkEntity } from '../entities/container-network.entity';

export const CONTAINER_NETWORK_REPOSITORY = 'CONTAINER_NETWORK_REPOSITORY';

/**
 * Repository interface for container network operations
 */
export interface ContainerNetworkRepositoryInterface {
  /**
   * Find all networks
   */
  findAll(): Promise<ContainerNetworkEntity[]>;

  /**
   * Find all networks by device UUID
   */
  findAllByDeviceUuid(deviceUuid: string): Promise<ContainerNetworkEntity[]>;

  /**
   * Find one network by its UUID
   */
  findOneByUuid(uuid: string): Promise<ContainerNetworkEntity | null>;

  /**
   * Find one network by its name and device UUID
   */
  findOneByNameAndDeviceUuid(name: string, deviceUuid: string): Promise<ContainerNetworkEntity | null>;

  /**
   * Save a network
   */
  save(network: ContainerNetworkEntity): Promise<ContainerNetworkEntity>;

  /**
   * Create a network
   */
  create(network: ContainerNetworkEntity): Promise<ContainerNetworkEntity>;

  /**
   * Update a network
   */
  update(uuid: string, network: Partial<ContainerNetworkEntity>): Promise<ContainerNetworkEntity>;

  /**
   * Delete a network by UUID
   */
  deleteByUuid(uuid: string): Promise<boolean>;

  /**
   * Delete all networks by device UUID
   */
  deleteAllByDeviceUuid(deviceUuid: string): Promise<boolean>;
}