import { ContainerEntity } from '../entities/container.entity';

export const CONTAINER_REPOSITORY = 'CONTAINER_REPOSITORY';

/**
 * Interface for the Container Repository
 */
export interface ContainerRepositoryInterface {
  /**
   * Find all containers
   */
  findAll(): Promise<ContainerEntity[]>;

  /**
   * Find one container by UUID
   */
  findOneByUuid(uuid: string): Promise<ContainerEntity | null>;

  /**
   * Find one container by ID
   */
  findOneById(id: string): Promise<ContainerEntity | null>;

  /**
   * Find all containers by device UUID
   */
  findAllByDeviceUuid(deviceUuid: string): Promise<ContainerEntity[]>;

  /**
   * Find all containers by watcher name
   */
  findAllByWatcher(watcher: string): Promise<ContainerEntity[]>;

  /**
   * Create a new container
   */
  create(container: ContainerEntity): Promise<ContainerEntity>;

  /**
   * Update a container by UUID
   */
  update(uuid: string, data: Partial<ContainerEntity>): Promise<ContainerEntity>;

  /**
   * Delete a container by UUID
   */
  deleteByUuid(uuid: string): Promise<boolean>;

  /**
   * Count containers by device UUID
   */
  countByDeviceUuid(deviceUuid: string): Promise<number>;

  /**
   * Count containers by status
   */
  countByStatus(status: string): Promise<number>;

  /**
   * Count all containers
   */
  count(): Promise<number>;

  /**
   * Update container status by watcher
   */
  updateStatusByWatcher(watcher: string, status: string): Promise<void>;
}