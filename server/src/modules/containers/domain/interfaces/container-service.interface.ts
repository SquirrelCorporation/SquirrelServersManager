import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { IDevice, IDeviceAuth } from '@modules/devices';
import { PreCheckDockerConnectionDto } from '@modules/containers/presentation/dtos/pre-check-docker-connection.dto';
import { IContainer } from '../../domain/entities/container.entity';

export const CONTAINER_SERVICE = 'CONTAINER_SERVICE';

/**
 * Service interface for container operations
 */
export interface IContainerService {
  /**
   * Get all containers
   */
  getAllContainers(): Promise<IContainer[]>;

  /**
   * Get containers by device UUID
   */
  getContainersByDeviceUuid(deviceUuid: string): Promise<IContainer[]>;

  /**
   * Find a container by its ID
   */
  getContainerById(id: string): Promise<IContainer | null>;

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
  createContainer(deviceUuid: string, containerData: IContainer): Promise<IContainer>;

  /**
   * Update a container's details
   */
  updateContainer(id: string, container: IContainer): Promise<IContainer>;

  /**
   * Delete a container by its UUID
   */
  deleteContainer(id: string): Promise<boolean>;

  /**
   * Get containers by watcher name
   */
  getContainersByWatcher(watcherName: string): Promise<IContainer[]>;

  /**
   * Get a container by its Docker ID
   */
  getContainerById(id: string): Promise<IContainer>;

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
  normalizeContainer(container: IContainer): IContainer;

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

  /**
   * Precheck Docker connection
   */
  preCheckDockerConnection(preCheckDto: PreCheckDockerConnectionDto): Promise<any>;

  /**
   * Update container name
   */
  updateContainerName(id: string, name: string): Promise<IContainer>;

  /**
   * Refresh all containers
   */
  refreshAllContainers(): Promise<void>;
}
