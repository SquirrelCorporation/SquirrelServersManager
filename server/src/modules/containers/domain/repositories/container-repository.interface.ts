import { IContainerEntity } from '../entities/container.entity';

export const CONTAINER_REPOSITORY = 'CONTAINER_REPOSITORY';

/**
 * Interface for the Container Repository
 */
export interface IContainerRepository {
  /**
   * Find all containers
   */
  findAll(): Promise<IContainerEntity[]>;

  /**
   * Find one container by ID
   */
  findOneById(id: string): Promise<IContainerEntity | null>;

  /**
   * Find all containers by device UUID
   */
  findAllByDeviceUuid(deviceUuid: string): Promise<IContainerEntity[]>;

  /**
   * Find all containers by watcher name
   */
  findAllByWatcher(watcher: string): Promise<IContainerEntity[]>;

  /**
   * Create a new container
   */
  create(container: IContainerEntity): Promise<IContainerEntity>;

  /**
   * Update a container by UUID
   */
  update(uuid: string, data: Partial<IContainerEntity>): Promise<IContainerEntity>;

  /**
   * Delete a container by UUID
   */
  deleteById(id: string): Promise<boolean>;

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