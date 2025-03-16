import { ContainerEntity } from '../../domain/entities/container.entity';
import { SSMServicesTypes } from '../../../../types/typings.d';

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
    containerData: SSMServicesTypes.CreateContainerParams
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
}