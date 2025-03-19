import { IDevice, IDeviceAuth } from '@modules/devices';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { ContainerEntity } from '../../domain/entities/container.entity';

export const CONTAINER_SERVICE = 'CONTAINER_SERVICE';

/**
 * Service interface for container operations
 */
export interface ContainerServiceInterface {
  /**
   * Get all containers
   */
  getAllContainers(): Promise<ContainerEntity[]>;

  /**
   * Get one container by its UUID
   */
  getContainerByUuid(uuid: string): Promise<ContainerEntity | null>;

  /**
   * Get containers by device UUID
   */
  getContainersByDeviceUuid(deviceUuid: string): Promise<ContainerEntity[]>;

  /**
   * Find a container by its ID
   */
  findContainerById(id: string): Promise<ContainerEntity | null>;

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
  createContainer(
    deviceUuid: string,
    containerData: ContainerEntity
  ): Promise<ContainerEntity>;

  /**
   * Update a container's details
   */
  updateContainer(
    uuid: string,
    containerData: Partial<ContainerEntity>
  ): Promise<ContainerEntity>;

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
  getContainersByWatcher(watcherName: string): Promise<ContainerEntity[]>;

  /**
   * Get a container by its Docker ID
   */
  getContainerById(id: string): Promise<ContainerEntity | null>;

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
  normalizeContainer(container: ContainerEntity): ContainerEntity;

  /**
   * Delete a container by its ID
   */
  deleteContainerById(id: string): Promise<boolean>;

  /**
   * Get registry by name
   */
  getRegistryByName(name: string): Promise<AbstractRegistryComponent | null>;
}