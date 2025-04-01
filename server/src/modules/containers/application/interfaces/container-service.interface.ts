import { IDevice, IDeviceAuth } from '@modules/devices';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { IContainerEntity } from '../../domain/entities/container.entity';

export const CONTAINER_SERVICE = 'CONTAINER_SERVICE';

/**
 * Service interface for container operations
 */
export interface IContainerService {
  /**
   * Get all containers
   */
  getAllContainers(): Promise<IContainerEntity[]>;

  /**
   * Get one container by its UUID
   */
  getContainerByUuid(uuid: string): Promise<IContainerEntity | null>;

  /**
   * Get containers by device UUID
   */
  getContainersByDeviceUuid(deviceUuid: string): Promise<IContainerEntity[]>;

  /**
   * Find a container by its ID
   */
  findContainerById(id: string): Promise<IContainerEntity | null>;

  /**
   * Count all containers
   */
  countContainers(): Promise<number>;

  /**
   * Count containers by status
   */
  countContainersByStatus(status: string): Promise<number>;

  /**
   * Create a container on a device
   */
  createContainer(deviceUuid: string, containerData: IContainerEntity): Promise<IContainerEntity>;

  /**
   * Update a container's details
   */
  updateContainer(
    uuid: string,
    containerData: Partial<IContainerEntity>,
  ): Promise<IContainerEntity>;

  /**
   * Delete a container by its UUID
   */
  deleteContainer(uuid: string): Promise<boolean>;

  /**
   * Start a container
   */
  startContainer(uuid: string): Promise<boolean>;

  /**
   * Stop a container
   */
  stopContainer(uuid: string): Promise<boolean>;

  /**
   * Restart a container
   */
  restartContainer(uuid: string): Promise<boolean>;

  /**
   * Pause a container
   */
  pauseContainer(uuid: string): Promise<boolean>;

  /**
   * Unpause a container
   */
  unpauseContainer(uuid: string): Promise<boolean>;

  /**
   * Kill a container
   */
  killContainer(uuid: string): Promise<boolean>;

  /**
   * Get container logs
   */
  getContainerLogs(uuid: string, options?: any): Promise<any>;

  /**
   * Get containers by watcher name
   */
  getContainersByWatcher(watcherName: string): Promise<IContainerEntity[]>;

  /**
   * Get a container by its Docker ID
   */
  getContainerById(id: string): Promise<IContainerEntity | null>;

  /**
   * Update container status for all containers associated with a watcher
   */
  updateContainerStatusByWatcher(watcherName: string, status: string): Promise<void>;

  /**
   * Get a device by its UUID
   */
  getDeviceByUuid(uuid: string): Promise<IDevice | null>;

  /**
   * Get authentication details for a device
   */
  getDeviceAuth(deviceUuid: string): Promise<IDeviceAuth | null>;

  /**
   * Get Docker SSH connection options for a device
   */
  getDockerSshConnectionOptions(device: IDevice, deviceAuth: IDeviceAuth): Promise<any>;

  /**
   * Update Docker information for a device
   */
  updateDeviceDockerInfo(deviceUuid: string, dockerId: string, version: string): Promise<void>;

  /**
   * Normalize a container
   */
  normalizeContainer(container: IContainerEntity): IContainerEntity;

  /**
   * Delete a container by its ID
   */
  deleteContainerById(id: string): Promise<boolean>;

  /**
   * Get registry by name
   */
  getRegistryByName(name: string): Promise<AbstractRegistryComponent | null>;

  /**
   * Execute a container action
   */
  executeContainerAction(id: string, action: string): Promise<boolean>;

  /**
   * Count containers by device UUID
   */
  countByDeviceUuid(deviceUuid: string): Promise<number>;

  /**
   * Check Docker connection
   */
  checkDockerConnection(deviceUuid: string): Promise<any>;
}
